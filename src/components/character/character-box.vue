<!-- @format -->
<template>
    <div class="character-box" @click="navigate()"><img :src="character.imageUrl" /></div>
</template>

<script>
import { characterPagePath } from '@/utils/game-character-routes';

export default {
    name: 'CharacterBox',

    props: {
        character: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    computed: {},

    created() {},

    methods: {
        navigate() {
            var gameLike =
                this.character && this.character.gameAbbrev
                    ? { Abbreviation: this.character.gameAbbrev }
                    : null;
            var path = characterPagePath(gameLike, this.character);
            if (path) {
                this.$router.push(path);
            }
        },
    },
};
</script>
<style type="text/css">
.character-box {
    cursor: pointer;
}
</style>
