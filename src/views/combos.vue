<!-- @format -->
<template>
    <div ref="videoViewRef" class="characters-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <combo-video-card
                    v-if="video.contentType === 'Combo'"
                    v-model="video.isPlaying"
                    :comboId="video.comboId"
                    :account="account"
                    :favoriteVideos="account ? account.favoriteVideos : null"
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
        'combo-video-card': ComboVideoCard
    },

    props: {
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            videos: [],
            loading: true,
            query: null,
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        }
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
                filter: this.filter,
                searchQuery: [
                    {
                        queryName: 'ContentType',
                        queryValue: 'Combo'
                    }
                ]
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
        },

        hydrateVideos(response) {
            response.data.videos.forEach(video => {
                this.videos.push({
                    comboId: video.Combo ? video.Combo._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isPlaying: false
                });
            });
        },

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.isLoading = false;
        },

        handleScroll() {
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow) {
                this.queryVideos();
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        }
    }
};
</script>

<style>
.characters-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-top: 20px;
    height: 100%;
    flex-direction: column;
}

.characters-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.characters-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.characters-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.characters-view .videos-container {
    position: relative;
    margin-top: 0;
}

.characters-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.characters-view .combo-card:first-child {
    margin-top: 30px;
}
</style>
