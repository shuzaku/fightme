<!-- @format -->
<template>
    <div class="character-search">
        <multiselect
            v-if="characters"
            v-model="selectedCharacters"
            :options="characters"
            :multiple="multiple"
            :close-on-select="!multiple"
            :clear-on-select="true"
            :preserve-search="true"
            :taggable="taggable"
            :custom-label="customLabel"
            label="name"
            :placeholder="placeHolder"
            @input="setCharacter($event)"
            track-by="id"
        >
            <template slot="singleLabel" slot-scope="props">
                <img class="option__image" :src="props.option.avatarUrl" />
                <span class="option__name">{{ props.option.name }}</span>
            </template>
            <template slot="option" slot-scope="props">
                <img class="option__image" :src="props.option.avatarUrl" />
                <div class="option__desc">
                    <span class="option__name">{{ props.option.name }}</span>
                </div>
            </template>
        </multiselect>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'CharacterSearch',
    props: {
        taggable: {
            type: Boolean,
            default: false,
        },
        gameId: {
            type: String,
            default: null,
        },
        value: {
            type: Array,
            default: null,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        placeHolder: {
            type: String,
            default: 'Search or add a Character',
        },
        defaultSelect: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            selectedCharacters: [],
            games: [],
            characterList: [],
            characters: [],
        };
    },

    watch: {
        gameId() {
            this.getCharacters();
        },
    },

    mounted() {
        if (this.gameId) {
            this.getCharacters();
        }
    },

    methods: {
        customLabel({ name }) {
            return `${name}`;
        },

        setCharacter() {
            this.$emit('update:character', this.selectedCharacters);
        },

        async getCharacters() {
            var searchQuery = [
                {
                    queryName: 'GameId',
                    queryValue: this.gameId,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await CharactersService.queryCharacters(queryParameter);

            this.characters = response.data.characters.map((character) => {
                return {
                    id: character._id,
                    name: character.Name,
                    avatarUrl: character.AvatarUrl,
                    imageUrl: character.ImageUrl,
                    slug: character.Slug,
                };
            });

            if (this.value.length > 0) {
                this.value.forEach((characterId) => {
                    this.selectedCharacters.push(
                        this.characters.filter((character) => character.id === characterId)[0]
                    );
                });
            } else if (this.defaultSelect) {
                this.selectedCharacters = this.characters[0];
                this.setCharacter();
            }
        },

        clearInput() {
            this.selectedCharacters = null;
        },
    },
};
</script>
<style type="text/css">
.character-search .name {
    margin-right: 5px;
}

.character-search .multiselect {
    margin-bottom: 0px;
}
.character-search .multiselect__tags {
    background: #ffffff10;
    border: #3eb489 1px solid;
    border-radius: 15px;
    padding: 10px 40px 0 16px;
}

.character-search .option__image {
    max-width: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

.character-search .multiselect__option,
.character-search .multiselect__single {
    display: flex;
    align-items: center;
    background: transparent;
    color: #fff;
}

.character-search .multiselect__option {
    background: #444;
}

.character-search .multiselect__option::after {
    display: none;
}

.character-search .search-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: #444;
    padding: 10px 10px;
    max-width: 570px;
    border-radius: 15px;
}

.character-search .search-container .multiselect {
    margin: 0 auto;
    width: 100%;
}

.character-search .search-container fieldset,
.character-search .multiselect__input,
.character-search .multiselect__single,
.character-search .multiselect__option {
    background: transparent;
    color: #fff;
}

.character-search .multiselect__option,
.character-search .multiselect__content {
    background: #2b2e36;
}

.character-search .multiselect__option--highlight {
    background: #3eb489;
}

.character-search .search-category,
.character-search .search-input {
    background: #444;
    color: #000;
    padding: 7px;
    border-radius: 8px;
    width: 200px;
    margin: 0 10px;
}

.character-search .multiselect__placeholder,
.character-search .multiselect__option {
    color: #fff;
}

.character-search .multiselect__option--disabled {
    background: #3eb489 !important;
    color: #fff !important;
}
</style>
