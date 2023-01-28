<!-- @format -->
<template>
    <div class="home-view">
        <div class="nav">
            <div class="button-container">
                <p>games</p>
                <p>players</p>
                <p>characters</p>
                <p>creators</p>
                <p>tournaments</p>
            </div>
        </div>

        <div class="trending-players">
            <h2>Trending Players</h2>
            <player-spotlight :playerId="'60b834037c745f55fcd23ba6'" />
        </div>

        <div class="home-card">
            <h2>Trending Games</h2>
        </div>
    </div>
</template>

<script>
import PlayerSpotlight from '@/components/players/player-spotlight';

export default {
    name: 'Home',

    components: { 'player-spotlight': PlayerSpotlight },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {},
};
</script>

<style>
.home-view {
    width: 100%;
}

.home-view .nav {
    background: #4447e2;
    border-radius: 15px;
    padding: 20px;
    margin: 0 auto;
    max-width: 700px;
}

.home-view .button-container {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
}

.home-view .button-container p {
    color: #fff;
}
</style>
