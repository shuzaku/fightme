<!-- @format -->
<template>
    <div ref="videoViewRef" class="tournament-view">
        <tournament-nav
            :tournamentId="tournamentId"
            :account="account"
            @filter:game="filterGame($event)"
            @filter:bracket="filterBracket($event)"
        />

        <!-- ── Top Players ─────────────────────────────────────────────── -->
        <div v-if="topPlayers.length > 0" class="tv-top-players">
            <span class="tv-section-label">Top Players</span>
            <div class="tv-players-scroll">
                <button
                    v-for="player in topPlayers"
                    :key="player.id"
                    :class="['tv-player-chip', { active: playerFilter === player.id }]"
                    @click="filterPlayer(player)"
                >
                    <span class="tv-player-name">{{ player.name }}</span>
                    <span class="tv-player-count">{{ player.count }}W</span>
                </button>
            </div>
        </div>

        <loading v-if="loading && videos.length <= 0"></loading>
        <div v-else-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <tournament-match-video-card
                    v-if="video.contentType === 'Tournament Match'"
                    v-model="video.isPlaying"
                    :video="video"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
            </div>
        </div>
    </div>
</template>

<script>
import TournamentMatchService from '@/services/tournament-match-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import TournamentNav from '@/components/tournament/tournament-nav';
import Loading from '@/components/common/loading';
import ExploreCharacters from '@/components/explore/explore-characters';

import { eventbus } from '@/main';
import { setOgMeta, tournamentOgUrl } from '@/services/og-meta-service';
import { injectJsonLd, removeJsonLd, buildSportsEvent } from '@/services/json-ld-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';

