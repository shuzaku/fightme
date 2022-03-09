<!-- @format -->
<template>
    <div class="combo-nav inner-list">
        <h2>Matchups</h2>
        <game-select-menu-item
            v-model="selectedGame"
            initialOpen
            @game-selected="setGame($event)"
        />
        <character-select-menu-item
            v-model="character1"
            :gameId="selectedGame.id"
            @character-selected="matchupCharacter1($event)"
        />
        <character-select-menu-item
            v-model="character2"
            :title="'Matchup'"
            :gameId="selectedGame.id"
            @character-selected="matchupCharacter2($event)"
        />
    </div>
</template>

<script>
import GameSelectMenuItem from '@/components/games/game-select-menu-item';
import CharacterSelectMenuItem from '@/components/character/character-select-menu-item';
import { eventbus } from '@/main';

export default {
    components: {
        'game-select-menu-item': GameSelectMenuItem,
        'character-select-menu-item': CharacterSelectMenuItem,
    },

    data() {
        return {
            selectedGame: {
                id: null,
            },
            selectedCharacter: null,
            character2: null,
            character1: null,
        };
    },

    methods: {
        setGame(game) {
            if (this.selectedGame !== game) {
                this.selectedGame = game;
                this.character1 = null;
                this.character2 = null;
            }
        },

        matchupCharacter1(character) {
            this.character1 = character;
            eventbus.$emit('matchup-character1', character.id);
        },

        matchupCharacter2(character) {
            this.character2 = character;
            eventbus.$emit('matchup-character2', character.id);
        },
    },
};
</script>
