<!-- @format -->
<template>
    <div class="player-nav">
        <div class="player-header" :style="playerbubbleStyle">
            <div class="options">
                <h2>{{ name }}</h2>
            </div>
        </div>
        <div class="quick-nav">
            <div v-if="account" class="followed-container">
                <div v-if="!isFollowed" class="follow-btn info-card" @click="followPlayer()">
                    <v-icon> mdi-heart-outline </v-icon>
                </div>
                <div v-else class="unfollow-btn info-card" @click="unfollowPlayer()">
                    <v-icon> mdi-heart </v-icon>
                </div>
            </div>
            <div class="info-card matches" @click="filter('Match')">Matches</div>
            <div class="info-card montages" @click="filter('Montage')">Montages</div>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import PlayerSearch from '@/components/players/player-search';
import { eventbus } from '@/main';

export default {
    name: 'PlayerNav',

    components: {
        'player-search': PlayerSearch,
    },

    props: {
        playerId: {
            type: String,
            default: '',
        },

        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            name: null,
            imageUrl: null,
            gameId: null,
            popupActive: false,
            isFollowed: false,
        };
    },

    computed: {
        playerbubbleStyle() {
            return {
                'background-image': `url(${this.imageUrl})`,
                'background-size': '30%',
                'background-repeat': 'no-repeat',
                'background-position': '0% 20%',
            };
        },
    },

    watch: {
        playerId() {
            this.getPlayer();
        },
    },

    created() {
        eventbus.$on('account:update', this.isPlayerFollowed);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isPlayerFollowed);
    },

    mounted() {
        this.getPlayer();
        this.isPlayerFollowed();
    },

    methods: {
        async getPlayer() {
            const response = await PlayersService.getPlayer({
                id: this.playerId,
            });
            this.name = response.data.Name;
            this.imageUrl = response.data.playerImg;
        },

        filter(filterType) {
            this.$emit('player-filter:update', filterType);
        },

        unfollowPlayer() {
            eventbus.$emit('player:unfollow', this.playerId);
        },

        followPlayer() {
            eventbus.$emit('player:follow', this.playerId);
        },

        isPlayerFollowed(response) {
            if (account) {
                var account = response || this.account;
                this.isFollowed = account.followedPlayers.some(
                    (player) => player.id === this.playerId
                );
            }
        },
    },
};
</script>
<style type="text/css">
.player-nav {
    width: 100%;
    z-index: 99;
}

.player-nav .player-header {
    height: 80px;
    background: #242832;
    color: #4447e2;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    border: 2px solid #4447e2;
    border-radius: 15px;
}

.player-nav .player-header h2 {
    text-align: right;
}

.player-nav .info-card {
    width: 130px;
    height: 40px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 2px solid #4447e2;
    color: #4447e2;
    background: #242832;
    cursor: pointer;
    margin-right: 5px;
    position: relative;
}

.player-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.player-nav .popup {
    background: #4447e2;
    width: 100%;
    margin-top: 20px;
    padding: 2px 2px;
    border-radius: 5px;
}

.player-nav .mdi-chevron-down::before {
    content: '\F0140';
    color: #4447e2;
}

.player-nav .follow-btn,
.player-nav .unfollow-btn {
    width: 50px;
}

.player-nav .v-icon.v-icon {
    color: #4447e2;
}
</style>
