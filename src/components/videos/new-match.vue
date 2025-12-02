<!-- @format -->
<template>
    <div v-if="!isLoading || !videoId" class="new-match">
        <div class="formcontainer">
            <div class="form-header">
                <div class="header-icon">
                    <i v-if="!videoId" class="fas fa-plus-circle"></i>
                    <i v-else class="fas fa-edit"></i>
                </div>
                <h1 v-if="!videoId">Add Match</h1>
                <h1 v-else>Edit Match</h1>
                <p class="form-subtitle">
                    {{ !videoId ? 'Add a new match to the database' : 'Update match information' }}
                </p>
            </div>

            <!-- Video Section -->
            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-video section-icon"></i>
                    <h2>Video</h2>
                </div>
                <div class="video-step">
                    <div v-if="video.url" class="video-preview">
                        <youtube-media
                            ref="youtubeRef"
                            :video-id="video.url"
                            :player-width="417"
                            :player-height="234"
                            :mute="true"
                            :playsinline="1"
                        />
                    </div>
                    <div v-if="!videoId" class="video-container">
                        <div class="import-video-container">
                            <div class="input-wrapper">
                                <i class="fas fa-link input-icon"></i>
                                <v-text-field
                                    dark
                                    id="import-video"
                                    v-model="importVideoUrl"
                                    type="text"
                                    placeholder="YouTube Video URL"
                                    outlined
                                />
                            </div>
                            <p class="input-hint">
                                <i class="fas fa-info-circle"></i> Paste a YouTube video URL here
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Section -->
            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-gamepad section-icon"></i>
                    <h2>Game</h2>
                </div>
                <div v-show="showErrorMessage && !video.gameId" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Please select a game</span>
                </div>
                <div class="game-container">
                    <game-search v-model="video.gameId" @update:game="setGame($event)" />
                </div>
            </div>

            <!-- Match Settings Section -->
            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-users section-icon"></i>
                    <h2>Match Details</h2>
                </div>
                <match-video-settings
                    :gameId="video.gameId"
                    :match="video.match"
                    @update:match="updateMatch($event)"
                />
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
                <v-btn
                    class="submit-btn"
                    rounded
                    large
                    block
                    @click="submitVideo()"
                    :disabled="!isValidated"
                    :loading="isSubmitting"
                >
                    <span v-if="!isSubmitting">
                        <i class="fas fa-check"></i>
                        {{ !videoId ? 'Submit Match' : 'Update Match' }}
                    </span>
                    <span v-else>{{ !videoId ? 'Submitting...' : 'Updating...' }}</span>
                </v-btn>
            </div>
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
            isSubmitting: false,
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
                match: {
                    team1Players: [],
                    team2Players: [],
                },
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
                this.video.match.team2Players.length > 0
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
            this.isSubmitting = true;
            try {
                if (!this.videoId) {
                    await this.validateVideo();
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
                    this.$emit('closeModal');
                }
            } catch (error) {
                console.error('Error submitting match:', error);
                this.error = error.message || 'Failed to submit match';
            } finally {
                this.isSubmitting = false;
            }
        },

        async validateVideo() {
            await VideosService.validateVideo({
                Url: this.video.url,
                GameId: this.video.gameId,
                Team1Players: this.video.match.team1Players.map((player) => {
                    return {
                        Id: player.id,
                        Slot: 1,
                        CharacterIds: player.characterIds.map((character) => character.id),
                    };
                }),
                Team2Players: this.video.match.team2Players.map((player) => {
                    return {
                        Id: player.id,
                        Slot: 2,
                        CharacterIds: player.characterIds.map((character) => character.id),
                    };
                }),
                VideoUrl: this.video.url,
                SubmittedBy: this.account.id,
                UpdatedBy: this.account.id,
                ContentType: 'Match',
                ContentCreatorId: this.video.contentCreatorId || null,
                VideoType: this.video.type,
                Tags: this.video.tags,
                StartTime: this.video.startTime,
                EndTime: this.video.endTime,
            });

            this.$emit('closeModal');
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
    color: #fff;
    width: 100%;
    max-width: 800px;
}

