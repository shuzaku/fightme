<!-- @format -->
<template>
    <div ref="videoViewRef" class="montages-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <montage-video-card
                    v-if="video.contentType === 'Montage'"
                    v-model="video.isPlaying"
                    :montageId="video.montageId"
                    :account="account"
                    @video:delete="refreshDelete()"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import NewMontageVideoCard from '@/components/videos/montage-video-card';

import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'montage-video-card': NewMontageVideoCard,
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
            loading: true,
            query: null,
            savedQuery: null,
            favorites: [],
            filter: 'Montage',
            sort: null,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        playerId: function () {
            return this.$route.params.id;
        },
    },

    watch: {
        playerId: function () {
            this.isLoading = true;
            this.videos = [];
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
        eventbus.$on('filter', this.applyFilter);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('account:update', this.updateFavorites);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('filter', this.applyFilter);
        eventbus.$on('search', this.queryVideos);
        eventbus.$off('account:update', this.updateFavorites);
    },

    methods: {
        refreshDelete() {
            this.videos = [];
            this.queryVideos();
            alert('montage deleted');
        },

        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        applyFilter(filter) {
            this.videos = [];
            this.queryVideos(filter);
        },

        async queryVideos(query) {
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                searchQuery: [],
            };

            if (query) {
                queryParameter.searchQuery.push(query);
            }

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            // this.checkFavorites();
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
        },

        hydrateVideos(response) {
            response.data.videos.forEach((video) => {
                this.videos.push({
                    montageId: video.Montage ? video.Montage._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isPlaying: false,
                });
            });
        },

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.isLoading = false;
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find((video) => video.montageId === objectId);
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
                this.videos.filter((video) => video.id === favorite.id)[0].isFavorited = true;
            });
        },
    },
};
</script>

<style>
.montages-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    height: 100%;
    flex-direction: column;
}

.montages-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.montages-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.montages-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.montages-view .videos-container {
    position: relative;
    margin-top: 0;
}

.montages-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
