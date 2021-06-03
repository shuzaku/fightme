<!-- @format -->
<template>
    <div ref="videoViewRef" class="players-view">
        <v-btn @click="createMatches()">Create</v-btn>
        <v-btn @click="post()">Post</v-btn>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';

export default {
    name: 'Videos',

    components: {},

    data() {
        return {
            videos: [],
            matches: [],
            skip: 0
        };
    },

    mounted() {
        this.queryVideos();
    },

    methods: {
        async queryVideos() {
            var searchQuery = [];

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
        },

        createMatches() {
            this.matches = this.videos.map(video => {
                var player1Characters = [video.match.player1.character.id];
                var player2Characters = [video.match.player2.character.id];

                if (video.match.player1.character2) {
                    player1Characters.push(video.match.player1.character2.id);
                }
                if (video.match.player1.character3) {
                    player1Characters.push(video.match.player1.character3.id);
                }

                if (video.match.player2.character2) {
                    player2Characters.push(video.match.player2.character2.id);
                }
                if (video.match.player2.character3) {
                    player2Characters.push(video.match.player2.character3.id);
                }

                return {
                    Team1Players: [
                        {
                            Id: video.match.player1.id,
                            CharacterIds: player1Characters,
                            Slot: 1
                        }
                    ],
                    Team2Players: [
                        {
                            Id: video.match.player2.id,
                            CharacterIds: player2Characters,
                            Slot: 2
                        }
                    ],
                    VideoUrl: video.url,
                    GameId: video.gameId
                };
            });
        }
    }
};
</script>

<style>
.players-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    padding-top: 100px;
    height: 100%;
    overflow: hidden;
}

.players-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.players-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.players-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.players-view .videos-container {
    position: relative;
    padding: 0 40px;
}

.players-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
