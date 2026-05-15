<!-- @format -->
<template>
    <div v-if="!isLoading && (!comboClipId || video)" class="new-combo">
        <div class="formcontainer">
            <div class="form-header">
                <div class="header-icon">
                    <i v-if="!comboClipId" class="fas fa-fire"></i>
                    <i v-else class="fas fa-edit"></i>
                </div>
                <h1 v-if="!comboClipId">Add Combo</h1>
                <h1 v-else>Edit Combo</h1>
                <p class="form-subtitle">
                    {{ !comboClipId ? 'Share an epic combo with the community' : 'Update combo information' }}
                </p>
            </div>

            <!-- Video Section -->
            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-video section-icon"></i>
                    <h2>Video</h2>
                </div>
                <div class="video-step">
                    <div v-if="video.url && video.type === 'youtube'" class="video-preview">
                        <youtube-media
                            ref="youtubeRef"
                            :video-id="video.url"
                            :player-width="417"
                            :player-height="234"
                            :player-vars="{ autoplay: 0 }"
                            :mute="true"
                            :playsinline="1"
                        />
                    </div>
                    <div v-if="video.url && video.type === 'twitter'" class="video-preview">
                        <tweet :id="video.url" />
                    </div>

                    <!--- video --->
                    <div v-if="!comboClipId" class="video-container">
                        <div class="import-video-container">
                            <div class="input-wrapper">
                                <i class="fas fa-link input-icon"></i>
                                <v-text-field
                                    id="import-video"
                                    v-model="importVideoUrl"
                                    dark
                                    type="text"
                                    placeholder="YouTube or Twitter Video URL"
                                    outlined
                                />
                            </div>
                            <p class="input-hint">
                                <i class="fas fa-info-circle"></i> Paste a YouTube or Twitter video URL
                            </p>
                            <div class="creator-container">
                                <div class="section-subheader">
                                    <i class="fas fa-user-tie"></i>
                                    <span>Content Creator (Optional)</span>
                                </div>
                                <creator-search
                                    v-model="video.contentCreatorId"
                                    @update:creator="setCreator($event)"
                                />
                            </div>
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

            <!-- Combo Settings Section -->
            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-fist-raised section-icon"></i>
                    <h2>Combo Details</h2>
                </div>
                <combo-video-settings
                    :combos="video.combos"
                    :gameId="video.gameId"
                    :videoUrl="video.url"
                    @update:match="updateCombo($event)"
                />
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
                <v-btn
                    class="submit-btn"
                    rounded
                    large
                    block
                    :disabled="!isValidated"
                    :loading="isSubmitting"
                    @click="submitVideo()"
                >
                    <span v-if="!isSubmitting">
                        <i class="fas fa-check"></i>
                        {{ !comboClipId ? 'Submit Combo' : 'Update Combo' }}
                    </span>
                    <span v-else>{{ !comboClipId ? 'Submitting...' : 'Updating...' }}</span>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import UploadVideo from '@/components/videos/upload-video';
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';

import GameSearch from '@/components/games/game-search';
import CreatorSearch from '@/components/content-creator/creator-search';
import MatchVideoSettings from '@/components/videos/match-video-settings';
import ComboVideoSettings from '@/components/videos/combo-video-settings';
import MontageVideoSettings from '@/components/videos/montage-video-settings';
import TournamentVideoSettings from '@/components/videos/tournament-video-settings';

import { eventbus } from '@/main';
import { Tweet, Moment, Timeline } from 'vue-tweet-embed';

