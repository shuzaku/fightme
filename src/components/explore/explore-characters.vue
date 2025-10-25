<!-- @format -->
<template>
    <div class="explore-characters">
        <div class="characters">
            <div
                v-for="character in characters"
                :key="character.id"
                class="character"
                v-tooltip="character.name"
            >
                <img :src="character.imageUrl" @click="navigate(character.id)" />
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'explore-character',
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

            if (this.value) {
                this.value.forEach((characterId) => {
                    this.selectedCharacters.push(
                        this.characters.filter((character) => character.id === characterId)[0]
                    );
                });
            }
        },

        navigate(id) {
            this.$router.push(`/character/${id}`);
        },
    },
};
</script>

<style>
.explore-characters .characters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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
