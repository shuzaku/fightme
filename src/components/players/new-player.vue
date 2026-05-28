<!-- @format -->
<template>
    <div class="add-player">
        <button type="button" class="add-player__close" aria-label="Close" @click="closeModal">
            <span class="add-player__close-icon">×</span>
        </button>

        <div class="add-player__hero">
            <div class="add-player__hero-glow" aria-hidden="true"></div>
            <div class="add-player__hero-icon" aria-hidden="true">
                <i class="fas fa-user-ninja"></i>
            </div>
        </div>

        <header class="add-player__header">
            <h2>Add Player</h2>
            <p class="add-player__subtitle">Register a competitor for match tracking and profiles</p>
        </header>

        <div class="add-player__form">
            <div v-if="player.imageUrl" class="add-player__avatar-preview">
                <div class="add-player__avatar-ring">
                    <img :src="player.imageUrl" class="add-player__avatar-img" alt="Player preview" />
                </div>
                <button
                    type="button"
                    class="add-player__avatar-remove"
                    aria-label="Remove image"
                    @click="player.imageUrl = ''"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="input-with-icon">
                <div class="input-icon-wrap" aria-hidden="true">
                    <i class="fas fa-user"></i>
                </div>
                <v-text-field
                    v-model="player.name"
                    type="text"
                    name="name"
                    placeholder="Player name"
                    dark
                    outlined
                    hide-details
                />
            </div>

            <div class="input-with-icon">
                <div class="input-icon-wrap" aria-hidden="true">
                    <i class="fas fa-image"></i>
                </div>
                <v-text-field
                    id="import-player-image"
                    v-model="player.imageUrl"
                    type="text"
                    placeholder="Profile image URL (optional)"
                    dark
                    outlined
                    hide-details
                />
            </div>

            <div v-if="errorMessage" class="add-player__error" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                {{ errorMessage }}
            </div>

            <v-btn
                class="add-player__submit"
                rounded
                large
                block
                :disabled="!canSubmit"
                :loading="isSaving"
                @click="addPlayer()"
            >
                <i class="fas fa-plus"></i>
                Add Player
            </v-btn>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import { eventbus } from '@/main';

export default {
    name: 'NewPlayer',

    data() {
        return {
            player: {
                name: '',
                region: '',
                imageUrl: '',
            },
            isSaving: false,
            errorMessage: null,
        };
    },

    computed: {
        canSubmit() {
            return Boolean(this.player.name && String(this.player.name).trim()) && !this.isSaving;
        },
    },

    methods: {
        closeModal() {
            this.$emit('closeModal');
        },

        async addPlayer() {
            if (!this.canSubmit) {
                return;
            }
            this.errorMessage = null;
            this.isSaving = true;
            try {
                const body = {
                    Name: String(this.player.name).trim(),
                };
                if (this.player.imageUrl && String(this.player.imageUrl).trim()) {
                    body.ImageUrl = String(this.player.imageUrl).trim();
                }
                await PlayersService.addPlayer(body);
                eventbus.$emit('add:new-player');
                this.$emit('closeModal');
            } catch (e) {
                this.errorMessage = 'Could not add player. Please try again.';
            }
            this.isSaving = false;
        },
    },
};
</script>

<style scoped>
.add-player {
    --player-accent: #3eb489;
    --player-accent-dark: #2d8a6a;
    --player-surface: rgba(255, 255, 255, 0.05);
    --player-border: rgba(255, 255, 255, 0.1);
    position: relative;
    color: #fff;
    padding-bottom: 24px;
}

.add-player__close {
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.25);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    padding: 0;
    margin: 0;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.add-player__close-icon {
    font-size: 28px;
    line-height: 1;
    font-weight: 300;
    transform: translateY(-2px);
}

.add-player__close:hover {
    background: rgba(255, 59, 48, 0.9);
    border-color: rgba(255, 59, 48, 1);
    transform: rotate(90deg) scale(1.08);
    box-shadow: 0 6px 18px rgba(255, 59, 48, 0.4);
}

.add-player__close:active {
    transform: rotate(90deg) scale(0.95);
}

.add-player__hero {
    position: relative;
    height: 120px;
    margin: -8px -8px 28px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--player-accent) 0%, var(--player-accent-dark) 55%, #1a4d3a 100%);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-player__hero-glow {
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    top: -40px;
    right: -30px;
    animation: player-pulse 3s ease-in-out infinite;
}

.add-player__hero-icon {
    position: relative;
    z-index: 1;
    font-size: 48px;
    color: rgba(255, 255, 255, 0.9);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
}

.add-player__header {
    margin-bottom: 28px;
}

.add-player__header h2 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
    font-family: 'Roboto', sans-serif;
    letter-spacing: -0.02em;
}

.add-player__subtitle {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.45;
}

.add-player__form {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.add-player__avatar-preview {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
}

.add-player__avatar-ring {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    padding: 4px;
    background: linear-gradient(135deg, var(--player-accent), var(--player-accent-dark));
    box-shadow: 0 8px 28px rgba(62, 180, 137, 0.35);
}

.add-player__avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    border: 3px solid #242832;
}

.add-player__avatar-remove {
    position: absolute;
    top: 0;
    right: calc(50% - 72px);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 59, 48, 0.9);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.add-player__avatar-remove:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 14px rgba(255, 59, 48, 0.45);
}

.add-player__avatar-remove i {
    font-size: 12px;
}

.input-with-icon {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.input-icon-wrap {
    flex: 0 0 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.38);
    font-size: 18px;
    pointer-events: none;
}

.input-with-icon .v-text-field {
    flex: 1 1 auto;
    margin: 0;
    min-width: 0;
}

.add-player >>> .v-text-field--outlined .v-input__control {
    min-height: 50px;
}

.add-player >>> .v-text-field--outlined .v-input__slot {
    background: var(--player-surface) !important;
    border: 1px solid var(--player-border) !important;
    border-radius: 12px !important;
    padding: 0 16px !important;
    transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.add-player >>> .v-text-field--outlined .v-input__slot:hover {
    border-color: rgba(62, 180, 137, 0.45) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.add-player >>> .v-text-field--outlined.v-input--is-focused .v-input__slot {
    border-color: var(--player-accent) !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.12);
}

.add-player >>> .v-text-field--outlined .v-input__slot input {
    color: #fff !important;
    font-size: 15px;
}

.add-player >>> .v-text-field--outlined .v-input__slot input::placeholder {
    color: rgba(255, 255, 255, 0.38) !important;
    opacity: 1;
}

.add-player__error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    margin-bottom: 16px;
    border-radius: 10px;
    background: rgba(255, 59, 48, 0.12);
    border: 1px solid rgba(255, 59, 48, 0.35);
    color: #ff8a80;
    font-size: 14px;
}

.add-player__submit {
    margin-top: 8px;
    background: linear-gradient(135deg, var(--player-accent) 0%, var(--player-accent-dark) 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-transform: none !important;
    letter-spacing: 0.03em;
    height: 52px !important;
    box-shadow: 0 4px 18px rgba(62, 180, 137, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.add-player__submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(62, 180, 137, 0.45);
}

.add-player__submit:active:not(:disabled) {
    transform: translateY(0);
}

.add-player__submit:disabled {
    opacity: 0.5;
    box-shadow: none;
}

.add-player__submit i {
    margin-right: 8px;
}

@keyframes player-pulse {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.35;
    }
    50% {
        transform: scale(1.15);
        opacity: 0.55;
    }
}
</style>
