<!-- @format -->
<template>
    <div class="characters">
        <h1>Add Character</h1>
        <div class="form">
            <div class="character-container">
                <div v-if="imageUrl" class="character-img-container">
                    <img :src="imageUrl" class="character-img" />
                    <v-btn @click="imageUrl = ''">X</v-btn>
                </div>
                <input
                    v-model="characterName"
                    type="text"
                    name="name"
                    placeholder="Character Name"
                />
                <input
                    id="import-image"
                    v-model="imageUrl"
                    type="text"
                    placeholder="Character Image Url"
                />
                <game-search v-model="game.id" @update:game="setGame($event)" />
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addCharacter()">Submit</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import CharactersService from '@/services/characters-service';
import { eventbus } from '@/main';

export default {
    name: 'NewCharacter',

    components: {
        'game-search': GameSearch
    },

    data() {
        return {
            characterName: '',
            game: {
                name: null,
                id: null,
                imageUrl: null
            },
            imageUrl: null
        };
    },

    created() {
        this.getPlayer();
    },

    methods: {
        async addCharacter() {
            await CharactersService.addCharacter({
                Name: this.characterName,
                GameId: this.game.id,
                ImageUrl: this.imageUrl
            });

            eventbus.$emit('updateSearch');
            this.$emit('closeModal');
        },

        setGame(game) {
            this.game = game;
        }
    }
};
</script>
<style type="text/css">
.characters .character-img-container {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    display: flex;
    overflow: hidden;
    margin-bottom: 20px;
}
</style>
