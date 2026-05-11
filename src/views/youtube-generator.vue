<!-- @format -->
<template>
    <div class="yt-generator">
        <div class="generator-container">
            <div class="generator-header">
                <div class="header-content">
                    <i class="fas fa-youtube header-icon"></i>
                    <h1>YouTube Generator</h1>
                    <p class="header-subtitle">
                        Generate titles, descriptions, and tags for your match videos
                    </p>
                </div>
            </div>

            <div class="generator-content">
                <!-- Input Section -->
                <div class="input-section">
                    <div class="section-card">
                        <div class="section-header">
                            <i class="fas fa-gamepad section-icon"></i>
                            <h2>Game Selection</h2>
                        </div>
                        <div class="input-wrapper">
                            <game-search v-model="game.id" @update:game="updateGame($event)" />
                        </div>
                    </div>

                    <div class="players-section">
                        <div class="section-card player-card">
                            <div class="section-header">
                                <i class="fas fa-user section-icon"></i>
                                <h2>Player 1</h2>
                            </div>
                            <div class="input-wrapper">
                                <player-search
                                    v-model="player1.id"
                                    @update:player="addPlayer1($event)"
                                />
                            </div>
                            <div v-if="game.id" class="input-wrapper">
                                <character-search
                                    v-model="player1.characters"
                                    :gameId="game.id"
                                    @update:character="setPlayer1Characters($event)"
                                />
                            </div>
                        </div>

                        <div class="vs-divider">
                            <span class="vs-text">VS</span>
                        </div>

                        <div class="section-card player-card">
                            <div class="section-header">
                                <i class="fas fa-user section-icon"></i>
                                <h2>Player 2</h2>
                            </div>
                            <div class="input-wrapper">
                                <player-search
                                    v-model="player2.id"
                                    @update:player="addPlayer2($event)"
                                />
                            </div>
                            <div v-if="game.id" class="input-wrapper">
                                <character-search
                                    v-model="player2.characters"
                                    :gameId="game.id"
                                    @update:character="setPlayer2Characters($event)"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="submit-section">
                        <v-btn
                            class="generate-btn"
                            rounded
                            large
                            block
                            @click="submit"
                            :disabled="
                                !game.id ||
                                !player1.id ||
                                !player2.id ||
                                !player1.character ||
                                !player2.character
                            "
                        >
                            <i class="fas fa-magic"></i> Generate Content
                        </v-btn>
                    </div>
                </div>

                <!-- Output Section -->
                <div v-if="title || description || response" class="output-section">
                    <!-- Title Output -->
                    <div v-if="title" class="section-card output-card">
                        <div class="output-header">
                            <div class="output-title">
                                <i class="fas fa-heading output-icon"></i>
                                <h2>Title</h2>
                            </div>
                            <v-btn
                                class="copy-btn"
                                icon
                                small
                                @click="copyToClipboard(title, 'Title')"
                            >
                                <i class="fas fa-copy"></i>
                            </v-btn>
                        </div>
                        <div class="output-content title-output">
                            {{ title }}
                        </div>
                    </div>

                    <!-- Description Output -->
                    <div v-if="description" class="section-card output-card">
                        <div class="output-header">
                            <div class="output-title">
                                <i class="fas fa-align-left output-icon"></i>
                                <h2>Description</h2>
                            </div>
                            <v-btn
                                class="copy-btn"
                                icon
                                small
                                @click="copyToClipboard(description, 'Description')"
                            >
                                <i class="fas fa-copy"></i>
                            </v-btn>
                        </div>
                        <div class="output-content description-output" v-html="description"></div>
                    </div>

                    <!-- Tags Output -->
                    <div v-if="response" class="section-card output-card">
                        <div class="output-header">
                            <div class="output-title">
                                <i class="fas fa-tags output-icon"></i>
                                <h2>Tags</h2>
                            </div>
                            <v-btn
                                class="copy-btn"
                                icon
                                small
                                @click="copyToClipboard(response, 'Tags')"
                            >
                                <i class="fas fa-copy"></i>
                            </v-btn>
                        </div>
                        <div class="output-content tags-output">
                            {{ response }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import PlayerSearch from '@/components/players/player-search';
import CharacterSearch from '@/components/character/character-search';

export default {
    name: 'Tag Generator',

    components: {
        'game-search': GameSearch,
        'player-search': PlayerSearch,
        'character-search': CharacterSearch,
    },

    data() {
        return {
            player1: {
                id: null,
                name: null,
                character: null,
            },
            player2: {
                id: null,
                name: null,
                character: null,
            },
            game: {
                id: null,
                name: null,
            },
            response: null,
            title: null,
            description: null,
            copySuccess: false,
        };
    },

    mounted() {},

    methods: {
        setPlayer1Characters(character) {
            this.player1.character = character;
        },

        setPlayer2Characters(character) {
            this.player2.character = character;
        },

        addPlayer1(player) {
            this.player1.id = player.id;
            this.player1.name = player.playerName;
            this.player1.slug = player.slug;
            this.player1.twitter = player.twitter;
            this.player1.stream = player.stream;
            this.player1.youtube = player.youtube;
        },

        addPlayer2(player) {
            this.player2.id = player.id;
            this.player2.name = player.playerName;
            this.player2.slug = player.slug;
            this.player2.twitter = player.twitter;
            this.player2.stream = player.stream;
            this.player2.youtube = player.youtube;
        },

        updateGame(game) {
            this.game = game;
        },

        copyToClipboard(text, type) {
            // Strip HTML tags for plain text copying
            const textToCopy = text
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();

            this.$copyText(textToCopy)
                .then(() => {
                    this.copySuccess = true;
                    setTimeout(() => {
                        this.copySuccess = false;
                    }, 2000);
                    // Show success message
                    alert(`${type} copied to clipboard!`);
                })
                .catch((err) => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy to clipboard');
                });
        },

        submit() {
            this.response = `
            ${this.game.title},
            ${this.game.abbreviation}, 
            high level gameplay, 
            ${this.player1.name}, 
            ${this.player2.name},
            ${this.player1.name} vs ${this.player2.name},
            ${this.player1.name} ${this.player1.character.name},
            ${this.player2.name} ${this.player2.character.name},
            ${this.player1.character.name} ${this.game.title},
            ${this.player2.character.name} ${this.game.title},
            ${this.player1.character.name} ${this.game.abbreviation},
            ${this.player2.character.name} ${this.game.abbreviation},
            ${this.player1.character.name} high level play,
            ${this.player2.character.name} high level play`;

            if (this.game.title === 'Guilty Gear Strive') {
                this.response = this.response.concat(`, guilty gear, guilty gear -strive-, ggst`);
            }

            this.title = `[${this.game.title}]${this.game.abbreviation} Replay 
            ${this.player1.name}(${this.player1.character.name}) vs ${this.player2.name}(${this.player2.character.name})`;

            this.description = `<p>High level gameplay of ${this.player1.name} versus ${
                this.player2.name
            } </br>
            fighters-edge.com is a tool to query through all your favorite players, games, characters, matchups, etc, check it out today!</br>
            </br>See More ${this.player1.name}: </br>
            <ul>
            <li>Fighters Edge: https://fighters-edge.com/p/${this.player1.slug}</li>
            ${this.player1.twitter ? `<li>Twitter: ${this.player1.twitter} </li>` : ''}
            ${this.player1.stream ? `<li>Stream: ${this.player1.stream} </li>` : ''}
            ${this.player1.youtube ? `<li>Youtube: ${this.player1.youtube} </li>` : ''}
            </ul>

            </br>See More ${this.player2.name}: 
            <ul>
            <li>Fighters Edge:https://fighters-edge.com/p/${this.player2.slug}</li>
            ${this.player2.twitter ? `<li>Twitter: ${this.player2.twitter} </li>` : ''}
            ${this.player2.stream ? `<li>Stream: ${this.player2.stream} </li>` : ''}
            ${this.player2.youtube ? `<li>Youtube: ${this.player2.youtube} </li>` : ''}
            </ul>
            </br>See More ${this.player1.character.name}: https://fighters-edge.com/c/${
                this.player1.character.slug
            }</br>
            See More ${this.player2.character.name}: https://fighters-edge.com/c/${
                this.player2.character.slug
            }</br>
            See More ${this.player1.character.name} vs ${
                this.player2.character.name
            }: https://fighters-edge.com/MU/${this.player1.character.slug}/${
                this.player2.character.slug
            }</br></br>
            #${this.game.abbreviation}  #${this.player1.character.slug} #${
                this.player2.character.slug
            }</p>`;
        },
    },
};
</script>

