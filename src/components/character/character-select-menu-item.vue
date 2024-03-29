<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'character-select-menu-item']">
        <div class="menu-item" @click="toggleOpen">
            {{ title }}
            <v-icon> mdi-chevron-down </v-icon>
        </div>
        <div v-if="isOpen" class="characters">
            <multiselect
                v-if="!isLoading"
                :value="value"
                :options="characters"
                :close-on-select="true"
                :clear-on-select="true"
                :preserve-search="true"
                :custom-label="customLabel"
                placeholder="Characters"
                label="name"
                track-by="id"
                @input="selectCharacter($event)"
            >
                <template slot="singleLabel" slot-scope="props">
                    <img class="option__image" :src="props.option.imageUrl" />
                    <span class="option__name">{{ props.option.name }}</span>
                </template>
                <template slot="option" slot-scope="props"
                    ><img class="option__image" :src="props.option.imageUrl" alt="No Man’s Sky" />
                    <div class="option__desc">
                        <span class="option__name">{{ props.option.name }}</span>
                    </div>
                </template>
            </multiselect>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'character-menu-select-item',
    props: {
        initialOpen: {
            type: Boolean,
            default: false,
        },
        gameId: {
            type: String,
            default: null,
        },
        value: {
            type: Object,
            default: null,
        },
        title: {
            type: String,
            default: 'Characters',
        },
    },

    data() {
        return {
            characters: [],
            isOpen: false,
            characterMenuOpen: false,
            isLoading: false,
            selectedCharacter: null,
        };
    },

    computed: {
        routeCharacterId() {
            if (this.$route.name === 'Character') {
                return this.$route.params.id;
            } else {
                return null;
            }
        },
    },

    watch: {
        gameId() {
            this.getCharacters();
        },
        routeCharacterId() {
            this.getCharacter();
        },
    },

    mounted() {
        if (!this.gameId) {
            this.getCharacter();
        } else {
            this.getCharacters();
        }
        if (this.value) {
            this.selectedCharacter = this.value;
        }
        this.isOpen = this.initialOpen;
    },

    methods: {
        customLabel({ name }) {
            return `${name}`;
        },

        async getCharacters() {
            this.isLoading = true;
            var response = null;
            if (this.selectedCharacter != 'all') {
                var searchQuery = [
                    {
                        queryName: 'GameId',
                        queryValue: this.gameId,
                    },
                ];
                var queryParameter = {
                    searchQuery: searchQuery,
                };
                response = await CharactersService.queryCharacters(queryParameter);
            } else {
                response = await CharactersService.fetchCharacters();
            }

            this.characters = response.data.characters.map((character) => {
                return {
                    id: character._id,
                    name: character.Name,
                    imageUrl: character.AvatarUrl,
                };
            });

            this.isLoading = false;
        },

        async getCharacter() {
            if (this.selectedCharacter) {
                const response = await CharactersService.getCharacter({
                    id: this.selectedCharacter.id,
                });

                this.$emit('gameUpdate', {
                    gameId: response.data.GameId,
                });

                this.selectedCharacter = {
                    id: response.data._id,
                    name: response.data.Name,
                    imageUrl: response.data.AvatarUrl,
                };
            }
        },

        selectCharacter(character) {
            this.characters.forEach((character) => {
                character.selected = false;
            });
            character.selected = true;

            this.$emit('character-selected', character);
            this.characterMenuOpen = false;
        },

        toggleOpen() {
            this.$emit('selectExpand');
            this.isOpen = !this.isOpen;
        },

        clearCharater() {
            this.isOpen = false;
            this.selectedCharacter = null;
        },

        collapse() {
            this.isOpen = false;
        },
    },
};
</script>
<style type="text/css">
.character-select-menu-item .multiselect__option::after {
    display: none;
}

.character-select-menu-item .option__image {
    max-width: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

.character-select-menu-item .multiselect__option,
.character-select-menu-item .multiselect__single {
    display: flex;
    align-items: center;
}
</style>
