<!-- @format -->
<template>
    <div class="explore-view">
        <div class="header">
            <h1>Explore</h1>
        </div>
        <events />
        <explore-games />
    </div>
</template>

<script>
import ExploreGames from '@/components/explore/explore-games';
import Events from '@/components/event/events';

export default {
    name: 'explore',

    components: {
        'explore-games': ExploreGames,
        events: Events,
    },

    data() {
        return {};
    },

    computed: {},

    methods: {},
};
</script>

<style>
.explore-view {
    padding: 10px 30px 0;
    min-width: calc(71vw - 140px);
    margin-top: 40px;
}

.explore-view .cover-art {
    width: 200px;
    height: 267px;
    background: cover;
    background-repeat: no-repeat;
}

.explore-view .cover-art img {
    width: 100%;
}

.explore-view h1 {
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.explore-view .header {
    margin-bottom: 30px;
    color: #fff;
    font-size: 20px;
}

.explore-view .explore-nav button {
    margin-right: 5px;
}

.explore-view .explore-nav {
    margin-bottom: 50px;
}

.explore-view .events {
    margin-bottom: 40px;
}
</style>
