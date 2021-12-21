<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'followed-games']">
        <div class="menu-item" @click="toggleOpen">
            Followed Games
            <v-icon>
                mdi-chevron-down
            </v-icon>
        </div>

        <div v-if="isOpen" class="games">
            <div v-for="game in games" :key="game.id">
                <div class="followed-game" @click="routeToGame(game.id)">
                    <div class="avatar">
                        <img v-if="game.imageUrl" :src="game.imageUrl" />
                        <div v-else class="blank-avatar"></div>
                    </div>
                    {{ game.title }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'followed-games',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        },
        followedGames: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            games: [],
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
        followedGames() {
            this.getGames();
        }
    },

    mounted() {
        this.isOpen = this.initialOpen;
    },

    methods: {
        getGames() {
            this.isLoading = true;
            this.games = this.followedGames;
            this.isLoading = false;
        },

        toggleOpen() {
            this.isOpen = !this.isOpen;
        },

        collapse() {
            this.isOpen = false;
        },

        routeToGame(gameId) {
            this.$router.push(`/game/${gameId}`);
        }
    }
};
</script>
<style type="text/css">
.followed-games .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.followed-games.opened .mdi-chevron-down {
    transform: rotate(-90deg);
    transition: all 0.3s linear;
}
.followed-games .followed-game {
    color: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 5px;
}

.followed-games .avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    background: #fff;
}

.followed-games .avatar img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    border: 2px solid #3eb489;
}
</style>
