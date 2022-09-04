<!-- @format -->
<template>
    <div ref="videoViewRef" class="combos-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
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
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import ComboVideoCard from '@/components/videos/combo-video-card';

import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'combo-video-card': ComboVideoCard,
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
            filter: null,
            sort: null,
        };
    },

    computed: {
        gameId() {
            return this.$route.params.gameId;
        },

        characterId() {
            return this.$route.params.characterId;
        },

        skip: function () {
            return this.videos.length;
        },

        searchQuery() {
            var searchQuery = [];
            if (this.gameId) {
                searchQuery = [
                    {
                        queryName: 'GameId',
                        queryValue: this.gameId,
                    },
                ];
            } else if (this.characterId) {
                searchQuery = [
                    {
                        queryName: 'CharacterId',
                        queryValue: this.characterId,
                    },
                ];
            }
            return searchQuery;
        },

        path: function () {
            return this.$route.path;
        },
    },

    watch: {
        path: function () {
            this.videos = [];
            this.queryVideos();
        },
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
    },

    methods: {
        refreshDelete() {
            this.videos = [];
            this.queryVideos();
            alert('combo deleted');
        },
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
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: 'Combo',
                searchQuery: this.searchQuery,
                sort: null,
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
        },

        hydrateVideos(response) {
            response.data.videos.forEach((video) => {
                this.videos.push({
                    comboClipId: video.ComboClip ? video.ComboClip._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isPlaying: false,
                });
            });
        },

        playFirstVideo() {
            if (this.videos.length) {
                this.videos[0].isPlaying = true;
                this.isLoading = false;
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
    },
};
</script>

<style>
.combos-view {
    display: block;
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.combos-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.combos-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.combos-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.combos-view .videos-container {
    position: relative;
    margin-top: 0;
}

.combos-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.combos-view .combo-card:first-child {
    margin-top: 30px;
}
</style>
