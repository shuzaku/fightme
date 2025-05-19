<!-- @format -->
<template>
    <div class="app-twitch-player">
        <!-- <iframe
            :src="videoSrc"
            height="313"
            width="556"
            :time="video.match.startTime"
            allowfullscreen
        >
        </iframe> -->
        <div :id="video.matchId"></div>
    </div>
</template>

<script>
export default {
    name: 'TwitchPlayer',

    components: {},

    props: {
        video: {
            type: Object,
            default: null,
        },

        isPlaying: {
            type: Boolean,
            default: false,
        },
    },

    watch: {
        isPlaying() {
            if (this.isPlaying) {
                this.playVideo();
            } else {
                this.pauseVideo();
            }
        },
    },

    data() {
        return {
            player: null,
        };
    },

    mounted() {
        this.player = new Twitch.Player(this.video.matchId, this.videoOptions);
        if (this.isPlaying) {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    },

    computed: {
        videoSrc() {
            return `https://player.twitch.tv/?video=${this.video.videoUrl}&parent=localhost&autoplay=false&time=${this.videoTime}&muted=true`;
        },

        videoTime() {
            return this.video.match.startTime;
        },

        videoOptions() {
            return {
                width: 313,
                height: 556,
                // Only needed if this page is going to be embedded on other websites
                parent: ['localhost', 'fighters-edge.com'],
                video: this.video.videoUrl,
                time: this.video.match.startTime,
                autoplay: false,
            };
        },
    },

    methods: {
        playVideo() {
            this.player.play();
        },

        pauseVideo() {
            this.player.pause();
        },
    },
};
</script>

<style></style>
