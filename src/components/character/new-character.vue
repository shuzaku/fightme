<!-- @format -->
<template>
    <div class="character-overlay" @click.self="closeModal">
        <div class="character-modal">
            <button class="close-button" @click="closeModal" aria-label="Close">
                <span class="close-icon">×</span>
            </button>
            <div class="character-content">
                <div class="character-graphic">
                    <div class="graphic-container">
                        <div class="graphic-circle graphic-circle-1"></div>
                        <div class="graphic-circle graphic-circle-2"></div>
                        <div class="graphic-circle graphic-circle-3"></div>
                        <div class="logo-container">
                            <img
                                class="character-logo"
                                src="https://res.cloudinary.com/shuzchef/image/upload/v1759458070/cjee1o9a0mtpnmcudhfl.png"
                                alt="Fighters Edge Logo"
                            />
                        </div>
                    </div>
                </div>
                <div class="formcontainer">
                    <div class="character-header">
                        <h2>Add Character</h2>
                        <p class="character-subtitle">Create a new character for the game</p>
                    </div>

                    <div class="form-fields">
                        <div v-if="imageUrl" class="character-img-container">
                            <img :src="imageUrl" class="character-img" />
                            <button class="remove-image-btn" @click="imageUrl = ''">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="input-wrapper">
                            <i class="fas fa-user input-icon"></i>
                            <v-text-field
                                v-model="characterName"
                                type="text"
                                name="name"
                                placeholder="Character Name"
                                dark
                                outlined
                            />
                        </div>

                        <div class="input-wrapper">
                            <i class="fas fa-image input-icon"></i>
                            <v-text-field
                                id="import-image"
                                v-model="imageUrl"
                                type="text"
                                placeholder="Character Image Url"
                                dark
                                outlined
                            />
                        </div>

                        <div class="input-wrapper">
                            <i class="fas fa-portrait input-icon"></i>
                            <v-text-field
                                id="import-thumbnail"
                                v-model="avatarUrl"
                                type="text"
                                placeholder="Character Avatar Url"
                                dark
                                outlined
                            />
                        </div>

                        <div class="input-wrapper">
                            <i class="fas fa-gamepad input-icon"></i>
                            <game-search v-model="game.id" @update:game="setGame($event)" />
                        </div>
                    </div>

                    <div class="buttons-container">
                        <v-btn
                            class="submit-btn"
                            rounded
                            large
                            block
                            @click="addCharacter()"
                            :disabled="!characterName || !game.id"
                        >
                            <i class="fas fa-plus"></i> Submit Character
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import CharactersService from '@/services/characters-service';
import { eventbus } from '@/main';

export default {
    name: 'NewCharacter',

    components: {
        'game-search': GameSearch,
    },

    data() {
        return {
            characterName: '',
            game: {
                name: null,
                id: null,
                imageUrl: null,
            },
            imageUrl: null,
            avatarUrl: null,
        };
    },

    created() {},

    methods: {
        async addCharacter() {
            await CharactersService.addCharacter({
                Name: this.characterName,
                GameId: this.game.id,
                ImageUrl: this.imageUrl,
                AvatarUrl: this.avatarUrl,
            });

            eventbus.$emit('updateSearch');
            this.closeModal();
        },

        setGame(game) {
            this.game = game;
        },

        closeModal() {
            this.$emit('closeModal');
        },
    },
};
</script>
<style scoped>
.character-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

.character-modal {
    position: relative;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    animation: slideUp 0.4s ease;
    overflow: hidden;
}

.character-modal .close-button {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 0;
    margin: 0;
}

.character-modal .close-icon {
    font-size: 32px;
    line-height: 1;
    font-weight: 300;
    display: block;
    color: #fff;
    transform: translateY(-2px);
}

.character-modal .close-button:hover {
    background: rgba(255, 59, 48, 0.9);
    border-color: rgba(255, 59, 48, 1);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
}

.character-modal .close-button:hover .close-icon {
    color: #fff;
}

.character-modal .close-button:active {
    transform: rotate(90deg) scale(0.95);
}

.character-modal .character-content {
    display: flex;
    width: 100%;
    min-height: 600px;
}

.character-modal .character-graphic {
    flex: 1;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    position: relative;
    overflow: hidden;
}

.character-modal .graphic-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.character-modal .graphic-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 3s ease-in-out infinite;
}

.character-modal .graphic-circle-1 {
    width: 200px;
    height: 200px;
    animation-delay: 0s;
}

.character-modal .graphic-circle-2 {
    width: 150px;
    height: 150px;
    animation-delay: 1s;
}

.character-modal .graphic-circle-3 {
    width: 100px;
    height: 100px;
    animation-delay: 2s;
}

