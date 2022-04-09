<!-- @format -->
<template>
    <div :class="['follows']">
        <div class="follow-container">
            <div v-for="follow in follows" :key="follow.id">
                <div class="follow" @click="navigate(follow)">
                    <div class="avatar" v-tooltip.right="follow.name">
                        <div v-if="follow.imageUrl" class="image-container">
                            <img :src="follow.imageUrl" />
                        </div>
                        <div v-else class="blank-avatar"></div>
                    </div>
                    <div class="follow-text">
                        <p>{{ follow.name }}</p>
                        <p class="follow-type">{{ follow.type }}</p>
                    </div>
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
                    id: '624e4a6793d130a39d20f0e5',
                    name: 'Testament',
                    type: 'character',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649296698/Characters/Guilty%20Gear%20Strive/avatar/Testament.png',
                },
                {
                    id: '6250a30293d130a39d20f11c',
                    name: 'Rock Howard',
                    type: 'character',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649451461/Characters/King%20of%20Fighters%2015/avatar/Rock%20Howard.png',
                },
                {
                    id: '6250a30693d130a39d20f11d',
                    name: 'B.Jenet',
                    type: 'character',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649451461/Characters/King%20of%20Fighters%2015/avatar/B.Jenet.png',
                },
                {
                    id: '6250a30993d130a39d20f11e',
                    name: 'Gato',
                    type: 'character',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649451461/Characters/King%20of%20Fighters%2015/avatar/Gato.png',
                },
                {
                    id: '6024b01a0b99842b68eb9e32',
                    name: 'Street Fighter 5',
                    type: 'game',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1568898282/games/avmu0iu6nhnw2urd4nga.png',
                },
                {
                    id: '606d42021ddff92064798667',
                    name: 'Guilty Gear Strive',
                    type: 'game',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1617772519/games/s9otcsh05zwetey6mjtu.png',
                },
                {
                    id: '60764bb709978a3f4cc1ae00',
                    name: 'SonicFox',
                    type: 'player',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649453402/Players/SonicFox.png',
                },
                {
                    id: '6048487f4fd4ab5b68a083f0',
                    name: 'Punk',
                    type: 'player',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649453402/Players/PunkDaGod.png',
                },
                {
                    id: '6068c573847e1c36147de001',
                    name: 'Arslan Ash',
                    type: 'player',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649453402/Players/Arslan%20Ash.png',
                },

                {
                    id: '6068c573847e1c36147de001',
                    name: 'Latif',
                    type: 'player',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1649453402/Players/Latif.png',
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
    padding-top: 20px;
}

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
    margin-bottom: 15px;
    margin-left: 0px;
    transition: all 0.1s linear;
}

.follows .follow:hover {
    margin-left: 5px;
    transition: all 0.1s linear;
}

.follows .avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin: 7px 0px 0;
    background: #fff;
    margin-right: 10px;
}

.follows .avatar .image-container {
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    border: 2px solid #3eb489;
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
</style>
