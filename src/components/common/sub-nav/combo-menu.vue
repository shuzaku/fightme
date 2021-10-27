<!-- @format -->
<template>
    <div class="combo-nav inner-list ">
        <h2>Combos</h2>
        <game-select-menu-item
            ref="gameSelect"
            v-model="selectedGame"
            initialOpen
            @game-selected="updateGame($event)"
        />
        <character-select-menu-item
            v-if="selectedGame"
            ref="characterSelect"
            v-model="selectedCharacter"
            :gameId="selectedGame.id"
            @character-selected="updateCharacter($event)"
        />
    </div>
</template>

<script>
import GameSelectMenuItem from '@/components/games/game-select-menu-item';
import CharacterSelectMenuItem from '@/components/character/character-select-menu-item';

export default {
    components: {
        'game-select-menu-item': GameSelectMenuItem,
        'character-select-menu-item': CharacterSelectMenuItem
    },

    data() {
        return {
            selectedGame: {
                id: null
            },
            selectedCharacter: null
        };
    },

    methods: {
        updateGame(game) {
            var searchQuery = {
                type: 'Game',
                value: game.id
            };
            this.$refs.gameSelect.collapse();
            this.selectedGame = game;
            this.$emit('set-search', searchQuery);
        },

        updateCharacter(character) {
            var searchQuery = {
                type: 'Character',
                value: character.id
            };
            this.selectedCharacter = character;
            this.$emit('set-search', searchQuery);
        }
    }
};
</script>
