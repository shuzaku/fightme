<!-- @format -->
<template>
    <div ref="videoViewRef" class="games-view">
        <explore-games />
    </div>
</template>

<script>
import ExploreGames from '@/components/explore/explore-games';

export default {
    name: 'Games',

    components: {
        'explore-games': ExploreGames,
    },

    data() {
        return {
            games: [],
        };
    },

    computed: {},

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {},
};
</script>

<style>
.games-view {
    position: relative;
    justify-content: space-around;
    padding-top: 80px;
    height: 100%;
    overflow: hidden;
}
</style>
