<!-- @format -->
<template>
    <div class="yt-generator">
        <div class="container">
            <game-search v-model="game.id" @update:game="updateGame($event)" />
            <div class="players">
                <div class="player1">
                    <player-search v-model="player1.id" @update:player="addPlayer1($event)" />
                    <character-search
                        v-if="game.id"
                        v-model="player1.characters"
                        :gameId="game.id"
                        @update:character="setPlayer1Characters($event)"
                    />
                </div>
                <div class="player2">
                    <player-search v-model="player2.id" @update:player="addPlayer2($event)" />
                    <character-search
                        v-if="game.id"
                        v-model="player2.characters"
                        :gameId="game.id"
                        @update:character="setPlayer2Characters($event)"
                    />
                </div>
            </div>
            <label>Title:</label>
            <h2 v-if="title">{{ title }}</h2>
            <label>Description:</label>
            <p class="description" v-html="description" v-if="description"></p>
            <label>Tags:</label>
            <div class="response" v-if="response">
                {{ response }}
            </div>
        </div>
        <v-btn @click="submit">Submit</v-btn>
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

<style>
.yt-generator {
    padding: 50px 0;
}

.yt-generator .players {
    display: flex;
    margin: 20px 0;
}

.yt-generator .response {
    background: #fff;
    padding: 10px;
}

.yt-generator label {
    color: #3eb489;
}

.yt-generator h2,
.yt-generator .description {
    color: #fff;

    margin-bottom: 30px;
}
</style>
