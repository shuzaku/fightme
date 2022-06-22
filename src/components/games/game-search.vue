<!-- @format -->
<template>
    <div class="games-search">
        <multiselect
            v-if="games"
            v-model="selectedGame"
            :options="games"
            :multiple="taggable"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :taggable="taggable"
            placeholder="Search or add a Game"
            label="title"
            @tag="addGame"
            @input="setGame"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Game
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'GamesSearch',
    props: {
        taggable: {
            type: Boolean,
            default: false,
        },
        value: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            games: [],
            selectedGame: null,
        };
    },

    watch: {
        value() {
            this.getGames();
        },
    },

    mounted() {
        this.getGames();
    },

    methods: {
        async addGame(newGame) {
            await GamesService.addGame({
                GameTitle: newGame,
                CreatedDate: this.timestamp,
                UpdatedDate: null,
            });
        },

        async getGames() {
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map((game) => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl,
                    abbreviation: game.Abbreviation,
                    currentVersion: game.CurrentVersion,
                };
            });
            if (this.value) {
                this.selectedGame = this.games.filter((game) => game.id === this.value);
            }
        },

        setGame() {
            this.$emit('update:game', this.selectedGame);
        },
    },
};
</script>
<style type="text/css"></style>
