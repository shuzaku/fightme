<!-- @format -->
<template>
    <div ref="videoViewRef" class="combo-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <combo-video-card
                    :id="video.id"
                    v-model="video.isPlaying"
                    v-waypoint="{
                        active: true,
                        callback: onComboWaypoint,
                        options: intersectionOptions,
                    }"
                    :video="video"
                    :account="account"
                    @video:delete="queryVideos()"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import ComboVideoCard from '@/components/videos/combo-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Combo',

    components: {
        'combo-video-card': ComboVideoCard,
    },

    data() {
        return {
            videos: [],
            isLoading: true,
            query: null,
            savedQuery: null,
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

        comboId: function () {
            return this.$route.params.id;
        },
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
        async queryVideos(query) {
            var searchQuery = [];
            var searchParameter = query || this.savedQuery;

            if (this.savedQuery !== searchParameter) {
                this.videos = [];
                this.savedQuery = query;
            }

            if (searchParameter) {
                if (searchParameter.queryName === 'Game') {
                    searchQuery = [
                        {
                            queryName: 'GameId',
                            queryValue: searchParameter.queryValue,
                        },
                    ];
                }
                if (searchParameter.queryName === 'Player') {
                    searchQuery = [
                        {
                            queryName: 'Player1Id',
                            queryValue: searchParameter.queryValue,
                        },
                        {
                            queryName: 'Player2Id',
                            queryValue: searchParameter.queryValue,
                        },
                    ];
                }
                if (searchParameter.queryName === 'Character') {
                    searchQuery = [
                        {
                            queryName: 'Player1CharacterId',
                            queryValue: searchParameter.queryValue,
                        },
                        {
                            queryName: 'Player2CharacterId',
                            queryValue: searchParameter.queryValue,
                        },
                        {
                            queryName: 'Combo.CharacterId',
                            queryValue: searchParameter.queryValue,
                        },
                    ];
                }
            }

            searchQuery.push({
                queryName: 'ComboId',
                queryValue: this.comboId,
            });

            var queryParameter = {
                skip: this.skip,
                searchQuery: searchQuery,
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
        },

        playFirstVideo() {
            var count = this.videos.length < 4 ? this.videos.length - 1 : 3;
            for (var i = 0; i <= count; i++) {
                this.videos[i].inview = true;
            }
            this.videos[0].isPlaying = true;
            this.isLoading = false;
        },

        hydrateVideos(response) {
            response.data.videos.forEach((video) => {
                this.videos.push({
                    id: video._id,
                    contentType: video.ContentType,
                    contentCreatorId: video.ContentCreatorId,
                    videoType: video.VideoType,
                    url: video.Url,
                    startTime: video.StartTime,
                    endTime: video.EndTime,
                    gameId: video.GameId,
                    combo: this.getCombos(video.Combo),
                    inview: false,
                    isPlaying: false,
                    isEditing: false,
                });
            });
        },

        getCombos(comboResponse) {
            return {
                id: comboResponse._id,
                inputs: comboResponse.Inputs,
                hits: comboResponse.Hits,
                damage: comboResponse.Damage,
                startTime: comboResponse.StartTime,
                endTime: comboResponse.EndTime,
                character: comboResponse.CharacterId
                    ? {
                          name: comboResponse.Character.Name,
                          imageUrl: comboResponse.Character.ImageUrl,
                          id: comboResponse.Character._id,
                      }
                    : null,
            };
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find((video) => video.id == objectId);
            if (going === this.$waypointMap.GOING_IN && direction) {
                featuredVideo.inview = true;
                featuredVideo.isPlaying = true;
            }

            if (going === this.$waypointMap.GOING_OUT && direction) {
                featuredVideo.isPlaying = false;
            }
        },

        onComboWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find((video) => video.combo.id === objectId);
            if (going === this.$waypointMap.GOING_IN && direction) {
                featuredVideo.inview = true;
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
.combo-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-top: 30px;
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
