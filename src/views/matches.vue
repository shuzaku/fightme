<!-- @format -->
<template>
    <div ref="videoViewRef" class="matches-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="video in videos"
                :key="video.match.id"
                :class="{ selected: video.selected }"
            >
                <match-video-card
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
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Matches',

    components: {
        'match-video-card': MatchVideoCard
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
        if (this.account) {
            this.updateFavorites();
        }
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

            searchQuery.push({
                queryName: 'ContentType',
                queryValue: 'Match'
            });

            var queryParameter = {
                skip: this.skip,
                searchQuery: searchQuery
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            this.checkFavorites();
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
                    videoType: video.VideoType,
                    inview: false,
                    isEditing: false,
                    isPlaying: false,
                    url: video.Url,
                    isFavorited: false,
                    game: {
                        id: video.Game._id,
                        Title: video.Game.Title,
                        LogoUrl: video.Game.LogoUrl
                    },
                    match: video.Match._id
                        ? {
                              id: video.Match._id,
                              team1Players: video.Match.Team1Players.map(player => {
                                  return {
                                      id: player.Id,
                                      slot: player.Slot,
                                      name: video.Match.Team1Player.filter(
                                          searchPlayer => searchPlayer._id === player.Id
                                      )[0].Name,
                                      characters: this.hydrateCharacters(
                                          player.CharacterIds,
                                          video.Match.Team1PlayerCharacters
                                      )
                                  };
                              }),
                              team2Players: video.Match.Team2Players.map(player => {
                                  return {
                                      id: player.Id,
                                      slot: player.Slot,
                                      name: video.Match.Team2Player.filter(
                                          searchPlayer => searchPlayer._id === player.Id
                                      )[0].Name,
                                      characters: this.hydrateCharacters(
                                          player.CharacterIds,
                                          video.Match.Team2PlayerCharacters
                                      )
                                  };
                              })
                          }
                        : null
                });
            });
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach(id => {
                var filteredCharacter = characters.filter(character => character._id === id);
                playerCharacters.push({
                    name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                    id: filteredCharacter[0]._id,
                    imageUrl: filteredCharacter[0].ImageUrl
                });
            });
            return playerCharacters;
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find(video => video.id == objectId);
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
        },

        updateFavorites() {
            this.favorites = this.account.favoriteVideos.map(video => {
                return {
                    contentType: video.contentType,
                    id: video.id
                };
            });
        },

        checkFavorites() {
            this.favorites.forEach(favorite => {
                if (favorite.contentType === 'Match') {
                    this.videos.filter(video => video.id === favorite.id)[0].isFavorited = true;
                }
            });
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
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
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
    padding: 0 40px;
}

.matches-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
