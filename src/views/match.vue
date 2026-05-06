<!-- @format -->
<template>
    <div ref="videoViewRef" class="match-view">
        <div v-if="!loading && video" class="videos-container">
            <match-video-analysis-card
                v-if="video.contentType === 'Match'"
                ref="card"
                v-model="video.isPlaying"
                :favoriteVideos="account ? account.favoriteVideos : null"
                :isFirst="video.isFirst"
                :matchId="video.matchId"
                :account="account"
            />
            <match-notes
                v-if="video && (video.videoUrl || video.matchId)"
                :match-id="video.matchId || ''"
                :video-url="video.videoUrl || ''"
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
import AnalysesService from '@/services/analyses-service';
import MatchVideoAnalysisCard from '@/components/videos/match-video-analysis-card';
import MatchNotes from '@/components/match/match-notes';
import { setOgMeta, matchOgUrl } from '@/services/og-meta-service';

export default {
    name: 'Match',

    components: {
        'match-video-analysis-card': MatchVideoAnalysisCard,
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
            analyses: [],
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

    methods: {
        async queryVideos() {
            this.loading = true;
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'Id',
                        queryValue: this.videoId,
                    },
                ],
            };

            const response = await VideosService.queryVideos(queryParameter);
            const videos = response && response.data && response.data.videos;
            if (videos && videos.length > 0) {
                this.hydrateVideos(response);
            }
            this.loading = false;
        },

        hydrateVideos(response) {
            var responseData = response.data.videos[0];
            var matchId = responseData.Match ? responseData.Match._id : null;
            this.video = {
                comboId: responseData.Combo ? responseData.Combo._id : null,
                matchId: matchId,
                videoUrl: responseData.Url || '',
                contentType: responseData.ContentType,
                isEditing: false,
                isPlaying: false,
                isFirst: false,
            };

            if (matchId) {
                this.queryAnalysis(matchId);
                setOgMeta({
                    title: 'Match — Fighters Edge',
                    imageUrl: matchOgUrl(matchId),
                    pageUrl: `https://www.fighters-edge.com/match/${this.videoId}`,
                });
            }

            this.$nextTick(() => {
                if (this.$refs.card) {
                    this.videoPlayer = this.$refs.card.getVideoPlayer();
                }
            });
        },

        async queryAnalysis(matchId) {
            if (!matchId) return;
            const queryParameter = {
                searchQuery: [
                    {
                        queryName: 'MatchId',
                        queryValue: matchId,
                    },
                ],
            };

            const response = await AnalysesService.queryAnalysis(queryParameter);
            this.analyses = response.data.analyses.map((analysis) => ({
                matchId: analysis.MatchId,
                matchType: analysis.MatchType,
                detection: analysis.Detections,
            }));

            if (this.analyses[0] && this.analyses[0].detection) {
                this.analyses[0].detection.forEach((detection) => {
                    detection.formattedTime = this.formatSeconds(detection.timestamp);
                });
            }
        },

        formatSeconds(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        captureTimestamp() {
            if (this.$refs.card) {
                return this.$refs.card.getCurrentTimestamp();
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