<style scoped>
.yt-generator {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1d29 0%, #242832 100%);
    padding: 200px 20px 50px;
}

.generator-container {
    max-width: 1200px;
    margin: 0 auto;
}

.generator-header {
    text-align: center;
    margin-bottom: 50px;
}

.header-content {
    display: inline-block;
}

.header-icon {
    font-size: 64px;
    color: #ff0000;
    margin-bottom: 20px;
    display: block;
    animation: pulse 2s ease-in-out infinite;
}

.generator-header h1 {
    color: #fff;
    font-size: 42px;
    font-weight: 700;
    margin: 0 0 12px 0;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-subtitle {
    color: #ffffff90;
    font-size: 16px;
    margin: 0;
}

.generator-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.section-card {
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-icon {
    font-size: 24px;
    color: #3eb489;
}

.section-header h2 {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.input-wrapper {
    margin-bottom: 16px;
}

.input-wrapper:last-child {
    margin-bottom: 0;
}

.players-section {
    display: flex;
    gap: 24px;
    align-items: center;
}

.player-card {
    flex: 1;
}

.vs-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(62, 180, 137, 0.4);
}

.vs-text {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.submit-section {
    margin-top: 8px;
}

.generate-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-transform: none !important;
    height: 56px !important;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3) !important;
    transition: all 0.3s ease !important;
}

.generate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4) !important;
}

.generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
}

.generate-btn i {
    margin-right: 8px;
}

.output-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.output-card {
    animation: slideIn 0.4s ease;
}

.output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.output-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.output-icon {
    font-size: 20px;
    color: #3eb489;
}

.output-title h2 {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.copy-btn {
    color: #ffffff60 !important;
    transition: all 0.2s ease !important;
}

.copy-btn:hover {
    color: #3eb489 !important;
    transform: scale(1.1);
}

.output-content {
    color: #fff;
    line-height: 1.6;
    word-wrap: break-word;
}

.title-output {
    font-size: 20px;
    font-weight: 600;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border-left: 4px solid #3eb489;
}

.description-output {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
}

.description-output >>> p {
    margin: 0 0 12px 0;
}

.description-output >>> ul {
    margin: 8px 0;
    padding-left: 24px;
}

.description-output >>> li {
    margin: 4px 0;
}

.tags-output {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    white-space: pre-wrap;
    max-height: 300px;
    overflow-y: auto;
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.9;
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Mobile Responsive */
@media (max-width: 968px) {
    .generator-content {
        grid-template-columns: 1fr;
    }

    .players-section {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .vs-divider {
        width: 60px;
        height: 60px;
        margin: 0 auto;
    }

    .vs-text {
        font-size: 14px;
    }

    .generator-header h1 {
        font-size: 32px;
    }

    .header-icon {
        font-size: 48px;
    }
}

/* Scrollbar styling */
.description-output::-webkit-scrollbar,
.tags-output::-webkit-scrollbar {
    width: 8px;
}

.description-output::-webkit-scrollbar-track,
.tags-output::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.description-output::-webkit-scrollbar-thumb,
.tags-output::-webkit-scrollbar-thumb {
    background: rgba(62, 180, 137, 0.5);
    border-radius: 4px;
}

.description-output::-webkit-scrollbar-thumb:hover,
.tags-output::-webkit-scrollbar-thumb:hover {
    background: rgba(62, 180, 137, 0.7);
}
</style>
