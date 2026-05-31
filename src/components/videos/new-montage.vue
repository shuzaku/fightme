<!-- @format -->
<template>
    <div v-if="!isLoading" class="new-combo new-montage">
        <div class="formcontainer">
            <div class="form-header">
                <div class="header-icon">
                    <i class="fas fa-film"></i>
                </div>
                <h1>Add Montage</h1>
                <p class="form-subtitle">Share a highlight reel with players and characters</p>
            </div>

            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-video section-icon"></i>
                    <h2>Video</h2>
                </div>
                <div class="video-step">
                    <div v-if="video.url && video.type === 'youtube'" class="video-preview">
                        <youtube-media
                            :video-id="video.url"
                            :player-width="417"
                            :player-height="234"
                            :player-vars="{ autoplay: 0 }"
                            :mute="true"
                            :playsinline="1"
                        />
                    </div>
                    <div class="import-video-container">
                        <div class="input-wrapper">
                            <v-text-field
                                id="import-montage-video"
                                v-model="importVideoUrl"
                                dark
                                type="text"
                                placeholder="YouTube Video URL"
                                outlined
                            />
                        </div>
                        <p class="input-hint">
                            <i class="fas fa-info-circle"></i> Paste a YouTube video URL
                        </p>
                    </div>
                </div>
            </div>

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

            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-users section-icon"></i>
                    <h2>Montage Details</h2>
                </div>
                <montage-video-settings
                    :gameId="video.gameId"
                    :montage="video.montage"
                    @update:montage="updateMontage($event)"
                />
            </div>

            <div v-if="error" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ error }}</span>
            </div>

            <div class="form-actions">
                <v-btn
                    class="submit-btn"
                    rounded
                    large
                    block
                    :disabled="!isValidated"
                    :loading="isSubmitting"
                    @click="submitMontage()"
                >
                    <span v-if="!isSubmitting">
                        <i class="fas fa-check"></i>
                        Submit Montage
                    </span>
                    <span v-else>Submitting...</span>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import MontageVideoSettings from '@/components/videos/montage-video-settings';
import MontagesService from '@/services/montages-service';
import { eventbus } from '@/main';

export default {
    name: 'NewMontage',

    components: {
        'game-search': GameSearch,
        'montage-video-settings': MontageVideoSettings,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
        initialGameId: {
            type: String,
            default: null,
        },
        initialCharacterId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            showErrorMessage: false,
            error: null,
            isSubmitting: false,
            isLoading: true,
            importVideoUrl: null,
            video: {
                url: '',
                type: '',
                gameId: null,
                montage: {
                    type: null,
                    players: [],
                    characters: [],
                },
            },
        };
    },

    computed: {
        isValidated() {
            return !!(
                this.video.url &&
                this.video.gameId &&
                this.video.montage.players.length > 0 &&
                this.video.montage.characters.length > 0
            );
        },
    },

    watch: {
        importVideoUrl() {
            if (!this.importVideoUrl) return;
            if (this.importVideoUrl.includes('youtube') || this.importVideoUrl.includes('youtu.be')) {
                this.importYoutube();
            } else {
                this.video.url = this.importVideoUrl;
                this.video.type = 'youtube';
            }
        },
    },

    mounted() {
        if (this.initialGameId) {
            this.video.gameId = this.initialGameId;
        }
        if (this.initialCharacterId) {
            this.video.montage.characters = [{ id: this.initialCharacterId }];
        }
        this.isLoading = false;
    },

    methods: {
        importYoutube() {
            const url = this.importVideoUrl;
            if (url.includes('ab_channel')) {
                this.video.url = url.substring(url.indexOf('v=') + 2, url.indexOf('&ab_channel'));
            } else if (url.includes('v=')) {
                this.video.url = url.substring(url.indexOf('v=') + 2);
            } else if (url.includes('youtu.be/')) {
                this.video.url = url.split('youtu.be/')[1].split(/[?&]/)[0];
            } else {
                this.video.url = url;
            }
            this.video.type = 'youtube';
        },

        setGame(game) {
            this.video.gameId = game.id;
        },

        updateMontage(montage) {
            this.video.montage = montage;
        },

        async submitMontage() {
            if (!this.isValidated) {
                this.showErrorMessage = true;
                return;
            }
            this.isSubmitting = true;
            this.error = null;
            try {
                const montage = {
                    Players: this.video.montage.players,
                    Characters: this.video.montage.characters.map((character) => ({
                        Id: character.id,
                    })),
                    Type: this.video.montage.type,
                    VideoUrl: this.video.url,
                    GameId: this.video.gameId,
                    SubmittedBy: this.account ? this.account.id : null,
                    UpdatedBy: this.account ? this.account.id : null,
                };

                const response = await MontagesService.addMontage(montage);
                if (response.data && response.data.err) {
                    this.error = 'This montage already exists';
                    return;
                }

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } catch (e) {
                console.error('submitMontage error:', e);
                this.error = 'Failed to submit montage';
            } finally {
                this.isSubmitting = false;
            }
        },
    },
};
</script>

<style type="text/css">
.new-montage {
    width: 100%;
}
</style>
