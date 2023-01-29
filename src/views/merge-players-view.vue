<!-- @format -->
<template>
    <div class="merge-players-view">
        <div class="player1 player-card">
            <player-search v-model="player1" @update:player="setPlayer1($event)" />
            <div class="player-info" v-if="player1">
                <h3>{{ player1.playerName }}</h3>
                <p>Id: {{ player1.id }}</p>
                <p></p>
                <p>Matchup Appearance: {{ player1.matchupAppearance }}</p>
                <p>Slug: {{ player1.slug }}</p>
            </div>
        </div>
        <v-btn @click="swapPlayers()"><- Swap Position -></v-btn>
        <div class="player2 player-card">
            <player-search v-model="player2" @update:player="setPlayer2($event)" />
            <div class="player-info" v-if="player2">
                <h3>{{ player2.playerName }}</h3>
                <p>Id: {{ player2.id }}</p>
                <p></p>

                <p>Matchup Appearance: {{ player2.matchupAppearance }}</p>
                <p>Slug: {{ player2.slug }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import PlayerSearch from '@/components/players/player-search';

export default {
    name: 'MergePlayers',

    components: {
        'player-search': PlayerSearch,
    },

    props: {},

    data() {
        return { player1: null, player2: null };
    },

    computed: {},

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {
        setPlayer1(player) {
            this.player1 = player;
        },
        setPlayer2(player) {
            this.player2 = player;
        },

        swapPlayers() {
            var player1 = this.player1;
            var player2 = this.player2;

            this.player1 = player2;
            this.player2 = player1;
        },
    },
};
</script>

<style>
.merge-players-view {
    display: flex;
    padding: 50px;
    width: 100%;
    justify-content: space-between;
    align-items: center;
}

.merge-players-view {
    color: #fff;
}

.merge-players-view .players-search {
    margin-bottom: 20px;
}

.merge-players-view .player-card {
    border: 2px solid #3eb489;
    border-radius: 3px;
    padding: 20px;
    width: 40%;
}
</style>
