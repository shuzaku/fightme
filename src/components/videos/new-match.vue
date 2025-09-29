<!-- @format -->
<template>
    <div v-if="!isLoading || !videoId" class="new-match">
        <div class="formcontainer">
            <h1 v-if="!videoId">Add Video</h1>
            <h1 v-else>Edit Video</h1>
            <div class="video-step">
                <youtube-media
                    v-if="video.url"
                    ref="youtubeRef"
                    :video-id="video.url"
                    :player-width="417"
                    :player-height="234"
                    :mute="true"
                    :playsinline="1"
                />
                <!--- video --->
                <div v-if="!videoId" class="video-container">
                    <div class="import-video-container">
                        <v-text-field
                            id="import-video"
                            v-model="importVideoUrl"
                            type="text"
                            placeholder="Video Url"
                        />
                    </div>
                </div>
            </div>

            <!--- game --->
            <p v-show="showErrorMessage && !video.gameId" class="error-msg">Please Game</p>
            <div class="game-container">
                <game-search v-model="video.gameId" @update:game="setGame($event)" />
            </div>
            <match-video-settings
                :gameId="video.gameId"
                :match="video.match"
                @update:match="updateMatch($event)"
            />

            <v-btn class="submit-btn" rounded @click="submitVideo()">Submit</v-btn>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import VideosService from '@/services/videos-service';
import MatchesService from '@/services/matches-service';
import GameSearch from '@/components/games/game-search';
import MatchVideoSettings from '@/components/videos/match-video-settings';

import { eventbus } from '@/main';

export default {
    name: 'VideoWidget',

    components: {
        'game-search': GameSearch,
        'match-video-settings': MatchVideoSettings,
    },

    props: {
        videoId: {
            type: String,
            default: null,
        },
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            isVideoClipped: false,
            showErrorMessage: false,
            error: null,
            video: {
                id: '',
                contentType: '',
                contentCreatorId: '',
                type: '',
                origin: '',
                url: '',
                startTime: '',
                endTime: '',
                gameId: '',
                combos: null,
                match: null,
                montage: null,
                tournament: null,
                tags: [],
            },
            importVideoUrl: null,
            isLoading: true,
        };
    },

    computed: {
        timeStamp: function () {
            return moment().format();
        },

        isValidated: function () {
            if (
                this.video.url &&
                this.video.gameId &&
                this.video.match.team1Players.length > 0 &&
                this.video.match.team1Players.length > 0
            ) {
                return true;
            } else {
                return false;
            }
        },
    },

    watch: {
        importVideoUrl() {
            if (this.importVideoUrl.includes('youtube')) {
                if (this.importVideoUrl.includes('ab_channel')) {
                    this.video.url = this.importVideoUrl.substring(
                        this.importVideoUrl.indexOf('v=') + 2,
                        this.importVideoUrl.indexOf('&ab_channel')
                    );
                } else {
                    this.video.url = this.importVideoUrl.substring(
                        this.importVideoUrl.indexOf('v=') + 2,
                        this.importVideoUrl.length
                    );
                }
                this.video.type = 'youtube';
            } else {
                this.video.url = this.importVideoUrl;
            }
        },

        comboInputsRaw() {
            if (this.video.combo) {
                this.video.combo.inputs = this.comboInputsRaw.split('>');
            }
        },
    },

    mounted() {
        if (this.videoId) {
            this.getVideo();
        }
    },

    methods: {
        nextStep() {
            if (this.video.gameId && this.video.url && this.video.contentType) {
                this.showErrorMessage = false;
                if (this.video.contentType === 'Combo') {
                    this.currentStep = 'Combo';
                } else if (this.video.contentType === 'Match') {
                    this.currentStep = 'Match';
                } else if (this.video.contentType === 'Montage') {
                    this.currentStep = 'Montage';
                } else if (this.video.contentType === 'Tournament Match') {
                    this.currentStep = 'Tournament Match';
                }
            } else {
                this.showErrorMessage = true;
            }
        },

        setUploadedVideo(uploadedVideo) {
            this.video.url = null;
            this.video.url = uploadedVideo;
            this.video.type = 'uploaded';
            this.postVideo();
        },

        async submitVideo() {
            if (!this.videoId) {
                this.postMatch();
            } else {
                await MatchesService.patchMatch({
                    id: this.video.match.id,
                    Team1Players: this.video.match.team1Players.map((player) => {
                        return {
                            Id: player.id,
                            Slot: 1,
                            CharacterIds: player.characterIds,
                        };
                    }),
                    Team2Players: this.video.match.team2Players.map((player) => {
                        return {
                            Id: player.id,
                            Slot: 2,
                            CharacterIds: player.characterIds,
                        };
                    }),
                    VideoUrl: this.video.url,
                    GameId: this.video.gameId,
                });
            }
        },

        async postMatch() {
            var match = {
                Team1Players: this.video.match.team1Players.map((player) => {
                    return {
                        Id: player.id,
                        Slot: 1,
                        CharacterIds: player.characterIds,
                    };
                }),
                Team2Players: this.video.match.team2Players.map((player) => {
                    return {
                        Id: player.id,
                        Slot: 2,
                        CharacterIds: player.characterIds,
                    };
                }),
                VideoUrl: this.video.url,
                GameId: this.video.gameId,
                SubmittedBy: this.account.id,
                UpdatedBy: this.account.id,
            };

            await MatchesService.addMatch(match);

            if (this.video.type === 'uploaded') {
                this.$refs.videoUploader.upload();
            } else {
                this.postVideo();
            }
        },

        async postVideo() {
            if (this.isValidated) {
                var response = await VideosService.addVideo({
                    Url: this.video.url,
                    ContentType: this.video.contentType,
                    ContentCreatorId: this.video.contentCreatorId,
                    VideoType: this.video.type,
                    VideoUrl: this.video.url,
                    StartTime: this.video.startTime,
                    EndTime: this.video.endTime,
                    GameId: this.video.gameId,
                    Combos: null,
                    Tags: this.video.tags,
                    SubmittedBy: this.account.id,
                    UpdatedBy: this.account.id,
                });

                if (response.data.err) {
                    this.error = 'Video already exist';
                    this.showErrorMessage = true;
                } else {
                    this.$emit('closeModal');
                    eventbus.$emit('newVideoPosted');
                }
            } else {
                this.showErrorMessage = true;
            }
        },

        setGame(game) {
            this.video.gameId = game.id;
        },

        async getVideo() {
            const response = await VideosService.getVideo(this.videoId);
            var videoResponse = response.data.video;
            this.video = videoResponse.map((video) => {
                return {
                    id: video._id,
                    contentType: video.ContentType,
                    videoType: video.VideoType,
                    inview: false,
                    isEditing: false,
                    isPlaying: false,
                    url: video.Url,
                    combo: null,
                    isFavorited: false,
                    gameId: video.GameId,
                    contentCreatorId: video.ContentCreatorId,
                    tags: video.Tags
                        ? video.Tags.map((tag) => {
                              return tag._id;
                          })
                        : null,
                    game: {
                        id: video.Game._id,
                        Title: video.Game.Title,
                        LogoUrl: video.Game.LogoUrl,
                    },
                    match:
                        video.ContentType === 'Match'
                            ? {
                                  id: video.Match._id,
                                  team1Players: video.Match.Team1Players.map((player) => {
                                      return {
                                          id: player.Id,
                                          slot: player.Slot,
                                          name: video.Match.Team1Player.filter(
                                              (searchPlayer) => searchPlayer._id === player.Id
                                          )[0].Name,
                                          characterIds: this.hydrateCharacters(
                                              player.CharacterIds,
                                              video.Match.Team1PlayerCharacters
                                          ),
                                          characterCount: player.CharacterIds.length,
                                      };
                                  }),
                                  team2Players: video.Match.Team2Players.map((player) => {
                                      return {
                                          id: player.Id,
                                          slot: player.Slot,
                                          name: video.Match.Team2Player.filter(
                                              (searchPlayer) => searchPlayer._id === player.Id
                                          )[0].Name,
                                          characterIds: this.hydrateCharacters(
                                              player.CharacterIds,
                                              video.Match.Team2PlayerCharacters
                                          ),
                                          characterCount: player.CharacterIds.length,
                                      };
                                  }),
                              }
                            : null,
                };
            })[0];
            this.isLoading = false;
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push(filteredCharacter[0]._id);
            });
            return playerCharacters;
        },

        async patchVideo() {
            if (this.isValidated) {
                var videoRequest = {
                    id: this.video.id,
                    Tags: this.video.tags,
                    GameId: this.video.gameid,
                    Combos:
                        this.video.ContentType === 'Combo'
                            ? this.video.combos.map((combo) => {
                                  return combo.id;
                              })
                            : null,
                };

                await VideosService.patchVideo(videoRequest);

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } else {
                this.showErrorMessage = true;
            }
        },

        updateMatch(match) {
            this.video.match = match;
        },
    },
};
</script>

