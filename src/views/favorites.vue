<!-- @format -->
<template>
    <div class="favorites-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :matchId="video.matchId"
                    :account="account"
                    :favoriteVideos="account.favoriteVideos"
                />
            </div>
        </div>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Favorites',

    components: {
        'match-video-card': MatchVideoCard,
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
        async queryVideos() {
            var filteredMatches = this.account.favoriteVideos
                ? this.account.favoriteVideos.filter((v) => v.contentType === 'Match')
                : [];

            filteredMatches.forEach((match) => {
                if (!this.videos.some((v) => v.matchId === match.id)) {
                    this.videos.push({
                        matchId: match.id,
                        contentType: 'Match',
                        isEditing: false,
                        isPlaying: false,
                    });
                }
            });
        },

        handleScroll() {
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.isLoading) {
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
.favorites-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    height: 100%;
    flex-direction: column;
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 200px;
}

.favorites-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.favorites-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.favorites-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.favorites-view .videos-container {
    position: relative;
    margin-top: 0;
    width: 100%;
}

.favorites-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
