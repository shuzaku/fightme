<!-- @format -->
<template>
    <div class="trending-container">
        <h2>Trending</h2>
        <!-- Guilty Gear Strive-->
        <game-bubble :gameId="'606d42021ddff92064798667'" />
        <!-- SFV Rose-->
        <character-bubble :characterId="'60ba728cffee270021602089'" />
    </div>
</template>

<script>
import GameBubble from '@/components/games/game-bubble';
import CharacterBubble from '@/components/character/character-bubble';

export default {
    name: 'Trending',
    components: {
        'game-bubble': GameBubble,
        'character-bubble': CharacterBubble
    }
};
</script>

<style></style>
