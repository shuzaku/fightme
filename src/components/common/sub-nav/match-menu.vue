<!-- @format -->
<template>
    <div class="match-nav inner-list">
        <h2>Matches</h2>
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
import { eventbus } from '@/main';

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
            this.$refs.gameSelect.collapse();
            this.selectedGame = game;
            eventbus.$emit('search', { queryName: 'GameId', queryValue: game.id });
        },

        updateCharacter(character) {
            this.selectedCharacter = character;
            eventbus.$emit('search', { queryName: 'CharacterId', queryValue: character.id });
        }
    }
};
</script>