<style type="text/css">
.new-match {
    text-align: left;
    margin: 0 auto;
}

.new-match .video-step {
    margin-top: 40px;
}

.new-match .players-container button,
.new-match .players-container input,
.new-match label,
.new-match .or {
    display: block;
}

.new-match .players-container,
.new-match .game-container,
.new-match .upload-video-container,
.new-match .import-video-container,
.new-match .or,
.new-match .players-btn {
    margin-bottom: 20px;
}

.new-match .import-video-container #import-video {
    border: none;
}

.new-match .submit-btn {
    margin-top: 30px;
}

.new-match .players-container {
    position: relative;
}

.new-match .players-container .close-btn {
    margin: 0 0 20px auto;
    position: absolute;
    min-width: 40px;
    top: 5px;
    right: 20px;
}

.new-match .players-container {
    border: 1px solid #eee;
    text-align: center;
    padding: 10px 20px 20px;
}

.new-match .players-container .multiselect {
    margin: 10px 0 0px;
}

.new-match .players-container h2 {
    text-align: left;
    margin-bottom: 30px;
}

.new-match .error-msg {
    color: red;
    font-weight: 300;
    font-style: italics;
    text-align: left;
}

.new-match .v-label--active {
    transform: translateY(-18px) scale(0.75) translateX(-20px);
}

.new-match .v-input input {
    margin: 5px 5px 5px;
}

.new-match .combo-stats,
.new-match .video-clip {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}

.new-match .combo-stats,
.new-match .inputs-container {
    padding: 0 2px;
}

.new-match .inputs-container textarea {
    height: 75px;
}

.new-match .input-container {
    padding: 0 5px;
}

.new-match .input-container input {
    font-size: 12px;
}

.new-match .inputs-container .v-input {
    padding-top: 0;
    margin-top: 0px;
}

.new-match .inputs-container .v-input__slot,
.new-match .input-container .v-input__slot {
    background: #fff;
}

.new-match .inputs-container .v-input__slot {
    padding: 10px;
}

.new-match .combo-title {
    margin: 20px 0 10px;
}

.new-match .combo-container {
    border: 1px solid #eee;
    padding: 20px 10px;
    background: #eee;
}

.new-match .character-container h3 {
    text-align: left;
}

.new-match .character-container {
    border: 1px solid #eee;
    text-align: center;
    padding: 10px 20px 20px;
    background: #eee;
    margin-bottom: 10px;
}
</style>
