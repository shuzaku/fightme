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
            placeholder="Search or add a Character"
            @input="setCharacter($event)"
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
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'CharacterSearch',
    props: {
        taggable: {
            type: Boolean,
            default: false
        },
        gameId: {
            type: String,
            default: null
        },
        value: {
            type: Array,
            default: null
        },
        multiple: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            selectedCharacters: [],
            games: [],
            characterList: [],
            characters: []
        };
    },

    watch: {
        gameId() {
            this.getCharacters();
        }
    },

    mounted() {
        this.getCharacters();
    },

    methods: {
        customLabel({ name }) {
            return `${name}`;
        },

        setCharacter() {
            this.$emit('update:character', this.selectedCharacters);
        },

        async getCharacters() {
            const response = await CharactersService.queryCharacters([
                {
                    queryName: 'GameId',
                    queryValue: this.gameId
                }
            ]);

            this.characters = response.data.characters.map(character => {
                return {
                    id: character._id,
                    name: character.Name,
                    imageUrl: character.AvatarUrl
                };
            });

            if (this.value) {
                this.value.forEach(characterId => {
                    this.selectedCharacters.push(
                        this.characters.filter(character => character.id === characterId)[0]
                    );
                });
            }
        }
    }
};
</script>
<style type="text/css">
.character-search .name {
    margin-right: 5px;
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
}
</style>
