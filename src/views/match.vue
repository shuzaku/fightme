<!-- @format -->
<template>
    <div ref="videoViewRef" class="match-view">
        <div v-if="video" class="videos-container">
            <match-video-card
                v-if="video.contentType === 'Match'"
                ref="card"
                v-model="video.isPlaying"
                :favoriteVideos="account ? account.favoriteVideos : null"
                :isFirst="video.isFirst"
                :matchId="video.matchId"
                :account="account"
            />
            <match-notes
                v-if="video.matchId"
                :matchId="video.matchId"
                :account="account"
                :videoPlayer="videoPlayer"
                @capture-timestamp="captureTimestamp"
                @seek-to-timestamp="seekToTimestamp"
            />
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import MatchNotes from '@/components/match/match-notes';

export default {
    name: 'Match',

    components: {
        'match-video-card': MatchVideoCard,
        'match-notes': MatchNotes,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            video: null,
            loading: true,
            query: null,
            savedQuery: null,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },

            hasTimeStamp: true,
            videoPlayer: null,
        };
    },

    computed: {
        videoId: function () {
            return this.$route.params.id;
        },
    },

    mounted() {
        this.queryVideos();
    },

    created() {},

    beforeDestroy() {},

    methods: {
        async queryVideos() {
            var queryParameter = {
                skip: this.skip,
                sort: this.sort,
                filter: this.filter,
                tagFilter: this.tagFilter,
                searchQuery: [
                    {
                        queryName: 'Id',
                        queryValue: this.videoId,
                    },
                ],
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
        },

        hydrateVideos(response) {
            var responseData = response.data.videos[0];
            this.video = {
                comboId: responseData.Combo ? responseData.Combo._id : null,
                matchId: responseData.Match ? responseData.Match._id : null,
                contentType: responseData.ContentType,
                isEditing: false,
                isFirst: false,
            };

            // Get video player reference after component is mounted
            this.$nextTick(() => {
                if (this.$refs.card) {
                    this.videoPlayer = this.$refs.card.getVideoPlayer();
                }
            });
        },

        captureTimestamp() {
            if (this.$refs.card) {
                const timestamp = this.$refs.card.getCurrentTimestamp();
                // Update video player reference
                this.videoPlayer = this.$refs.card.getVideoPlayer();
                return timestamp;
            }
            return null;
        },

        seekToTimestamp(timestamp) {
            if (this.$refs.card) {
                this.$refs.card.seekToTimestamp(timestamp);
            }
        },
    },
};
</script>

<style>
.match-view {
    position: relative;
    padding: 180px 20px;
    height: 100%;
    overflow: visible;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
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
    width: 100%;
}

.match-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
