<!-- @format -->
<template>
    <div class="game-search">
        <multiselect
            v-if="filteredGames"
            v-model="selectedGame"
            :options="filteredGames"
            :multiple="taggable"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :taggable="taggable"
            :select-label="''"
            :loading="isLoading"
            :placeholder="placeholder"
            label="title"
            @tag="addGame"
            @input="setGame"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Game
                </span>
            </template>
            <template slot="option" slot-scope="props">
                <div class="game-option">
                    <div class="logo-container">
                        <img class="option__image" :src="props.option.logoUrl" alt="Game Logo" />
                    </div>
                    <div class="option__desc">
                        <span class="option__title">{{ props.option.title }}</span>
                    </div>
                </div>
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

        placeholder: {
            type: String,
            default: 'Search Game',
        },

        filteredGameIds: {
            type: Array,
            default: null,
        },
    },

    data() {
        return {
            games: [],
            selectedGame: null,
            isLoading: false,
        };
    },

    computed: {
        filteredGames() {
            if (!this.filteredGameIds) {
                return this.games;
            } else {
                return this.games.filter((game) => {
                    return this.filteredGameIds.some((filteredGameid) => {
                        return game.id === filteredGameid;
                    });
                });
            }
        },
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
            this.isLoading = true;
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

            this.games.sort((a, b) => (b.id > a.id ? 1 : -1));

            this.isLoading = false;

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
<style type="text/css">
.game-search .game-option {
    display: flex;
    align-items: center;
}

.game-search .game-option .logo-container {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.game-search .game-option .logo-container img {
    width: 100%;
    height: auto;
}
</style>
