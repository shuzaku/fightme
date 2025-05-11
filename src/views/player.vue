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
        />
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
                :favoriteVideos="account ? account.favoriteVideos : null"
                :account="account"
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
                    :video="video"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
            </div>
        </div>
        <div v-else-if="(videos.length = 0 && !loading)" class="no-videos">
            <h2>Unable to find any videos</h2>
        </div>
        <loading v-show="isLoading"></loading>
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

export default {
    name: 'Player',

    components: {
        'match-video-card': NewMatchVideoCard,
        'tournament-match-video-card': TournamentMatchVideoCard,
        'player-nav': PlayerNav,
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
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        playerId: function () {
            return this.$route.params.id;
        },

        playerSlug: function () {
            return this.$route.params.slug;
        },
    },

    watch: {
        playerId: function () {
            this.isLoading = true;
            this.videos = [];
            window.scrollTo(0, 0);
            this.queryVideos();
            this.isLoading = false;
        },
    },

    mounted() {
        if (this.account) {
            this.updateFavorites();
        }
        this.queryVideos();
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
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        refreshQuery(newQuery) {
            this.videos = [];
            this.queryVideos(newQuery);
        },

        async queryVideos(newQuery) {
            if (this.isTournament) {
                this.videos = [];
                this.isTournament = false;
                this.isLast = false;
            }
            if (!this.isLast && !this.loading) {
                this.isLoading = true;
                var queryParameter = {
                    skip: this.skip,
                    sortOption: this.sort,
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

                if (newQuery) {
                    queryParameter.searchQuery.push(newQuery);
                }

                const response = await MatchesService.queryMatchesByPlayer(queryParameter);

                if (response.data.matches.length === 0) {
                    this.isLast = true;
                }

                this.hydrateVideos(response);
                if (this.videos.length < 6 && this.videos.length > 0) {
                    this.playFirstVideo();
                }
                this.isLoading = false;
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
        },

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.isLoading = false;
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
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.isLoading) {
                if (this.isTournament) {
                    this.queryTournamentMatches();
                } else {
                    this.queryVideos();
                }
            }
        },

        addedNewVideo() {
            this.videos = [];
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
            if (!this.isTournament) {
                this.videos = [];
                this.isTournament = true;
                this.isLast = false;
            }
            if (!this.isLast && !this.loading) {
                this.isLoading = true;

                var queryParameter = {
                    skip: this.skip,
                    sortOption: this.sort,
                    searchQuery: [
                        {
                            queryName: 'PlayerId',
                            queryValue: this.playerId,
                        },
                    ],
                };

                const response = await TournamentMatchService.queryTournamentMatches(
                    queryParameter
                );

                if (response.data.matches.length === 0) {
                    this.isLast = true;
                }

                this.hydrateTournamentVideos(response);
                if (this.videos.length > 0 && this.videos.length < 6) {
                    this.playFirstVideo();
                }
                this.isLoading = false;
            }
        },

        hydrateTournamentVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Tournament Match',
                    isEditing: false,
                    isPlaying: false,
                    videoUrl: video.VideoUrl,
                    videoType: 'youtube',
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
    },
};
</script>

<style>
.player-view {
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
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
}

.player-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
