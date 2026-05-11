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
                @match:loaded="onMatchLoaded"
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
import MatchVideoAnalysisCard from '@/components/videos/match-video-analysis-card';
import MatchNotes from '@/components/match/match-notes';
import { setOgMeta, matchOgUrl } from '@/services/og-meta-service';
import { injectJsonLd, removeJsonLd, buildVideoObject } from '@/services/json-ld-service';

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
            videoPlayer: null,
        };
    },

    computed: {
        matchId() {
            return this.$route.params.id;
        },
    },

    watch: {
        matchId() {
            this.loadMatch();
        },
    },

    mounted() {
        this.loadMatch();
    },

    beforeDestroy() {
        removeJsonLd();
    },

    methods: {
        onMatchLoaded({ videoId, gameTitle, team1Players, team2Players, uploadDate }) {
            const p1 = team1Players && team1Players[0] ? team1Players[0].name : null;
            const p2 = team2Players && team2Players[0] ? team2Players[0].name : null;
            const matchName = p1 && p2 ? `${p1} vs ${p2}` : 'Match';
            const desc = gameTitle
                ? `${matchName} — ${gameTitle} match footage on Fighters Edge.`
                : `${matchName} match footage on Fighters Edge.`;
            const pageUrl = `https://fighters-edge.com/match/${this.matchId}`;

            // Update title now that we have real player names
            setOgMeta({
                title: matchName,
                description: desc,
                imageUrl: matchOgUrl(this.matchId),
                pageUrl,
                ogType: 'video.other',
            });

            injectJsonLd(buildVideoObject({
                name: matchName,
                description: desc,
                videoId,
                uploadDate: uploadDate || undefined,
                pageUrl,
            }));
        },

        loadMatch() {
            if (!this.matchId) return;
            this.loading = true;
            this.video = {
                matchId: this.matchId,
                videoUrl: '',
                contentType: 'Match',
                isEditing: false,
                isPlaying: false,
                isFirst: false,
            };
            setOgMeta({
                title: 'Match',
                description: 'Watch this match on Fighters Edge — indexed pro and tournament footage with auto-timestamps.',
                imageUrl: matchOgUrl(this.matchId),
                pageUrl: `https://fighters-edge.com/match/${this.matchId}`,
                ogType: 'video.other',
            });
            this.loading = false;
            this.$nextTick(() => {
                if (this.$refs.card) {
                    this.videoPlayer = this.$refs.card.getVideoPlayer();
                }
            });
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
    padding: 200px 20px;
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