export default {
    name: 'VideoWidget',

    components: {
        'upload-video': UploadVideo,
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
        'match-video-settings': MatchVideoSettings,
        'combo-video-settings': ComboVideoSettings,
        'montage-video-settings': MontageVideoSettings,
        'tournament-video-settings': TournamentVideoSettings,
        tweet: Tweet,
    },

    props: {
        comboClipId: {
            type: String,
            default: null,
        },
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
            currentStep: 'Video',
            comboInputsRaw: '',
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
                gameId: null,
                combos: [
                    {
                        id: '',
                        characterId: [],
                        damage: '',
                        hits: '',
                        inputs: '',
                        startTime: '',
                        endTime: '',
                        note: '',
                        isExpanded: true,
                    },
                ],
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
            if (this.video.url && this.video.gameId && this.video.combos[0].id) {
                return true;
            } else {
                return false;
            }
        },
    },

    watch: {
        importVideoUrl() {
            if (this.importVideoUrl.includes('youtube')) {
                this.importYoutube();
            } else if (
                this.importVideoUrl.includes('x.com') ||
                this.importVideoUrl.includes('twitter')
            ) {
                this.importTwitter();
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

    async mounted() {
        if (this.comboClipId) {
            await this.getComboClip();
        } else {
            this.isLoading = false;
        }
    },

    methods: {
        async submitVideo() {
            this.isSubmitting = true;
            try {
                if (!this.comboClipId) {
                    await this.validateVideo();
                } else {
                    // Update combo
                    if (this.video.combos && this.video.combos.length > 0) {
                        const combo = this.video.combos[0];
                        await CombosService.patchCombo({
                            id: combo.id,
                            CharacterId: Array.isArray(combo.characterId)
                                ? combo.characterId[0]
                                : combo.characterId,
                            Inputs: combo.inputs,
                            Damage: combo.damage,
                            Hits: combo.hits,
                            Tags: combo.tags || [],
                        });
                    }
                    // Update combo clip times if needed
                    if (this.video.combos && this.video.combos.length > 0) {
                        const combo = this.video.combos[0];
                        // Note: You may need to add a patchComboClip method if start/end times need updating
                    }
                    this.$emit('closeModal');
                    eventbus.$emit('newVideoPosted');
                }
            } catch (error) {
                console.error('Error submitting combo:', error);
                this.error = error.message || 'Failed to submit combo';
            } finally {
                this.isSubmitting = false;
            }
        },

        async validateVideo() {
            await VideosService.validateVideo({
                Url: this.video.url,
                GameId: this.video.gameId,
                Combos: this.video.combos.map((combo) => {
                    return {
                        CharacterId: Array.isArray(combo.characterId)
                            ? combo.characterId
                            : [combo.characterId],
                        Inputs: combo.inputs,
                        Damage: combo.damage,
                        Hits: combo.hits,
                        StartTime: combo.startTime,
                        EndTime: combo.endTime,
                        Note: combo.note,
                    };
                }),
                VideoUrl: this.video.url,
                SubmittedBy: this.account.id,
                UpdatedBy: this.account.id,
                ContentType: 'Combo',
                ContentCreatorId: this.video.contentCreatorId || null,
                VideoType: this.video.type,
                Tags: this.video.tags,
                StartTime: this.video.startTime,
                EndTime: this.video.endTime,
            });

            this.$emit('closeModal');
        },

        importYoutube() {
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
        },

        importTwitter() {
            this.video.url = this.importVideoUrl.substring(
                this.importVideoUrl.indexOf('/status/') + 8,
                this.importVideoUrl.length + 1
            );

            this.video.type = 'twitter';
        },

        setGame(game) {
            this.video.gameId = game.id;
        },

        setCreator(creatorId) {
            this.video.contentCreatorId = creatorId.id;
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push(filteredCharacter[0]._id);
            });
            return playerCharacters;
        },

        updateCombo(combos) {
            this.video.combos = combos;
        },

        convertTime(time) {
            var a = time.split(':');
            var n = a.length;

            var seconds = 0;
            if (n > 0) {
                var minutesToSeconds = parseInt(a[0]) * 60;
                seconds = minutesToSeconds + parseInt(a[1]);
            } else {
                return parseInt(a[0]);
            }

            return seconds;
        },

        convertSecondsToTime(seconds) {
            var minutes = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
        },

        async getComboClip() {
            try {
                const response = await CombosService.getComboClip(this.comboClipId);
                var comboResponse = response.data.comboClip[0];

                if (comboResponse) {
                    // Set video data
                    this.video.id = comboResponse.Video ? comboResponse.Video._id : null;
                    this.video.url = comboResponse.Url;
                    this.video.type = comboResponse.VideoType
                        ? comboResponse.VideoType.toLowerCase()
                        : 'youtube';
                    this.video.gameId = comboResponse.Game ? comboResponse.Game._id : null;
                    this.video.contentCreatorId = comboResponse.Video
                        ? comboResponse.Video.ContentCreatorId
                        : null;

                    // Set import video URL for display
                    if (this.video.type === 'youtube') {
                        this.importVideoUrl = `https://www.youtube.com/watch?v=${this.video.url}`;
                    } else if (this.video.type === 'twitter') {
                        this.importVideoUrl = `https://twitter.com/status/${this.video.url}`;
                    } else {
                        this.importVideoUrl = this.video.url;
                    }

                    // Set combo data
                    if (comboResponse.Combo) {
                        // Ensure characterId is an array
                        let characterIdArray = [];
                        if (comboResponse.Combo.CharacterId) {
                            characterIdArray = Array.isArray(comboResponse.Combo.CharacterId)
                                ? comboResponse.Combo.CharacterId
                                : [comboResponse.Combo.CharacterId];
                        }

                        // Get inputs - could be array or string
                        let inputsValue = '';
                        if (comboResponse.Combo.Inputs) {
                            if (
                                Array.isArray(comboResponse.Combo.Inputs) &&
                                comboResponse.Combo.Inputs.length > 0
                            ) {
                                inputsValue = comboResponse.Combo.Inputs[0];
                            } else if (typeof comboResponse.Combo.Inputs === 'string') {
                                inputsValue = comboResponse.Combo.Inputs;
                            }
                        }

                        this.video.combos = [
                            {
                                id: comboResponse.Combo._id,
                                characterId: characterIdArray,
                                damage: comboResponse.Combo.Damage || '',
                                hits: comboResponse.Combo.Hits || '',
                                inputs: inputsValue,
                                startTime: comboResponse.StartTime || '',
                                endTime: comboResponse.EndTime || '',
                                note: comboResponse.Combo.Note || '',
                                isExpanded: true,
                            },
                        ];
                    }
                }
            } catch (error) {
                console.error('Error loading combo clip:', error);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style type="text/css">
.new-combo {
    text-align: left;
    margin: 0 auto;
    color: #fff;
    width: 100%;
    max-width: 800px;
}

.new-combo .formcontainer {
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.new-combo .form-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.new-combo .header-icon {
    font-size: 48px;
    color: #3eb489;
    margin-bottom: 16px;
}

.new-combo .form-header h1 {
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Roboto', sans-serif;
}

.new-combo .form-subtitle {
    color: #ffffff90;
    font-size: 14px;
    margin: 0;
    font-weight: 400;
}

.new-combo .form-section {
    margin-bottom: 35px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.new-combo .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.new-combo .section-icon {
    font-size: 20px;
    color: #3eb489;
}

.new-combo .section-header h2 {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

.new-combo .section-subheader {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff90;
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 500;
}

.new-combo .section-subheader i {
    font-size: 16px;
    color: #3eb489;
}

.new-combo .video-step {
    margin-top: 0;
}

.new-combo .video-preview {
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.new-combo .video-container {
    margin-top: 0;
}

.new-combo .import-video-container {
    margin-bottom: 0;
}

.new-combo .import-video-container .input-wrapper {
    position: relative;
    margin-bottom: 12px;
}

.new-combo .import-video-container .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.new-combo .import-video-container .v-text-field--outlined >>> .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    transition: all 0.3s ease;
}

.new-combo .import-video-container .v-text-field--outlined >>> .v-input__slot:hover {
    border-color: rgba(62, 180, 137, 0.5) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.new-combo .import-video-container .v-text-field--outlined.v-input--is-focused >>> .v-input__slot {
    border-color: #3eb489 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.1);
}

.new-combo .import-video-container .v-text-field--outlined >>> .v-input__slot input {
    color: #fff !important;
    font-size: 15px;
    padding-left: 8px;
}

.new-combo .import-video-container .v-text-field--outlined >>> .v-input__slot input::placeholder {
    color: #ffffff60 !important;
    opacity: 1;
}

.new-combo .input-hint {
    color: #ffffff70;
    font-size: 13px;
    margin: 8px 0 16px 0;
    display: flex;
    align-items: center;
    gap: 6px;
}

.new-combo .input-hint i {
    font-size: 14px;
}

.new-combo .creator-container {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.new-combo .game-container {
    margin-bottom: 0;
}

.new-combo .error-message {
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

.new-combo .error-message i {
    font-size: 16px;
    flex-shrink: 0;
}

.new-combo .error-message span {
    flex: 1;
}

.new-combo .form-actions {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.new-combo .submit-btn {
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

.new-combo .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.new-combo .submit-btn:active {
    transform: translateY(0);
}

.new-combo .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.new-combo .submit-btn i {
    margin-right: 8px;
}

.new-combo .players-container button,
.new-combo .players-container input,
.new-combo label,
.new-combo .or {
    display: block;
}

.new-combo .players-container,
.new-combo .upload-video-container,
.new-combo .or,
.new-combo .players-btn {
    margin-bottom: 20px;
}

.new-combo .players-container {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
}

.new-combo .players-container .close-btn {
    margin: 0 0 20px auto;
    position: absolute;
    min-width: 40px;
    top: 5px;
    right: 20px;
}

.new-combo .players-container .multiselect {
    margin: 10px 0 0px;
}

.new-combo .players-container h2 {
    text-align: left;
    margin-bottom: 30px;
    color: #fff;
}

.new-combo .error-msg {
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

.new-combo .v-label--active {
    transform: translateY(-18px) scale(0.75) translateX(-20px);
}

.new-combo .v-input input {
    margin: 5px 5px 5px;
    border: none;
}

.new-combo .combo-stats,
.new-combo .video-clip {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}

.new-combo .combo-stats,
.new-combo .inputs-container {
    padding: 0 2px;
}

.new-combo .inputs-container textarea {
    height: 75px;
    border: none;
}

.new-combo .input-container {
    padding: 0 5px;
}

.new-combo .input-container input {
    font-size: 12px;
}

.new-combo .inputs-container .v-input {
    padding-top: 0;
    margin-top: 0px;
}

.new-combo .inputs-container .v-input__slot {
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.new-combo .combo-title {
    margin: 20px 0 10px;
    color: #fff;
}

.new-combo .combo-container {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px 10px;
    background: rgba(255, 255, 255, 0.02);
}

.new-combo .character-container h3 {
    text-align: left;
    color: #fff;
}

.new-combo .character-container {
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
    .new-combo .formcontainer {
        padding: 25px 20px;
        border-radius: 16px;
    }

    .new-combo .form-header h1 {
        font-size: 28px;
    }

    .new-combo .header-icon {
        font-size: 40px;
    }

    .new-combo .form-section {
        padding: 20px 16px;
    }
}
</style>
