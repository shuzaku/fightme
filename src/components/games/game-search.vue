<!-- @format -->
<template>
    <div class="game-search">
        <multiselect
            v-if="filteredGames"
            v-model="selectedGame"
            :options="filteredGames"
            :multiple="taggable || multiple"
            :close-on-select="!(taggable || multiple)"
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
            <template v-if="multiple && !taggable" slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    {{ values.length }} game{{ values.length === 1 ? '' : 's' }} selected
                </span>
            </template>
            <template v-else slot="selection" slot-scope="{ values, isOpen }">
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
        // Allow selecting more than one game without enabling `taggable`'s
        // "type to create a new Game doc" behavior — kept as a separate flag
        // so existing taggable-multiselect callers (new-tournament.vue,
        // edit-tournament.vue) are unaffected.
        multiple: {
            type: Boolean,
            default: false,
        },
        value: {
            type: [String, Array],
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
            selectedGame: this.taggable || this.multiple ? [] : null,
            isLoading: false,
        };
    },

    computed: {
        filteredGames() {
            const raw = this.filteredGameIds;
            if (!raw || !raw.length) {
                return this.games;
            }
            const norm = function (id) {
                if (id == null) return '';
                return id.toString ? String(id.toString()) : String(id);
            };
            return this.games.filter((game) => {
                const gid = norm(game.id);
                return raw.some((fid) => gid === norm(fid));
            });
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
            this.selectedGame = this.resolveSelectedFromValue();
        },

        // `value` is either a single id (String) or, when `multiple`/`taggable`
        // is on, an array of ids/game objects — normalize either shape into
        // what vue-multiselect expects for its v-model.
        resolveSelectedFromValue() {
            const isMulti = this.taggable || this.multiple;
            const idOf = (v) => (v && typeof v === 'object' ? v.id || v._id : v);

            if (Array.isArray(this.value)) {
                const wanted = this.value.map((v) => String(idOf(v)));
                return this.games.filter((game) => wanted.includes(String(game.id)));
            }

            if (this.value) {
                const match = this.games.find((game) => String(game.id) === String(this.value)) || null;
                return isMulti ? (match ? [match] : []) : match;
            }

            return isMulti ? [] : null;
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