export default {
    name: 'Tournament',

    components: {
        'tournament-match-video-card': TournamentMatchVideoCard,
        'tournament-nav': TournamentNav,
        loading: Loading,
        'explore-characters': ExploreCharacters,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            videos: [],
            query: null,
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null,
            loading: false,
            isLast: false,
            savedSearchParam: null,
            bracketFilter: null,
            gameFilter: null,
            playerFilter: null,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length || 0;
        },

        tournamentId: function () {
            return this.$route.params.id;
        },

        topPlayers() {
            // Count match appearances per player across loaded videos
            const counts = {};
            this.videos.forEach((video) => {
                const allPlayers = [
                    ...(video.match.team1Players || []),
                    ...(video.match.team2Players || []),
                ];
                allPlayers.forEach((p) => {
                    if (!p || !p.id) return;
                    const key = String(p.id);
                    if (!counts[key]) counts[key] = { id: key, name: p.name, count: 0 };
                    counts[key].count++;
                });
            });
            return Object.values(counts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 12);
        },
    },

    watch: {
        tournamentId: function () {
            this.loading = true;
            this.videos = [];
            this.isLast = false;
            this.gameFilter = null;
            this.bracketFilter = null;
            this.playerFilter = null;
            this.queryVideos();
            this.loading = false;
        },
    },

    mounted() {
        this.queryVideos();
        if (this.tournamentId) {
            setOgMeta({
                title: 'Tournament',
                description: 'Watch tournament match footage and browse brackets on Fighters Edge.',
                imageUrl: tournamentOgUrl(this.tournamentId),
                pageUrl: `https://fighters-edge.com/tournament/${this.tournamentId}`,
            });
        }
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('account:update', this.updateFavorites);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted');
        eventbus.$off('search');
        eventbus.$off('account:update');
        removeJsonLd();
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.isLast = false;
            this.sort = sort;
            this.queryVideos();
        },

        applyFilter(filter) {
            this.videos = [];
            this.isLast = false;
            this.filter = filter;
            this.queryVideos();
        },

        async queryVideos(queryParam) {
            if (this.isLast || this.loading) {
                return;
            }

            this.loading = true;

            this.savedSearchParam = queryParam;

            var queryParameter = {
                skip: this.skip,
                sort: this.sort,
                filter: this.filter,
                searchQuery: [],
                id: this.tournamentId,
            };

            if (queryParam && queryParam.length > 0) {
                queryParameter.searchQuery.push(...queryParam);
            }

            try {
                const response = await TournamentMatchService.getTournamentMatches(queryParameter);
                const batch = response.data.matches || [];
                if (batch.length === 0) {
                    this.isLast = true;
                } else {
                    this.hydrateVideos(response);
                }
            } catch (e) {
                console.error('queryVideos error:', e);
            } finally {
                this.loading = false;
            }
        },

        hydrateVideos(response) {
            const firstVideo = response.data.matches[0];
            if (firstVideo && this.videos.length === 0) {
                const t = firstVideo.Tournament && firstVideo.Tournament[0];
                const tName = t ? t.Name : null;
                const tDate = t ? t.Date || t.StartDate || null : null;
                const pageUrl = `https://fighters-edge.com/tournament/${this.tournamentId}`;

                if (tName) {
                    setOgMeta({
                        title: tName,
                        description: `Watch every indexed match from ${tName} on Fighters Edge.`,
                        imageUrl: tournamentOgUrl(this.tournamentId),
                        pageUrl,
                    });

                    injectJsonLd(
                        buildSportsEvent({
                            name: tName,
                            pageUrl,
                            startDate: tDate || undefined,
                            sport: 'Fighting game',
                        })
                    );
                }
            }
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Tournament Match',
                    isEditing: false,
                    isPlaying: false,
                    videoUrl: video.VideoUrl,
                    game: {
                        title: video.Game[0].Title,
                        logoUrl: video.Game[0].LogoUrl,
                        id: video.Game[0]._id,
                    },
                    match: {
                        team1Players: video.Team1Players.map((player) => {
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: video.Team1Player.filter(
                                    (searchPlayer) => searchPlayer._id === player.Id
                                )[0].Name,
                                characters: this.hydrateCharacters(
                                    player.CharacterIds,
                                    video.Team1PlayerCharacters
                                ),
                            };
                        }),
                        team2Players: video.Team2Players.map((player) => {
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: video.Team2Player.filter(
                                    (searchPlayer) => searchPlayer._id === player.Id
                                )[0].Name,
                                characters: this.hydrateCharacters(
                                    player.CharacterIds,
                                    video.Team2PlayerCharacters
                                ),
                            };
                        }),
                        startTime: video.ClipStart ? this.convertTime(video.ClipStart) : null,
                        endTime: video.ClipEnd ? this.convertTime(video.ClipEnd) : null,
                        notes: video.Notes || null,
                        secondaryNotes: video.SecondaryNotes || null,
                    },
                    tournament: {
                        name: video.Tournament[0].Name,
                        logoUrl: video.Tournament[0].Image,
                    },
                    videoType: video.VideoPlatform,
                });
            });
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push({
                    name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                    id: filteredCharacter[0]._id,
                    imageUrl: filteredCharacter[0].AvatarUrl,
                });
            });
            return playerCharacters;
        },

        convertTime(time) {
            var a = time.split(':');
            var n = a.length;
            var minutesToSeconds = null;
            var hoursToSeconds = null;
            var seconds = 0;
            if (n === 3) {
                hoursToSeconds = parseInt(a[0]) * 3600;
                minutesToSeconds = parseInt(a[1]) * 60;
                seconds = hoursToSeconds + minutesToSeconds + parseInt(a[2]);
            } else if (n === 2) {
                minutesToSeconds = parseInt(a[0]) * 60;
                seconds = minutesToSeconds + parseInt(a[1]);
            } else {
                return parseInt(a[0]);
            }
            seconds === 0 ? seconds++ : seconds;
            return seconds;
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find((video) => video.matchId === objectId);
            if (going === this.$waypointMap.GOING_IN && direction) {
                featuredVideo.isPlaying = true;
            }

            if (going === this.$waypointMap.GOING_OUT && direction) {
                featuredVideo.isPlaying = false;
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },

        filterGame(queryParam) {
            this.videos = [];
            this.isLast = false;
            this.gameFilter = queryParam || null;
            this.bracketFilter = null;
            this.playerFilter = null;
            this.queryVideos(this.activeFilters());
        },

        filterBracket(queryParam) {
            this.videos = [];
            this.isLast = false;
            this.bracketFilter = queryParam || null;
            this.playerFilter = null;
            this.queryVideos(this.activeFilters());
        },

        activeFilters() {
            return [this.gameFilter, this.bracketFilter, this.playerFilter].filter(Boolean);
        },

        filterPlayer(player) {
            this.videos = [];
            this.isLast = false;
            // Toggle: clicking the active player clears the filter
            if (this.playerFilter === player.id) {
                this.playerFilter = null;
            } else {
                this.playerFilter = player.id;
            }
            const playerQuery = this.playerFilter
                ? { queryName: 'PlayerId', queryValue: this.playerFilter }
                : null;
            this.queryVideos([this.gameFilter, this.bracketFilter, playerQuery].filter(Boolean));
        },

        handleScroll() {
            if (isNearDocumentBottom() && !this.loading) {
                this.fetchVideos();
            }
        },

        async fetchVideos() {
            this.queryVideos(this.activeFilters());
        },
    },
};
</script>

<style>
.tournament-view {
    position: relative;
    padding: 200px 20px 40px;
    height: 100%;
    overflow: visible;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.tournament-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.tournament-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.tournament-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.tournament-view .videos-container {
    position: relative;
    width: 100%;
}

.tournament-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

/* ── Top Players strip ───────────────────────────────────────────────────── */
.tv-top-players {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    flex-wrap: nowrap;
    min-width: 0;
}

.tv-section-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
}

.tv-players-scroll {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex: 1;
    min-width: 0;
}

.tv-players-scroll::-webkit-scrollbar {
    display: none;
}

.tv-player-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.75);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    text-decoration: none;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    flex-shrink: 0;
}

.tv-player-chip:hover {
    background: rgba(62, 180, 137, 0.1);
    border-color: rgba(62, 180, 137, 0.35);
    color: rgba(255, 255, 255, 0.9);
}

.tv-player-chip.active {
    background: rgba(62, 180, 137, 0.15);
    border-color: #3eb489;
    color: #3eb489;
}

.tv-player-chip.active .tv-player-count {
    background: rgba(62, 180, 137, 0.25);
}

.tv-player-count {
    font-size: 10px;
    font-weight: 700;
    color: #3eb489;
    background: rgba(62, 180, 137, 0.12);
    border-radius: 10px;
    padding: 1px 6px;
}
</style>
