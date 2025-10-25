<!-- @format -->
<template>
    <div :class="['follows']">
        <div class="follow-container">
            <div v-for="follow in follows" :key="follow.id">
                <div class="follow" @click="navigate(follow)" v-tooltip="follow.name">
                    <div class="avatar">
                        <div v-if="follow.imageUrl" class="image-container">
                            <img :src="follow.imageUrl" />
                        </div>
                        <div v-else class="blank-avatar"></div>
                    </div>
                    <!-- <div class="follow-text">
                        <p>{{ follow.name }}</p>
                        <p class="follow-type">{{ follow.type }}</p>
                    </div> -->
                </div>
            </div>
            <div v-if="!account" class="guest-msg">
                <em>Login/Sign Up to follow your favorite games, characters, and players.</em>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    name: 'follows',
    props: {
        initialOpen: {
            type: Boolean,
            default: false,
        },
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            follows: [],
            isOpen: false,
            isLoading: false,
        };
    },
    computed: {
        componentStyle() {
            return '[{opened: }]';
        },
    },
    created() {
        eventbus.$on('account:update', this.getFollows);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.getFollows);
    },

    mounted() {
        if (this.account && this.account.id) {
            this.getFollows();
        } else {
            this.getDefaultFollows();
        }
        this.isOpen = this.initialOpen;
    },

    methods: {
        getFollows(response) {
            this.follows = [];
            var account = response || this.account;

            if (account.followedGames.length > 0) {
                this.follows.push(...account.followedGames);
            }
            if (account.followedCharacters.length > 0) {
                this.follows.push(...account.followedCharacters);
            }
            if (account.followedPlayers.length > 0) {
                this.follows.push(...account.followedPlayers);
            }

            this.follows.sort((a, b) => (a.addedDate > b.addedDate ? 1 : -1));
            this.isLoading = true;
            this.games = this.followedGames;
            this.isLoading = false;
        },

        getDefaultFollows() {
            this.follows = [
                {
                    id: '67c358569ce15c00218b5873',
                    name: 'FATAL FURY: City of the Wolves',
                    type: 'game',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1740855370/games/ecznnci6aqejsngrkjh4.png',
                },
                {
                    id: '634645f85d8bf70023c99296',
                    name: 'Street Fighter 6',
                    type: 'game',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1665546369/games/bts6pobeh6hukjj32npl.png',
                },
                {
                    id: '67c359836f9ae2e8686afe57',
                    name: 'Hotaru',
                    type: 'character',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1740854974/Characters/Fatal%20Fury:%20COTW/avatar/Hotaru.png',
                },
                {
                    id: '634645f95d8bf70023c992a1',
                    name: 'Blanka',
                    type: 'character',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1665548718/Characters/Street%20Fighter%206/avatar/Blanka.png',
                },
                {
                    id: '62e19ba15621c100235adc99',
                    name: 'Xiaohai',
                    type: 'player',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1746142792/Players/vnxpxidiqczf81mrw8ml.png',
                },
                {
                    id: '6048487f4fd4ab5b68a083f0',
                    name: 'Punk',
                    type: 'player',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1746142792/Players/i2woasgnzotsvhrbiaoj.png',
                },
            ];
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
        },
    },
};
</script>
<style type="text/css">
.follows {
    top: 60px;
    position: fixed;
    padding: 0 40px;
    color: #fff;
    background: #4447e2;
    z-index: 888;
    width: 100%;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    padding: 4px;
}

.follows .follow-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
}

.follows .follow {
    color: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 0px;
    transition: all 0.1s linear;
}

.follows .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    margin-right: 10px;
}

.follows .avatar .image-container {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    border: 2px solid #3eb489;
    background: #242832;
    overflow: hidden;
}

.follows .avatar img {
    margin-right: 0px;
    width: 100%;
    border-radius: 50%;
}

.follows .follow-type {
    text-transform: capitalize;
    font-size: 10px;
}

.follows em {
    color: #fff;
    font-size: 12px;
}

.follows .guest-msg {
    max-width: 80%;
}

.mobile .follows {
    top: 50px;
}
</style>
