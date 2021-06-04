<!-- @format -->
<template>
    <div ref="videoViewRef" class="characters-view">
        <character-nav
            v-if="!isLoading"
            :characterId="characterId"
            @character-sort:update="applySort($event)"
            @character-filter:update="applyFilter($event)"
        />
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
import CharacterNav from '@/components/character/character-nav';
import { eventbus } from '@/main';

export default {
    name: 'Characters',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'character-nav': CharacterNav
    },

    data() {
        return {
            videos: [],
            loading: true,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1
            },
            sort: null,
            filter: null,
            isLoading: false
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        },

        characterId: function() {
            return this.$route.params.id;
        }
    },

    watch: {
        characterId: function() {
            this.isLoading = true;
            this.videos = [];
            this.queryVideos();
            this.isLoading = false;
        }
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
        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        applyFilter(filter) {
            this.videos = [];
            this.filter = filter;
            this.queryVideos();
        },

        async queryVideos() {
            var searchQuery = null;

            searchQuery = [
                {
                    queryName: 'CharacterId',
                    queryValue: this.characterId
                }
            ];

            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                searchQuery: searchQuery
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);

            if (this.videos.length < 5) {
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
                    combo: this.getCombos(video.Combo),
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
            if (this.videos.length > 0) {
                var bottomOfWindow =
                    document.documentElement.scrollTop + window.innerHeight ===
                    document.documentElement.offsetHeight;
                if (bottomOfWindow) {
                    this.queryVideos();
                }
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
.characters-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    padding-top: 100px;
    height: 100%;
    flex-direction: column;
}

.characters-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.characters-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.characters-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.characters-view .videos-container {
    position: relative;
    margin-top: 0;
}

.characters-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.characters-view .combo-card:first-child {
    margin-top: 30px;
}
</style>
