<!-- @format -->
<template>
    <div :class="['follows']">
        <div class="follow-container">
            <div class="follows-list">
                <div v-for="follow in follows" :key="follow.id">
                    <div
                        class="follow"
                        @click="navigate(follow)"
                        @mouseenter="onFollowHover($event, follow)"
                        @mouseleave="activeTooltip = null"
                    >
                        <div class="avatar">
                            <div v-if="follow.imageUrl" class="image-container">
                                <img :src="follow.imageUrl" />
                            </div>
                            <div v-else class="blank-avatar"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="activeTooltip" class="follows-tooltip" :style="tooltipStyle">
                {{ activeTooltip }}
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
            activeTooltip: null,
            tooltipStyle: {},
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

        onFollowHover(event, follow) {
            const rect = event.currentTarget.getBoundingClientRect();
            this.tooltipStyle = {
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.bottom + 8}px`,
            };
            this.activeTooltip = follow.name;
        },
    },
};
</script>
<style type="text/css">
.follows {
    /* Stack directly under the top bar; must match .top-bar min-height (:root --app-top-bar-height in App.vue) */
    top: var(--app-top-bar-height, 84px);
    left: 0;
    right: 0;
    position: fixed;
    color: #fff;
    background: #4447e2;
    z-index: 998;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    padding: 6px 10px 8px;
    /* Keep height predictable: one scrollable row of avatars + optional guest line */
    min-height: 0;
    max-height: 120px;
    overflow: hidden;
}

.follows .follow-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    min-width: 0;
}

.follows .follows-list {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    gap: 0 6px;
    padding: 0 2px 4px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.follows .follows-list::-webkit-scrollbar {
    display: none;
}

.follows .follow {
    color: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 0;
    flex: 0 0 auto;
    transition: all 0.1s linear;
}

.follows .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #fff;
    margin-right: 6px;
    flex-shrink: 0;
}

.follows .avatar .image-container {
    border-radius: 50%;
    width: 36px;
    height: 36px;
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
    text-align: center;
    margin: 0;
    padding: 0 4px;
    line-height: 1.25;
    max-height: 2.5em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.follows .guest-msg em {
    font-size: 11px;
    font-style: normal;
}

#app.mobile .follows .avatar,
#app.mobile .follows .avatar .image-container {
    width: 32px;
    height: 32px;
}

.follows-tooltip {
    position: fixed;
    transform: translateX(-50%);
    background: #1a1d2e;
    color: #fff;
    font-size: 11px;
    font-family: 'Roboto', sans-serif;
    white-space: nowrap;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    pointer-events: none;
    z-index: 9999;
}

</style>
