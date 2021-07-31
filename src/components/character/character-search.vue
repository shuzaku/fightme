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
            label="name"
            placeholder="Search or add a Character"
            @input="setCharacter($event)"
        >
            <template slot="selection">
                <span v-for="character in selectedCharacters" :key="character.id" class="name">{{
                    character.name
                }}</span>
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
                    imageUrl: character.ImageUrl
                };
            });

            if (this.value) {
                this.value.forEach(characterId => {
                    this.selectedCharacters.push(
                        this.characters.filter(character => character.id === characterId)
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
</style>
