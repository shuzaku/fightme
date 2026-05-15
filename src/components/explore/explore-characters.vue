<!-- @format -->
<template>
    <div class="explore-characters">
        <div class="characters">
            <div
                v-for="character in characters"
                :key="character.id"
                v-tooltip="character.name"
                class="character"
            >
                <img :src="character.imageUrl" @click="navigate(character)" />
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import { characterPathSegment } from '@/utils/game-character-routes';

export default {
    name: 'ExploreCharacter',
    components: {},

    props: {
        gameId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            characters: [],
        };
    },
    mounted() {
        this.getCharacters();
    },

    methods: {
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
                    imageUrl: character.AvatarUrl,
                    slug: character.Slug,
                };
            });
        },

        navigate(character) {
            var seg = characterPathSegment(character);
            if (seg) {
                this.$router.push(`/character/${encodeURIComponent(seg)}`);
            }
        },
    },
};
</script>

<style>
.explore-characters .characters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

.explore-characters .characters .character img {
    max-width: 75px;
    width: 100%;
    max-height: 75px;
    height: auto;
    cursor: pointer;
    border-radius: 24px;
    border: 1px solid #4447e2;
}
</style>
