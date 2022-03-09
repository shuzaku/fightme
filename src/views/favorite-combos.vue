<!-- @format -->
<template>
    <div ref="videoViewRef" class="favorite-matches-view">
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
    name: 'FavoriteCombos',

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
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
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
        async queryVideos(query) {
            var searchQuery = null;
            var searchParameter = query || this.savedQuery;

            if (this.savedQuery !== searchParameter) {
                this.videos = [];
                this.savedQuery = query;
            }

            var filteredCombos = this.account.favoriteVideos.filter(
                (video) => video.contentType === 'Combo'
            );

            searchQuery = filteredCombos.map((combo) => {
                return {
                    queryName: 'ComboId',
                    queryValue: combo.id,
                };
            });

            var queryParameter = {
                skip: this.skip,
                searchQuery: searchQuery,
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

        spliceVideo(video) {
            this.videos.splice(this.videos.indexOf(video), 1);
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },
    },
};
</script>

<style>
.favorite-matches-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
}

.favorite-matches-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.favorite-matches-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.favorite-matches-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.favorite-matches-view .videos-container {
    position: relative;
    padding: 0 40px;
}

.favorite-matches-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
