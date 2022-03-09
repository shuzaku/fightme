<!-- @format -->
<template>
    <div class="explore-row">
        <div
            class="cover-art"
            :style="[
                { 'background-image': `url(${game.coverArt})` },
                { 'background-size': 'cover' },
            ]"
        />
        <div v-if="game.newCharacter" class="new-character">
            <character-spotlight :characterId="game.newCharacter" type="New" />
        </div>

        <div v-if="game.featuredCharacter" class="featured-character">
            <character-spotlight :characterId="game.featuredCharacter" type="Featured" />
        </div>

        <div v-if="game.featuredPlayer" class="featured-player">
            <player-spotlight :playerId="game.featuredPlayer" type="Player" />
        </div>
    </div>
</template>

<script>
import CharacterSpotlight from '@/components/character/character-spotlight';
import PlayerSpotlight from '@/components/players/player-spotlight';

export default {
    name: 'explore-row',
    components: {
        'character-spotlight': CharacterSpotlight,
        'player-spotlight': PlayerSpotlight,
    },

    props: {
        game: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    methods: {},
};
</script>

<style>
.explore-row {
    display: flex;
    margin-bottom: 20px;
}

.explore-row .cover-art,
.explore-row .new-character,
.explore-row .featured-character {
    margin-right: 10px;
}
</style>
