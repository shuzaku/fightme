<!-- @format -->
<template>
    <div class="home-view">
        <!-- <new-characters />
        <new-games />
        <new-tournament /> -->
        <events />
        <latest-characters />
        <explore-games />
    </div>
</template>

<script>
import { eventbus } from '@/main';
import Events from '@/components/events/events';
import LatestCharacters from '@/components/character/latest-characters';
import ExploreGames from '@/components/explore/explore-games';
export default {
    name: 'Home',

    components: {
        events: Events,
        'latest-characters': LatestCharacters,
        'explore-games': ExploreGames,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            notes: null,
        };
    },

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {},
};
</script>

<style>
.home-view {
    padding-top: 40px;
}

.home-view .events,
.home-view .latest-characters {
    margin-bottom: 20px;
}
</style>
