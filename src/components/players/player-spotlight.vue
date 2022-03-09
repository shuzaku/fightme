<!-- @format -->
<template>
    <div v-if="player" class="player-spotlight" @click="navigateToPlayer()">
        <div class="banner">{{ type }}</div>
        <div class="inner-container">
            <div class="player-image" :style="{ backgroundImage: `url(${player.imageUrl})` }" />
            <h2 class="player-name">{{ player.name }}</h2>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';

export default {
    name: 'player-spotlight',
    components: {},

    props: {
        playerId: {
            type: String,
            default: null,
        },

        type: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            player: null,
        };
    },

    computed: {
        latestPlayer() {
            return this.players[this.players.length];
        },
    },

    mounted() {
        this.getPlayers();
    },

    methods: {
        async getPlayers() {
            var searchQuery = [
                {
                    queryName: 'Id',
                    queryValue: this.playerId,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await PlayersService.queryPlayers(queryParameter);
            var responsePlayer = response.data.players[0];
            this.player = {
                id: responsePlayer._id,
                name: responsePlayer.Name,
                imageUrl: responsePlayer.PlayerImg,
            };
        },

        navigateToPlayer() {
            this.$router.push(`/player/${this.playerId}`);
        },
    },
};
</script>

<style>
.player-spotlight {
    height: 267px;
    width: 175px;
    background: #fff;
    position: relative;
}

.player-spotlight .inner-container {
    border: 5px solid #3eb489;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.player-spotlight .player-image {
    background-size: cover;
    width: 100%;
    height: 100%;
    background-position: top center;
}

.player-spotlight h2 {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
    background: #3eb489;
    width: 100%;
    color: #fff;
    text-align: center;
    text-transform: uppercase;
    padding: 5px 0 0;
    letter-spacing: 2px;
    font-size: 12px;
}

.player-spotlight .banner {
    background: #000;
    color: #fff;
    padding: 0 10px;
    position: absolute;
    top: 15px;
    left: 0;
    z-index: 10;
}
</style>