.new-match .formcontainer {
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.new-match .form-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.new-match .header-icon {
    font-size: 48px;
    color: #3eb489;
    margin-bottom: 16px;
}

.new-match .form-header h1 {
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Roboto', sans-serif;
}

.new-match .form-subtitle {
    color: #ffffff90;
    font-size: 14px;
    margin: 0;
    font-weight: 400;
}

.new-match .form-section {
    margin-bottom: 35px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.new-match .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.new-match .section-icon {
    font-size: 20px;
    color: #3eb489;
}

.new-match .section-header h2 {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

.new-match .video-step {
    margin-top: 0;
}

.new-match .video-preview {
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.new-match .video-container {
    margin-top: 0;
}

.new-match .import-video-container {
    margin-bottom: 0;
}

.new-match .import-video-container .input-wrapper {
    position: relative;
    margin-bottom: 12px;
}

.new-match .import-video-container .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.new-match .import-video-container .v-text-field--outlined >>> .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    transition: all 0.3s ease;
}

.new-match .import-video-container .v-text-field--outlined >>> .v-input__slot:hover {
    border-color: rgba(62, 180, 137, 0.5) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.new-match .import-video-container .v-text-field--outlined.v-input--is-focused >>> .v-input__slot {
    border-color: #3eb489 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.1);
}

.new-match .import-video-container .v-text-field--outlined >>> .v-input__slot input {
    color: #fff !important;
    font-size: 15px;
    padding-left: 8px;
}

.new-match .import-video-container .v-text-field--outlined >>> .v-input__slot input::placeholder {
    color: #ffffff60 !important;
    opacity: 1;
}

.new-match .input-hint {
    color: #ffffff70;
    font-size: 13px;
    margin: 8px 0 0 0;
    display: flex;
    align-items: center;
    gap: 6px;
}

.new-match .input-hint i {
    font-size: 14px;
}

.new-match .game-container {
    margin-bottom: 0;
}

.new-match .error-message {
    background: rgba(255, 59, 48, 0.15);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ff6b6b;
    font-size: 14px;
    animation: shake 0.5s ease;
}

.new-match .error-message i {
    font-size: 16px;
    flex-shrink: 0;
}

.new-match .error-message span {
    flex: 1;
}

.new-match .form-actions {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.new-match .submit-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3);
    transition: all 0.3s ease;
    height: 50px;
    margin-top: 0 !important;
}

.new-match .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.new-match .submit-btn:active {
    transform: translateY(0);
}

.new-match .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.new-match .submit-btn i {
    margin-right: 8px;
}

.new-match .players-container button,
.new-match .players-container input,
.new-match label,
.new-match .or {
    display: block;
}

.new-match .players-container,
.new-match .upload-video-container,
.new-match .or,
.new-match .players-btn {
    margin-bottom: 20px;
}

.new-match .players-container {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
}

.new-match .players-container .close-btn {
    margin: 0 0 20px auto;
    position: absolute;
    min-width: 40px;
    top: 5px;
    right: 20px;
}

.new-match .players-container .multiselect {
    margin: 10px 0 0px;
}

.new-match .players-container h2 {
    text-align: left;
    margin-bottom: 30px;
    color: #fff;
}

.new-match .error-msg {
    color: #ff6b6b;
    font-weight: 400;
    font-style: normal;
    text-align: left;
    background: rgba(255, 59, 48, 0.15);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.new-match .inputs-container .v-input__slot {
    padding: 10px;
}

.new-match .combo-title {
    margin: 20px 0 10px;
    color: #fff;
}

.new-match .combo-container {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px 10px;
    background: rgba(255, 255, 255, 0.02);
}

.new-match .character-container h3 {
    text-align: left;
    color: #fff;
}

.new-match .character-container {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    padding: 10px 20px 20px;
    background: rgba(255, 255, 255, 0.02);
    margin-bottom: 10px;
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
        transform: translateX(-5px);
    }
    20%,
    40%,
    60%,
    80% {
        transform: translateX(5px);
    }
}

/* Mobile responsive */
@media (max-width: 600px) {
    .new-match .formcontainer {
        padding: 25px 20px;
        border-radius: 16px;
    }

    .new-match .form-header h1 {
        font-size: 28px;
    }

    .new-match .header-icon {
        font-size: 40px;
    }

    .new-match .form-section {
        padding: 20px 16px;
    }
}
</style>
