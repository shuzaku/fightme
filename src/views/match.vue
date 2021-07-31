<!-- @format -->
<template>
    <div ref="videoViewRef" class="match-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :isFirst="video.isFirst"
                    :matchId="video.matchId"
                    :account="account"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Match',

    components: {
        'match-video-card': MatchVideoCard
    },

    data() {
        return {
            videos: [],
            loading: true,
            query: null,
            savedQuery: null,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1
            }
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        },

        videoId: function() {
            return this.$route.params.id;
        }
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
    },

    methods: {
        async queryVideos() {
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                tagFilter: this.tagFilter,
                searchQuery: [
                    {
                        queryName: 'Id',
                        queryValue: this.videoId
                    }
                ]
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
        },

        hydrateVideos(response) {
            response.data.videos.forEach(video => {
                this.videos.push({
                    comboId: video.Combo ? video.Combo._id : null,
                    matchId: video.Match ? video.Match._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isFirst: false
                });
            });
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
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
.match-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
}

.match-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.match-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.match-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.match-view .videos-container {
    position: relative;
    padding: 0 40px;
}

.match-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
