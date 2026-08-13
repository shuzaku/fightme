<!-- @format -->
<template>
    <div ref="videoViewRef" class="player-view">
        <player-nav
            :playerId="playerId"
            :account="account"
            :playerSlug="playerSlug"
            @player-filter:update="filterQuery($event)"
            @query-tournament-matches="queryTournamentMatches()"
            @query-online-matches="queryVideos()"
            @query-tournament-history="queryTournamentHistory()"
        />
        <player-tournament-history
            v-if="isHistory"
            :entries="historyEntries"
            :isLoading="historyLoading"
            :isLast="historyIsLast"
            :years="historyYears"
            :games="historyGames"
            :selectedYear="historyYear"
            :selectedGameId="historyGameId"
            @change-filter="changeHistoryFilter($event)"
        />
        <div v-if="!isHistory && videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :matchId="video.matchId"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                />

                <tournament-match-video-card
                    v-if="video.contentType === 'Tournament Match'"
                    v-model="video.isPlaying"
                    :video="video"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
            </div>

            <div v-if="isLast" class="feed-end">
                <v-icon class="feed-end-icon">mdi-check-circle-outline</v-icon>
                <p class="feed-end-title">You're all caught up</p>
                <p v-if="!isTournament" class="feed-end-subtitle">
                    No more online matches for this player. Check out their tournament footage or explore related content.
                </p>
                <p v-else class="feed-end-subtitle">
                    No more tournament matches for this player. Check out their online matches or explore related content.
                </p>
                <div class="feed-end-actions">
                    <v-btn v-if="!isTournament" small outlined class="feed-end-btn" @click="queryTournamentMatches()">
                        Tournament Matches
                    </v-btn>
                    <v-btn v-else small outlined class="feed-end-btn" @click="queryVideos()">
                        Online Matches
                    </v-btn>
                    <v-btn
                        v-if="suggestedCharacterId"
                        small outlined class="feed-end-btn"
                        @click="$router.push(`/character/${suggestedCharacterSlug || suggestedCharacterId}`)"
                    >
                        Browse Character
                    </v-btn>
                    <v-btn
                        v-if="suggestedGameId"
                        small outlined class="feed-end-btn"
                        @click="$router.push(`/game/${suggestedGameId}`)"
                    >
                        Browse Game
                    </v-btn>
                </div>
            </div>
        </div>
        <div v-else-if="!isHistory && videos.length === 0 && !isLoading" class="no-videos">
            <h2>Unable to find any videos</h2>
        </div>
        <loading v-show="!isHistory && isLoading"></loading>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import NewMatchVideoCard from '@/components/videos/match-video-card';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import PlayerNav from '@/components/players/player-nav';
import Loading from '@/components/common/loading';
import { eventbus } from '@/main';
import TournamentMatchService from '@/services/tournament-match-service';
import { setOgMeta, playerOgUrl } from '@/services/og-meta-service';
import PlayersService from '@/services/players-service';
import { injectJsonLd, removeJsonLd, buildPerson } from '@/services/json-ld-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';
import { MONGO_OBJECT_ID_RE } from '@/utils/game-character-routes';
import PlayerTournamentHistoryService from '@/services/player-tournament-history-service';
import PlayerTournamentHistory from '@/components/players/player-tournament-history';

