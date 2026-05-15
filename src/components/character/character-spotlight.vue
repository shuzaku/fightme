<!-- @format -->
<template>
    <div v-if="character" class="character-spotlight" @click="navigateToCharacter()">
        <div class="banner">{{ type }}</div>
        <div class="inner-container">
            <div
                class="character-image"
                :style="{ backgroundImage: `url(${character.imageUrl})` }"
            />
            <h2 class="character-name">{{ character.name }}</h2>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import { characterPagePath } from '@/utils/game-character-routes';

export default {
    name: 'CharacterSpotlight',
    components: {},

    props: {
        characterId: {
            type: String,
            default: null,
        },

        type: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            character: null,
            characterGameLike: null,
        };
    },

    computed: {
        latestCharacter() {
            return this.characters[this.characters.length];
        },
    },

    mounted() {
        this.getCharacters();
    },

    methods: {
        async getCharacters() {
            var searchQuery = [
                {
                    queryName: 'Id',
                    queryValue: this.characterId,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await CharactersService.queryCharacters(queryParameter);
            var responseCharacter = response.data.characters[0];
            this.character = {
                id: responseCharacter._id,
                name: responseCharacter.Name,
                imageUrl: responseCharacter.ImageUrl,
                slug: responseCharacter.Slug || null,
            };
            this.characterGameLike =
                responseCharacter.Game && responseCharacter.Game[0]
                    ? { Abbreviation: responseCharacter.Game[0].Abbreviation }
                    : null;
        },

        navigateToCharacter() {
            var path = characterPagePath(this.characterGameLike, this.character);
            if (path) {
                this.$router.push(path);
            }
        },
    },
};
</script>

<style>
.character-spotlight {
    height: 267px;
    width: 175px;
    background: #fff;
    position: relative;
}

.character-spotlight .inner-container {
    border: 5px solid #3eb489;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.character-spotlight .character-image {
    background-size: cover;
    width: 100%;
    height: 100%;
    background-position: center center;
}

.character-spotlight h2 {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
    background: #3eb489;
    width: 100%;
    color: #fff;
    text-align: center;
    text-transform: uppercase;
    padding: 5px 0 0;
    letter-spacing: 2px;
    font-size: 12px;
}

.character-spotlight .banner {
    background: #000;
    color: #fff;
    padding: 0 10px;
    position: absolute;
    top: 15px;
    left: 0;
    z-index: 10;
}
</style>
