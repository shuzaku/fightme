<!-- @format -->
<template>
    <div class="matchup-box" :style="boxStyle">
        <character-search
            ref="characterSearch"
            v-model="selectedCharacter"
            :gameId="character.gameId"
            :placeHolder="'Search Matchup'"
            @update:character="goToMatchup($event)"
        />
    </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search';
export default {
    name: 'MatchupBox',

    components: { 'character-search': CharacterSearch },
    props: {
        character: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            selectedCharacter: null,
        };
    },

    computed: {
        boxStyle() {
            return {
                'background-image': `url(${this.character.imageUrl})`,
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
            };
        },
    },

    mounted() {},

    methods: {
        goToMatchup(character) {
            this.$refs.characterSearch.clearInput();
            this.$emit('update-matchup', character);
        },
    },
};
</script>

<style type="text/css">
.matchup-box {
    width: 300px;
    height: 300px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    padding-bottom: 30px;
}

.matchup-box .character-search {
    max-width: 270px;
    width: 100%;
}
</style>
