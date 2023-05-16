<!-- @format -->
<template>
    <div class="home-view">
        <!-- <new-characters />
        <new-games />
        <new-tournament /> -->
        <div class="event-container">
            <latest-characters />
        </div>

        <home-side />
    </div>
</template>

<script>
import { eventbus } from '@/main';
import Events from '@/components/event/events';
import LatestCharacters from '@/components/character/latest-characters';
import ExploreGames from '@/components/explore/explore-games';
import HomeSide from '@/components/home/home-side';

export default {
    name: 'Home',

    components: {
        events: Events,
        'latest-characters': LatestCharacters,
        'explore-games': ExploreGames,
        'home-side': HomeSide,
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
    display: flex;
}

.home-view .event-container {
    max-width: 65%;
    margin-right: 2%;
    display: block;
    width: 100%;
}

.home-view .home-side {
    max-width: 35%;
    width: 100%;
}
</style>
