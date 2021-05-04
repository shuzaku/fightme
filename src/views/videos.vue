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
                    :id="video.id"
                    v-model="video.isPlaying"
                    v-waypoint="{
                        active: true,
                        callback: onWaypoint,
                        options: intersectionOptions
                    }"
                    :video="video"
                    @video:delete="spliceVideo($event)"
                />
                <combo-video-card
                    v-if="video.contentType === 'Combo'"
                    :id="video.combo.id"
                    v-model="video.isPlaying"
                    v-waypoint="{
                        active: true,
                        callback: onComboWaypoint,
                        options: intersectionOptions
                    }"
                    :video="video"
                    @video:delete="spliceVideo($event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard
    },

    data() {
        return {
            videos: [],
            loading: true,
            query: null,
            savedQuery: null,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1
            }
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        }
    },

    mounted() {
        this.queryVideos(this.$route.params);
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
        async getVideos() {
            const response = await VideosService.fetchVideos(this.skip);
            this.hydrateVideos(response);
        },

        async queryVideos(query) {
            var searchQuery = null;
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
                            queryValue: searchParameter.queryValue
                        }
                    ];
                }
                if (searchParameter.queryName === 'Player') {
                    searchQuery = [
                        {
                            queryName: 'Player1Id',
                            queryValue: searchParameter.queryValue
                        },
                        {
                            queryName: 'Player2Id',
                            queryValue: searchParameter.queryValue
                        }
                    ];
                }
                if (searchParameter.queryName === 'Character') {
                    searchQuery = [
                        {
                            queryName: 'Player1CharacterId',
                            queryValue: searchParameter.queryValue
                        },
                        {
                            queryName: 'Player2CharacterId',
                            queryValue: searchParameter.queryValue
                        },
                        {
                            queryName: 'Combo.CharacterId',
                            queryValue: searchParameter.queryValue
                        }
                    ];
                }
                if (searchParameter.queryName === 'Video Type') {
                    searchQuery = [
                        {
                            queryName: 'ContentType',
                            queryValue: searchParameter.queryValue
                        }
                    ];
                }
            }

            var queryParameter = {
                skip: this.skip,
                searchQuery: searchQuery
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
            response.data.videos.forEach(video => {
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
                    match:
                        video.Player1Id && video.Player2Id
                            ? {
                                  player1: {
                                      id: video.Player1Id,
                                      name: video.Player1.Name,
                                      character: {
                                          id: video.Player1CharacterId,
                                          name: video.Player1Character.Name,
                                          imageUrl: video.Player1Character.ImageUrl
                                      },
                                      character2: video.Player1Character2Id
                                          ? {
                                                id: video.Player1Character2Id,
                                                name: video.Player1Character2.Name,
                                                imageUrl: video.Player1Character2.ImageUrl
                                            }
                                          : null,
                                      character3: video.Player1Character3Id
                                          ? {
                                                id: video.Player1Character3Id,
                                                name: video.Player1Character3.Name,
                                                imageUrl: video.Player1Character3.ImageUrl
                                            }
                                          : null
                                  },
                                  player2: {
                                      id: video.Player2Id,
                                      name: video.Player2.Name,
                                      character: {
                                          id: video.Player2CharacterId,
                                          name: video.Player2Character.Name,
                                          imageUrl: video.Player2Character.ImageUrl
                                      },
                                      character2: video.Player2Character2Id
                                          ? {
                                                id: video.Player2Character2Id,
                                                name: video.Player2Character2.Name,
                                                imageUrl: video.Player2Character2.ImageUrl
                                            }
                                          : null,
                                      character3: video.Player2Character3Id
                                          ? {
                                                id: video.Player2Character3Id,
                                                name: video.Player2Character3.Name,
                                                imageUrl: video.Player2Character3.ImageUrl
                                            }
                                          : null
                                  }
                                  // winner: video.Match.Winner,
                                  // tournamentId: video.Match.TournamentId,
                              }
                            : null,
                    tags: video.Tags.map(tag => {
                        return {
                            id: tag._id,
                            name: tag.TagName
                        };
                    }),
                    inview: false,
                    isPlaying: false,
                    isEditing: false
                });
            });

            this.videos = this.videos.sort(() => Math.random() - 0.5);
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
                          id: comboResponse.Character._id
                      }
                    : null
            };
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find(video => video.id === objectId);
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
            var featuredVideo = this.videos.find(video => video.combo.id === objectId);
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
            if (bottomOfWindow) {
                this.queryVideos();
            }
        },

        spliceVideo(video) {
            this.videos.splice(this.videos.indexOf(video), 1);
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
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