export default {
    name: 'Player',

    components: {
        'match-video-card': NewMatchVideoCard,
        'tournament-match-video-card': TournamentMatchVideoCard,
        'player-nav': PlayerNav,
        'player-tournament-history': PlayerTournamentHistory,
        loading: Loading,
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
            isLoading: true,
            query: null,
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null,
            isTournament: false,
            isLast: false,
            loading: false,
            suggestedGameId: null,
            suggestedCharacterId: null,
            suggestedCharacterSlug: null,
            resolvedPlayerId: null,
            isHistory: false,
            historyEntries: [],
            historyPage: 0,
            historyIsLast: false,
            historyLoading: false,
            historyYear: null,
            historyGameId: null,
            historyYears: [],
            historyGames: [],
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        /** Raw route param — may be a Mongo ID or a slug. */
        routeParam: function () {
            return this.$route.params.id;
        },

        /** Populated only when the route param is a 24-char hex Mongo ID. */
        playerId: function () {
            var p = this.routeParam;
            return p && MONGO_OBJECT_ID_RE.test(p) ? p : null;
        },

        /** Populated when the route param is a human-readable slug. */
        playerSlug: function () {
            var p = this.routeParam;
            return p && !MONGO_OBJECT_ID_RE.test(p) ? p : null;
        },
    },

    watch: {
        routeParam: function () {
            this.isLoading = true;
            this.videos = [];
            this.isLast = false;
            this.filter = null;
            this.suggestedGameId = null;
            this.suggestedCharacterId = null;
            this.suggestedCharacterSlug = null;
            this.resolvedPlayerId = null;
            this.isHistory = false;
            this.historyEntries = [];
            this.historyPage = 0;
            this.historyIsLast = false;
            this.historyYear = null;
            this.historyGameId = null;
            this.historyYears = [];
            this.historyGames = [];
            window.scrollTo(0, 0);
            this.queryVideos();
        },
    },

    mounted() {
        if (this.account) {
            this.updateFavorites();
        }
        this.queryVideos();
        this.setPlayerMeta();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('account:update', this.updateFavorites);
        eventbus.$on('player-filter', this.refreshQuery);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
        eventbus.$off('account:update', this.updateFavorites);
        eventbus.$off('player-filter', this.refreshQuery);
        removeJsonLd();
    },

    methods: {
        async setPlayerMeta() {
            try {
                let name = null;
                let twitter = null;
                if (this.playerId) {
                    const res = await PlayersService.getPlayer({ id: this.playerId });
                    name    = res.data && res.data.Name    ? res.data.Name    : null;
                    twitter = res.data && res.data.Twitter ? res.data.Twitter : null;
                    this.resolvedPlayerId = this.playerId;
                } else if (this.playerSlug) {
                    const res = await PlayersService.getPlayerBySlug({ slug: this.playerSlug });
                    const p  = res.data && res.data.players && res.data.players[0];
                    name    = p ? p.Name    : null;
                    twitter = p ? p.Twitter : null;
                    this.resolvedPlayerId = p ? p._id : null;
                }
                const id      = this.playerId || '';
                const pageUrl = `https://fighters-edge.com/player/${id}`;
                const title   = name ? `${name} matches` : 'Player matches';
                const desc    = name
                    ? `Watch every indexed match for ${name} on Fighters Edge. Filter by character, tournament, and more.`
                    : 'Browse player match footage on Fighters Edge.';

                setOgMeta({ title, description: desc, imageUrl: playerOgUrl(id), pageUrl, ogType: 'profile' });

                const sameAs = [];
                if (twitter) sameAs.push(`https://twitter.com/${twitter.replace(/^@/, '')}`);

                injectJsonLd(buildPerson({
                    name: name || 'Player',
                    pageUrl,
                    sameAs: sameAs.length ? sameAs : undefined,
                }));
            } catch (_) {
                // silently ignore — not critical
            }
        },

        applySort(sort) {
            this.videos = [];
            this.isLast = false;
            this.sort = sort;
            this.queryVideos();
        },

        filterQuery(filter) {
            this.videos = [];
            this.filter = filter;
            this.isLast = false;
            this.isTournament = false;
            this.isHistory = false;
            this.queryVideos();
        },

        refreshQuery(newQuery) {
            this.videos = [];
            this.isLast = false;
            this.queryVideos(newQuery);
        },

        async queryVideos(newQuery) {
            if (this.isTournament || this.isHistory) {
                this.videos = [];
                this.isTournament = false;
                this.isHistory = false;
                this.isLast = false;
            }
            if (!this.isLast && !this.loading) {
                this.loading = true;
                this.isLoading = true;
                try {
                    var queryParameter = {
                        skip: this.skip,
                        sort: this.sort,
                        searchQuery: [
                            {
                                queryName: 'PlayerId',
                                queryValue: this.playerId,
                            },
                        ],
                    };

                    if (this.playerSlug) {
                        queryParameter.searchQuery[0].queryName = 'PlayerSlug';
                        queryParameter.searchQuery[0].queryValue = this.playerSlug;
                    }

                    // Apply persistent game/character filter from player-nav
                    if (this.filter) {
                        queryParameter.searchQuery.push(this.filter);
                    }

                    if (newQuery) {
                        queryParameter.searchQuery.push(newQuery);
                    }

                    const response = await MatchesService.queryMatchesByPlayer(queryParameter);

                    if (response.data.matches.length === 0) {
                        this.isLast = true;
                    } else {
                        this.hydrateVideos(response);
                    }
                } catch (e) {
                    console.error('queryVideos error:', e);
                } finally {
                    this.loading = false;
                    this.isLoading = false;
                }
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    isEditing: false,
                    isFirst: false,
                    contentType: 'Match',
                });
            });
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
            if (!this.suggestedGameId && response.data.matches.length > 0) {
                this.captureSuggestions(response.data.matches[0]);
            }
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

        handleScroll() {
            if (isNearDocumentBottom()) {
                if (this.isHistory) {
                    if (!this.historyLoading) {
                        this.queryTournamentHistory();
                    }
                } else if (!this.isLoading) {
                    if (this.isTournament) {
                        this.queryTournamentMatches();
                    } else {
                        this.queryVideos();
                    }
                }
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },

        updateFavorites() {
            if (this.account.id) {
                this.favorites = this.account.favoriteVideos.map((video) => {
                    return {
                        contentType: video.contentType,
                        id: video.id,
                    };
                });
            }
        },

        checkFavorites() {
            this.favorites.forEach((favorite) => {
                this.videos.filter((video) => video.id === favorite.id)[0].isFavorited = true;
            });
        },

        async queryTournamentMatches() {
            if (!this.isTournament || this.isHistory) {
                this.videos = [];
                this.isTournament = true;
                this.isHistory = false;
                this.isLast = false;
            }
            if (!this.isLast && !this.loading) {
                this.loading = true;
                this.isLoading = true;
                try {
                    var queryParameter = {
                        skip: this.skip,
                        sort: this.sort,
                        searchQuery: [
                            {
                                queryName: 'PlayerId',
                                queryValue: this.playerId,
                            },
                        ],
                    };

                    if (this.playerSlug) {
                        queryParameter.searchQuery[0].queryName = 'PlayerSlug';
                        queryParameter.searchQuery[0].queryValue = this.playerSlug;
                    }

                    // Apply persistent game/character filter from player-nav
                    if (this.filter) {
                        queryParameter.searchQuery.push(this.filter);
                    }

                    const response = await TournamentMatchService.queryTournamentMatches(
                        queryParameter
                    );

                    if (response.data.matches.length === 0) {
                        this.isLast = true;
                    } else {
                        this.hydrateTournamentVideos(response);
                    }
                } catch (e) {
                    console.error('queryTournamentMatches error:', e);
                } finally {
                    this.loading = false;
                    this.isLoading = false;
                }
            }
        },

        // Resolves the numeric-ish PlayerId this page needs for endpoints (like
        // tournament history) that don't support looking a player up by slug —
        // reuses the same lookup setPlayerMeta() already does, caching the result.
        async ensureResolvedPlayerId() {
            if (this.resolvedPlayerId) return this.resolvedPlayerId;
            if (this.playerId) {
                this.resolvedPlayerId = this.playerId;
                return this.resolvedPlayerId;
            }
            if (this.playerSlug) {
                try {
                    const res = await PlayersService.getPlayerBySlug({ slug: this.playerSlug });
                    const p = res.data && res.data.players && res.data.players[0];
                    this.resolvedPlayerId = p ? p._id : null;
                } catch (e) {
                    this.resolvedPlayerId = null;
                }
            }
            return this.resolvedPlayerId;
        },

        // Raw bracket-data tournament/match history (distinct from the curated
        // video-clip feed above) — see player-tournament-history-service.js.
        async queryTournamentHistory() {
            if (!this.isHistory) {
                this.videos = [];
                this.isTournament = false;
                this.isHistory = true;
                this.historyEntries = [];
                this.historyPage = 0;
                this.historyIsLast = false;
            }

            if (this.historyIsLast || this.historyLoading) {
                return;
            }
            const id = await this.ensureResolvedPlayerId();
            if (!id) {
                this.historyIsLast = true;
                return;
            }

            this.historyLoading = true;
            try {
                const nextPage = this.historyPage + 1;
                const response = await PlayerTournamentHistoryService.getPlayerTournamentHistory(id, {
                    page: nextPage,
                    limit: 10,
                    year: this.historyYear,
                    gameId: this.historyGameId,
                });
                const data = response.data || {};
                this.historyEntries = this.historyEntries.concat(data.tournaments || []);
                this.historyPage = nextPage;
                this.historyIsLast = nextPage >= (data.totalPages || 1);
                if (data.filters) {
                    this.historyYears = data.filters.years || [];
                    this.historyGames = data.filters.games || [];
                }
            } catch (e) {
                console.error('queryTournamentHistory error:', e);
                this.historyIsLast = true;
            } finally {
                this.historyLoading = false;
            }
        },

        // Fired by player-tournament-history.vue's year/game selects — resets
        // pagination and re-fetches page 1 under the new filter.
        changeHistoryFilter({ year, gameId }) {
            this.historyYear = year || null;
            this.historyGameId = gameId || null;
            this.historyEntries = [];
            this.historyPage = 0;
            this.historyIsLast = false;
            this.queryTournamentHistory();
        },

        hydrateTournamentVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Tournament Match',
                    isEditing: false,
                    isPlaying: false,
                    videoUrl: video.VideoUrl,
                    videoType: video.VideoPlatform,
                    game: {
                        title: video.Game[0].Title,
                        logoUrl: video.Game[0].LogoUrl,
                        id: video.Game[0]._id,
                    },
                    match: {
                        team1Players: video.Team1Players.map((player) => {
                            var p1 = video.Team1Player.find(
                                (searchPlayer) => searchPlayer._id === player.Id
                            );
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: p1 ? p1.Name : '',
                                slug: p1 ? p1.Slug || null : null,
                                characters: this.hydrateCharacters(
                                    player.CharacterIds,
                                    video.Team1PlayerCharacters
                                ),
                            };
                        }),
                        team2Players: video.Team2Players.map((player) => {
                            var p2 = video.Team2Player.find(
                                (searchPlayer) => searchPlayer._id === player.Id
                            );
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: p2 ? p2.Name : '',
                                slug: p2 ? p2.Slug || null : null,
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
                });
            });
            if (!this.suggestedGameId && response.data.matches.length > 0) {
                this.captureSuggestions(response.data.matches[0]);
            }
        },

        captureSuggestions(match) {
            // Capture game
            if (match.GameId) {
                this.suggestedGameId = String(match.GameId);
            } else if (match.Game && match.Game[0]) {
                this.suggestedGameId = String(match.Game[0]._id);
            }

            // Find the current player in the match to get their character
            const currentId = this.playerId;
            const currentSlug = this.playerSlug;
            let matchedEntry = null;
            let teamChars = null;

            const findInTeam = (players, joinedPlayers, characters) => {
                if (!players) return null;
                let entry = null;
                if (currentId) {
                    entry = players.find((p) => String(p.Id) === String(currentId));
                } else if (currentSlug && joinedPlayers) {
                    const joined = joinedPlayers.find(
                        (p) => p.Slug && p.Slug.toLowerCase() === currentSlug.toLowerCase()
                    );
                    if (joined) {
                        entry = players.find((p) => String(p.Id) === String(joined._id));
                    }
                }
                if (entry) teamChars = characters;
                return entry;
            };

            matchedEntry =
                findInTeam(match.Team1Players, match.Team1Player, match.Team1PlayerCharacters) ||
                findInTeam(match.Team2Players, match.Team2Player, match.Team2PlayerCharacters);

            if (matchedEntry && matchedEntry.CharacterIds && matchedEntry.CharacterIds.length > 0) {
                const charId = matchedEntry.CharacterIds[0];
                const charObj = teamChars && teamChars.find((c) => String(c._id) === String(charId));
                this.suggestedCharacterId = charObj ? String(charObj._id) : String(charId);
                this.suggestedCharacterSlug = charObj && charObj.Slug ? charObj.Slug : null;
            }
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
    },
};
</script>

<style>
.player-view {
    position: relative;
    padding: 200px 20px;
    height: 100%;
    overflow: visible;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
}

.player-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.player-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.player-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.player-view .videos-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.player-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
