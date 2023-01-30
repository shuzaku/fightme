<!-- @format -->
<template>
    <div class="merge-players-view">
        <div class="merge-container">
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
        <div class="merge-btn-container">
            <v-btn class="merge-btn" :disabled="loading" @click="mergePlayer()">
                {{ loading ? 'loading...' : 'Merge ->' }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import PlayerSearch from '@/components/players/player-search';
import PlayersService from '@/services/players-service';

export default {
    name: 'MergePlayers',

    components: {
        'player-search': PlayerSearch,
    },

    props: {},

    data() {
        return {
            player1: null,
            player2: null,
            loading: false,
        };
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

        async mergePlayer() {
            this.loading = true;
            await PlayersService.mergePlayers({
                player1Id: this.player1.id,
                player2Id: this.player2.id,
            }).then(() => {
                this.loading = false;
            });
        },
    },
};
</script>

<style>
.merge-players-view {
    width: 100%;
    padding: 50px 0;
}

.merge-players-view .merge-container {
    display: flex;
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
    border-radius: 15px;
    padding: 20px;
    width: 35%;
    min-height: 400px;
    background: #1c1c24;
}

.merge-players-view .merge-btn-container {
    text-align: center;
}
</style>
