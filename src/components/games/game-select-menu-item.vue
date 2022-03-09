<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'game-selct-menu-item']">
        <div class="menu-item" @click="toggleOpen">
            Games
            <v-icon> mdi-chevron-down </v-icon>
        </div>

        <div v-if="isOpen" class="games">
            <multiselect
                v-if="!isLoading"
                :value="value"
                :options="games"
                :close-on-select="true"
                :clear-on-select="true"
                :preserve-search="true"
                :custom-label="customLabel"
                placeholder="Games"
                label="name"
                track-by="id"
                @input="selectGame($event)"
            >
                <template slot="singleLabel" slot-scope="props">
                    <img class="option__image" :src="props.option.logoUrl" />
                    <span class="option__name">{{ props.option.title }}</span>
                </template>
                <template slot="option" slot-scope="props"
                    ><img class="option__image" :src="props.option.logoUrl" />
                    <div class="option__desc">
                        <span class="option__name">{{ props.option.title }}</span>
                    </div>
                </template>
            </multiselect>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'game-select',
    props: {
        initialOpen: {
            type: Boolean,
            default: false,
        },
        value: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            games: [],
            isOpen: false,
            isLoading: false,
        };
    },

    computed: {
        componentStyle() {
            return '[{opened: }]';
        },
    },

    mounted() {
        this.getGames();
        this.isOpen = this.initialOpen;
    },

    methods: {
        customLabel({ name }) {
            return `${name}`;
        },

        async getGames() {
            this.isLoading = true;
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map((game) => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl,
                    selected: false,
                };
            });
            this.isLoading = false;
        },

        selectGame(game) {
            this.games.forEach((game) => {
                game.selected = false;
            });

            game.selected = true;
            this.$emit('game-selected', game);
        },

        toggleOpen() {
            this.$emit('selectExpand');
            this.isOpen = !this.isOpen;
        },

        collapse() {
            this.isOpen = false;
        },
    },
};
</script>
<style type="text/css">
.game-selct-menu-item .multiselect__option::after {
    display: none;
}

.game-selct-menu-item .option__image {
    max-width: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

.game-selct-menu-item .multiselect__option,
.game-selct-menu-item .multiselect__single {
    display: flex;
    align-items: center;
}
</style>