.character-modal .logo-container {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: float 3s ease-in-out infinite;
}

.character-modal .character-logo {
    max-width: 280px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
    animation: logoGlow 3s ease-in-out infinite;
}

.character-modal .formcontainer {
    flex: 1;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.character-modal .character-header {
    text-align: left;
    margin-bottom: 35px;
}

.character-modal .character-header h2 {
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Roboto', sans-serif;
}

.character-modal .character-subtitle {
    color: #ffffff90;
    font-size: 14px;
    margin: 0;
    font-weight: 400;
}

.character-modal .form-fields {
    margin-bottom: 24px;
}

.character-modal .character-img-container {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 0 auto 24px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.1);
}

.character-modal .character-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.character-modal .remove-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 59, 48, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 0;
    margin: 0;
}

.character-modal .remove-image-btn:hover {
    background: rgba(255, 59, 48, 1);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
}

.character-modal .remove-image-btn i {
    font-size: 14px;
}

.character-modal .input-wrapper {
    position: relative;
    margin-bottom: 20px;
}

.character-modal .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.character-modal .input-wrapper .v-input {
    padding-left: 45px;
}

.character-modal .input-wrapper .v-text-field {
    margin-bottom: 0;
}

.character-modal .input-wrapper .game-search {
    padding-left: 45px;
}

.character-modal .input-wrapper .game-search >>> .multiselect {
    min-height: 50px;
}

.character-modal .input-wrapper .game-search >>> .multiselect__tags {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    padding: 8px 16px 8px 40px !important;
    transition: all 0.3s ease;
    min-height: 50px;
}

.character-modal .input-wrapper .game-search >>> .multiselect__tags:hover {
    border-color: rgba(62, 180, 137, 0.5) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.character-modal .input-wrapper .game-search >>> .multiselect--active .multiselect__tags {
    border-color: #3eb489 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.1);
}

.character-modal .input-wrapper .game-search >>> .multiselect__input,
.character-modal .input-wrapper .game-search >>> .multiselect__single {
    background: transparent !important;
    color: #fff !important;
    font-size: 15px !important;
    padding-left: 8px !important;
}

.character-modal .input-wrapper .game-search >>> .multiselect__placeholder {
    color: #ffffff60 !important;
    padding-left: 8px !important;
}

.character-modal .v-text-field--outlined >>> .v-input__control {
    min-height: 50px;
}

.character-modal .v-text-field--outlined >>> .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    padding: 0 16px !important;
    transition: all 0.3s ease;
}

.character-modal .v-text-field--outlined >>> .v-input__slot:hover {
    border-color: rgba(62, 180, 137, 0.5) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.character-modal .v-text-field--outlined.v-input--is-focused >>> .v-input__slot {
    border-color: #3eb489 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.1);
}

.character-modal .v-text-field--outlined >>> .v-input__slot input {
    color: #fff !important;
    font-size: 15px;
    padding-left: 8px;
}

.character-modal .v-text-field--outlined >>> .v-input__slot input::placeholder {
    color: #ffffff60 !important;
    opacity: 1;
}

.character-modal .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.character-modal .submit-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3);
    transition: all 0.3s ease;
    height: 50px;
}

.character-modal .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.character-modal .submit-btn:active {
    transform: translateY(0);
}

.character-modal .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.character-modal .submit-btn i {
    margin-right: 8px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 0.3;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.5;
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-20px);
    }
}

@keyframes logoGlow {
    0%, 100% {
        filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 20px rgba(62, 180, 137, 0.3));
    }
    50% {
        filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 30px rgba(62, 180, 137, 0.5));
    }
}

/* Mobile responsive */
@media (max-width: 900px) {
    .character-modal {
        max-width: 100%;
        flex-direction: column;
        max-height: 95vh;
    }

    .character-modal .character-content {
        flex-direction: column;
        min-height: auto;
    }

    .character-modal .character-graphic {
        flex: 0 0 auto;
        padding: 40px 20px;
        min-height: 200px;
    }

    .character-modal .character-logo {
        max-width: 200px;
    }

    .character-modal .graphic-circle-1 {
        width: 150px;
        height: 150px;
    }

    .character-modal .graphic-circle-2 {
        width: 120px;
        height: 120px;
    }

    .character-modal .graphic-circle-3 {
        width: 80px;
        height: 80px;
    }

    .character-modal .formcontainer {
        padding: 30px 25px;
    }

    .character-modal .character-header {
        text-align: center;
    }

    .character-modal .character-header h2 {
        font-size: 28px;
    }
}

@media (max-width: 600px) {
    .character-overlay {
        padding: 10px;
    }

    .character-modal {
        border-radius: 16px;
    }

    .character-modal .formcontainer {
        padding: 25px 20px;
    }
}
</style>
