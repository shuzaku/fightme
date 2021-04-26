<!-- @format -->
<template>
    <div class="characters">
        <h1>Add Character</h1>
        <div class="form">
            <div class="character-container">
                <div class="character-img-container" v-if="imageUrl">
                    <img :src="imageUrl" class="character-img" />
                    <v-btn @click="imageUrl = ''">X</v-btn>
                </div>
                <input
                    type="text"
                    name="name"
                    placeholder="Character Name"
                    v-model="characterName"
                />
                <input
                    id="import-image"
                    type="text"
                    v-model="imageUrl"
                    placeholder="Character Image Url"
                />
                <game-search v-model="game" @update:game="setGame($event)" />
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
    name: 'NewGame',

    components: {
        'game-search': GameSearch
    },

    data() {
        return {
            characterName: '',
            game: null,
            imageUrl: null
        };
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
    },

    created() {
        this.getPlayer();
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
