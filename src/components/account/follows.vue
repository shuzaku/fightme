<!-- @format -->
<template>
    <div :class="['follows']">
        <div class="follow-container">
            <div v-for="follow in follows" :key="follow.id">
                <div class="follow" @click="navigate(follow)">
                    <div class="avatar" v-tooltip.right="follow.name">
                        <img v-if="follow.imageUrl" :src="follow.imageUrl" />
                        <div v-else class="blank-avatar"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'follows',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        },
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            follows: [],
            isOpen: false,
            isLoading: false
        };
    },
    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    mounted() {
        this.getFollows()
        this.isOpen = this.initialOpen;
    },

    methods: {
        getFollows() {
            if(this.account.followedGames.length > 0){
                this.follows.push(...this.account.followedGames);
            }
            if(this.account.followedCharacters.length > 0){
                this.follows.push(...this.account.followedCharacters);
            }
            if(this.account.followedPlayers.length > 0){
                this.follows.push(...this.account.followedPlayers);
            }


            this.follows.sort((a, b) => (a.addedDate > b.addedDate) ? 1 : -1);
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
        },

        navigate(follow) {
            this.$router.push(`/${follow.type}/${follow.id}`);
        }
    }
};
</script>
<style type="text/css">
.follows .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.follows.opened .mdi-chevron-down {
    transform: rotate(-90deg);
    transition: all 0.3s linear;
}
.follows .follow {
    color: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 5px;
    justify-content: space-around;
}

.follows .avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin: 7px 0px;
    background: #fff;

}

.follows .avatar img {
    width: 25px;
    height: 25px;
    margin-right: 0px;
    border-radius: 50%;
    border: 2px solid #3eb489;
}
</style>
