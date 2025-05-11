<!-- @format -->
<template>
    <div ref="videoViewRef" class="games-view">
        <game-nav
            v-if="!loading"
            :gameId="gameId"
            :account="account"
            @game-filter:update="applyFilter($event)"
            @query-tournament-matches="queryTournamentMatches()"
        />
        <explore-characters :gameId="gameId" :key="gameId" />

        <loading v-if="loading && videos.length <= 0"></loading>
        <div v-else-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
                <combo-video-card
                    v-if="video.contentType === 'Combo'"
                    v-model="video.isPlaying"
                    :comboClipId="video.comboClipId"
                    :account="account"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    @video:delete="refreshDelete()"
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
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';
import GameNav from '@/components/games/game-nav';
import Loading from '@/components/common/loading';
import ExploreCharacters from '@/components/explore/explore-characters';
import TournamentMatchService from '@/services/tournament-match-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';

import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'game-nav': GameNav,
        loading: Loading,
        'explore-characters': ExploreCharacters,
        'tournament-match-video-card': TournamentMatchVideoCard,
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
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        gameId: function () {
            return this.$route.params.id;
        },
    },

    watch: {
        gameId: function () {
            this.loading = true;
            this.videos = [];
            this.queryVideos();
            this.loading = false;
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
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
        eventbus.$off('account:update', this.updateFavorites);
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        applyFilter(filter) {
            this.videos = [];
            this.filter = filter;
            this.queryVideos();
        },

        async queryVideos() {
            if (!this.isLast) {
                this.loading = true;
                var queryParameter = {
                    skip: this.skip,
                    sortOption: this.sort,
                    filter: this.filter,
                    searchQuery: [
                        {
                            queryName: 'GameId',
                            queryValue: this.gameId,
                        },
                    ],
                };

                const response = await MatchesService.queryMatchesByGame(queryParameter);

                if (response.data.matches.length === 0) {
                    this.isLast = true;
                }

                this.hydrateVideos(response);
                this.checkFavorites();
                if (this.videos.length > 0 && this.videos.length < 6) {
                    this.playFirstVideo();
                }
                this.loading = false;
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Match',
                    isEditing: false,
                    isPlaying: false,
                });
            });
        },

        async queryTournamentMatches() {
            this.videos = [];
            this.loading = true;

            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                searchQuery: [
                    {
                        queryName: 'GameId',
                        queryValue: this.gameId,
                    },
                ],
                filter: this.filter,
            };

            const response = await TournamentMatchService.queryTournamentMatches({
                searchQuery: queryParameter ? queryParameter.searchQuery : null,
            });

            this.hydrateTournamentVideos(response);
            if (this.videos.length > 0 && this.videos.length < 6) {
                this.playFirstVideo();
            }
            this.isLast = true;
            this.loading = false;
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

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.loading = false;
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
            if (bottomOfWindow && !this.loading) {
                this.queryVideos();
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
                if (favorite.id) {
                    if (favorite.contentType === 'Combo') {
                        this.videos.filter(
                            (video) => video.combo.id === favorite.id
                        )[0].isFavorited = true;
                    } else {
                        this.videos.filter(
                            (video) => video.id === favorite.id
                        )[0].isFavorited = true;
                    }
                }
            });
        },
    },
};
</script>

<style>
.games-view {
    display: block;
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.games-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.games-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.games-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.games-view .videos-container {
    position: relative;
    width: 100%;
}

.games-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
