<!-- @format -->
<template>
    <div class="latest-characters">
        <div class="character-list">
            <div class="character-container" v-for="character in characters" :key="character.id">
                <character-box :character="character" />
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import CharacterBox from '@/components/character/character-box';

export default {
    name: 'LatestCharacter',

    components: { 'character-box': CharacterBox },

    data() {
        return {
            characters: null,
        };
    },

    created() {
        this.getCharacters();
    },

    computed: {},

    methods: {
        async getCharacters() {
            const response = await CharactersService.fetchCharacters();

            this.characters = response.data.characters
                .map((character) => {
                    return {
                        id: character._id,
                        name: character.Name,
                        imageUrl: character.AvatarUrl,
                        slug: character.Slug,
                    };
                })
                .splice(0, 5);

            if (this.value) {
                this.value.forEach((characterId) => {
                    this.selectedCharacters.push(
                        this.characters.filter((character) => character.id === characterId)[0]
                    );
                });
            }
        },
    },
};
</script>
<style type="text/css">
.latest-characters h3 {
    color: #fff;
}

.latest-characters .character-list {
    display: flex;
}

.latest-characters .character-list .character-box {
    margin-right: 10px;
    border-radius: 50%;
    width: 65px;
    height: 100%;
    overflow: hidden;
}

.latest-characters .character-list .character-box img {
    width: 100%;
    height: 100%;
}
</style>
