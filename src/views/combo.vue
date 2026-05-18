<!-- @format -->
<template>
    <div ref="videoViewRef" class="combo-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="video.comboClipId || index"
                class="combos-container"
            >
                <combo-video-card
                    v-model="video.isPlaying"
                    v-waypoint="{
                        active: true,
                        callback: onComboWaypoint,
                        options: intersectionOptions,
                    }"
                    :comboClipId="video.comboClipId"
                    :account="account"
                    @video:delete="$router.push('/combos')"
                />
            </div>
        </div>
    </div>
</template>

<script>
import ComboVideoCard from '@/components/videos/combo-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Combo',

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
            isLoading: true,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
        };
    },

    computed: {
        comboClipId: function () {
            return this.$route.params.id;
        },
    },

    mounted() {
        this.loadClip();
        eventbus.$on('newVideoPosted', this.loadClip);
    },

    beforeDestroy() {
        eventbus.$off('newVideoPosted', this.loadClip);
    },

    methods: {
        loadClip() {
            if (!this.comboClipId) {
                this.isLoading = false;
                return;
            }
            this.videos = [
                {
                    comboClipId: this.comboClipId,
                    isPlaying: false,
                    inview: true,
                },
            ];
            this.isLoading = false;
        },

        onComboWaypoint({ going, direction }) {
            const isYoutube =
                this.videos[0] &&
                this.videos[0].videoType &&
                String(this.videos[0].videoType).toLowerCase() === 'youtube';
            if (going === this.$waypointMap.GOING_IN && direction && !isYoutube) {
                if (this.videos[0]) this.videos[0].isPlaying = true;
            }
            if (going === this.$waypointMap.GOING_OUT && direction) {
                if (this.videos[0]) this.videos[0].isPlaying = false;
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.loadClip();
        },
    },
};
</script>

<style>
.combo-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-top: 200px;
    height: 100%;
    overflow: hidden;
}

.combo-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.combo-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.combo-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.combo-view .videos-container {
    position: relative;
}

.combo-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
