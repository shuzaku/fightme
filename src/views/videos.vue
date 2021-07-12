<!-- @format -->
<template>
    <div ref="videoViewRef" class="videos-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :isFirst="video.isFirst"
                    :matchId="video.matchId"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                />
                <combo-video-card
                    v-if="video.contentType === 'Combo'"
                    v-model="video.isPlaying"
                    :isFirst="video.isFirst"
                    :comboId="video.comboId"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import NewMatchVideoCard from '@/components/videos/match-video-card';
import NewComboVideoCard from '@/components/videos/combo-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'match-video-card': NewMatchVideoCard,
        'combo-video-card': NewComboVideoCard
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
            error: null,
            results: null
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        }
    },

    created() {
        this.fetch();
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('account:update', this.accountUpdate);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
    },

    methods: {
        accountUpdate() {
            this.queryVideos();
        },

        async queryVideos() {
            var queryParameter = {
                skip: this.skip
            };

            const response = await VideosService.getVideos(queryParameter);
            this.hydrateVideos(response);
            // this.checkFavorites();
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
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

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.isLoading = false;
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find(video => video.matchId === objectId);
            if (going === this.$waypointMap.GOING_IN && direction) {
                featuredVideo.isPlaying = true;
            }

            if (going === this.$waypointMap.GOING_OUT && direction) {
                featuredVideo.isPlaying = false;
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
        },

        checkFavorites() {
            this.favorites.forEach(favorite => {
                if (favorite.contentType === 'Combo') {
                    this.videos.filter(
                        video => video.combo.id === favorite.id
                    )[0].isFavorited = true;
                } else {
                    this.videos.filter(video => video.id === favorite.id)[0].isFavorited = true;
                }
            });
        },

        async fetch() {
            try {
                const url = `https://www.googleapis.com/youtube/v3/search?key=936424237721-3988kr9bnjlqbmrsfu45nnm4ueba6pqc.apps.googleusercontent.com
&channelId=UCVsmYrE8-v3VS7XWg3cXp9g&part=snippet,id&order=date&maxResults=20`;
                const response = await this.axios.get(url);
                const results = response.data.results;
                this.results = results;
            } catch (err) {
                this.error = err;
            }
        }
    }
};
</script>

<style>
.videos-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
}

.videos-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.videos-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.videos-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.videos-view .videos-container {
    position: relative;
    padding: 0 40px;
}

.videos-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
