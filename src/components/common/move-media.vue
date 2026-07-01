<template>
  <div
    class="move-media"
    :class="{ 'is-video': isVideo }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <video
      v-if="isVideo"
      ref="video"
      class="move-media-el"
      :src="src"
      muted
      loop
      playsinline
      preload="auto"
    />
    <img
      v-else-if="src"
      class="move-media-el"
      :src="src"
      :alt="alt"
    />
    <div v-if="isVideo && showPlayHint" class="move-media-play">
      <i class="fas fa-play"></i>
    </div>
  </div>
</template>

<script>
import { isVideoUrl, pauseVideo, playVideo } from '@/utils/move-media';

export default {
  name: 'MoveMedia',
  props: {
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
    autoplayOnHover: { type: Boolean, default: true },
  },
  data() {
    return {
      showPlayHint: true,
    };
  },
  computed: {
    isVideo() {
      return isVideoUrl(this.src);
    },
  },
  watch: {
    src() {
      this.$nextTick(this.primeVideo);
    },
  },
  mounted() {
    this.primeVideo();
  },
  beforeDestroy() {
    pauseVideo(this.$refs.video);
  },
  methods: {
    primeVideo() {
      const video = this.$refs.video;
      if (!video) return;
      const seekThumb = () => {
        try {
          video.currentTime = 0.1;
        } catch {
          video.currentTime = 0;
        }
        this.showPlayHint = true;
      };
      if (video.readyState >= 1) seekThumb();
      else video.addEventListener('loadeddata', seekThumb, { once: true });
    },
    onEnter() {
      if (!this.isVideo || !this.autoplayOnHover) return;
      this.showPlayHint = false;
      playVideo(this.$refs.video);
    },
    onLeave() {
      if (!this.isVideo) return;
      pauseVideo(this.$refs.video, 0.1);
      this.showPlayHint = true;
    },
  },
};
</script>

<style scoped>
.move-media {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.move-media-el {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.move-media-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 14px;
  pointer-events: none;
  opacity: 0.85;
}

.is-video:hover .move-media-play {
  opacity: 0;
}
</style>
