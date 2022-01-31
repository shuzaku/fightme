<!-- @format -->
<template>
    <div ref="videoViewRef" class="matches-view">
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
                    @video:delete="refreshDelete()"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import NewMatchVideoCard from '@/components/videos/match-video-card';

import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'match-video-card': NewMatchVideoCard
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
            filter: 'Match',
            sort: null,
            character1: this.$route.params ? this.$route.params.id : null,
            character2: this.$route.params ? this.$route.params.id2 : null
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        },

        path: function() {
            return this.$route.path;
        }
    },

    watch: {
        path() {
            this.videos = [];
            this.character1 = this.$route.params.id;
            this.character2 = this.$route.params.id2;
            this.queryVideos();
        }
    },

    mounted() {
        if (this.account.id) {
            this.updateFavorites();
        }
        if (this.character1 && this.character2) {
            this.queryVideos();
        }
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('account:update', this.updateFavorites);
        eventbus.$on('matchup-character1', this.addCharacter1);
        eventbus.$on('matchup-character2', this.addCharacter2);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('account:update', this.updateFavorites);
        eventbus.$off('matchup-character1', this.addCharacter1);
        eventbus.$off('matchup-character2', this.addCharacter2);
    },

    methods: {
        async queryVideos() {
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                searchQuery: {
                    character1: this.character1,
                    character2: this.character2
                }
            };

            const response = await VideosService.queryMatchup(queryParameter);
            this.hydrateVideos(response);
            // this.checkFavorites();
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
        },

        hydrateVideos(response) {
            response.data.videos.forEach(video => {
                this.videos.push({
                    matchId: video.Match ? video.Match._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isPlaying: false
                });
            });
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

        updateFavorites() {
            if(this.account.id){
                this.favorites = this.account.favoriteVideos.map(video => {
                    return {
                        contentType: video.contentType,
                        id: video.id
                    };
                });
            }
        },

        checkFavorites() {
            this.favorites.forEach(favorite => {
                this.videos.filter(video => video.id === favorite.id)[0].isFavorited = true;
            });
        },

        addCharacter1(characterId) {
            if (this.character2) {
                this.$router.push(`/matchups/${characterId}/${this.character2}`);
            } else {
                this.character1 = characterId;
            }
        },

        addCharacter2(characterId) {
            if (this.character1) {
                this.$router.push(`/matchups/${this.character1}/${characterId}`);
            } else {
                this.character2 = characterId;
            }
        }
    }
};
</script>

<style>
.matches-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    height: 100%;
    flex-direction: column;
}

.matches-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.matches-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.matches-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.matches-view .videos-container {
    position: relative;
    margin-top: 0;
}

.matches-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
