<!-- @format -->
<template>
    <div ref="videoViewRef" class="player-list-view">
        <table>
            <tr v-for="player in players" :key="player.id">
                <td>{{ player.appearance }}</td>
                <td>{{ player.name }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';

export default {
    name: 'PlayerList',

    components: {},

    data() {
        return {
            players: [],
        };
    },

    computed: {},

    watch: {},

    mounted() {
        this.queryPlayers();
    },

    beforeDestroy() {},

    methods: {
        async queryPlayers() {
            const response = await PlayersService.fetchPlayers();
            this.players = response.data.players.map((player) => {
                return {
                    id: player._id,
                    name: player.Name,
                    appearance: player.MatchupAppearance,
                };
            });

            this.players.sort((a, b) => (a.appearance < b.appearance ? 1 : -1));
        },
    },
};
</script>

<style>
.player-list-view {
    position: relative;
    justify-content: space-around;
    padding-top: 80px;
    height: 100%;
    overflow: hidden;
    color: #fff;
}
</style>
