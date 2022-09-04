<!-- @format -->
<template>
    <div ref="videoViewRef" class="games-view">
        <game-nav
            v-if="!loading"
            :gameId="gameId"
            :account="account"
            @game-filter:update="applyFilter($event)"
        />
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
            </div>
        </div>
        <loading v-show="loading"></loading>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';
import GameNav from '@/components/games/game-nav';
import Loading from '@/components/common/loading';

import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'game-nav': GameNav,
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
            query: null,
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null,
            loading: false,
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

            const response = await VideosService.queryVideosByGame(queryParameter);
            this.hydrateVideos(response);
            this.checkFavorites();
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
            this.loading = false;
        },

        hydrateVideos(response) {
            response.data.videos.forEach((video) => {
                this.videos.push({
                    comboClipId: video.ComboClip ? video.ComboClip._id : null,
                    matchId: video.Match ? video.Match._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isPlaying: false,
                });
            });
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
                if (favorite.contentType === 'Combo') {
                    this.videos.filter(
                        (video) => video.combo.id === favorite.id
                    )[0].isFavorited = true;
                } else {
                    this.videos.filter((video) => video.id === favorite.id)[0].isFavorited = true;
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
