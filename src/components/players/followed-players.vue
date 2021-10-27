<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'followed-players']">
        <div class="menu-item" @click="toggleOpen">
            Followed Players
            <v-icon>
                mdi-chevron-down
            </v-icon>
        </div>

        <div v-if="isOpen" class="players">
            <div v-for="player in players" :key="player.id">
                <div class="followed-player" @click="routeToPlayer(player.id)">
                    <div class="avatar">
                        <img v-if="player.imageUrl" :src="player.imageUrl" />
                        <div v-else class="blank-avatar"></div>
                    </div>
                    {{ player.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'followed-players',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        },
        followedPlayers: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            players: [],
            isOpen: false,
            isLoading: false
        };
    },
    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    watch: {
        followedPlayers() {
            this.getPlayers();
        }
    },

    mounted() {
        this.isOpen = this.initialOpen;
    },

    methods: {
        getPlayers() {
            this.isLoading = true;
            this.players = this.followedPlayers;
            this.isLoading = false;
        },

        toggleOpen() {
            this.isOpen = !this.isOpen;
        },

        collapse() {
            this.isOpen = false;
        },

        routeToPlayer(playerId) {
            this.$router.push(`/player/${playerId}`);
        }
    }
};
</script>
<style type="text/css">
.followed-players .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.followed-players.opened .mdi-chevron-down {
    transform: rotate(-90deg);
    transition: all 0.3s linear;
}
.followed-players .followed-player {
    color: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 5px;
}

.followed-players .avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    background: #fff;
    border: 2px solid #3eb489;
}

.followed-players .avatar img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    border: 2px solid #3eb489;
}
</style>
