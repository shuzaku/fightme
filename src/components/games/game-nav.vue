<!-- @format -->
<template>
    <div class="game-nav">
        <div v-if="game" class="game-header" :style="trendingStyle">
            <img :src="game.logoUrl" />
        </div>
        <div v-if="showMenu" class="quick-nav">
            <div class="left-section">
                <div v-for="tab in tabs" :key="tab" class="info-card" @click="selectedTab(tab)">
                    {{ tab }}
                </div>
            </div>

            <div class="right-section">
                <div class="info-card share" @click="shareGame()">Share</div>
                <div v-if="account" class="followed-container">
                    <div v-if="!isFollowed" class="follow-btn info-card" @click="followCharacter()">
                        <v-icon> mdi-heart-outline </v-icon>
                    </div>
                    <div v-else class="unfollow-btn info-card" @click="unfollowCharacter()">
                        <v-icon> mdi-heart </v-icon>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="popupActive" class="popup">
            <character-search :gameId="gameId" @update:character="goToCharacter($event)" />
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import CharacterSearch from '@/components/character/character-search';
import { eventbus } from '@/main';

export default {
    name: 'GameNav',
    components: {
        'character-search': CharacterSearch,
    },
    props: {
        gameId: {
            type: String,
            default: '',
        },

        account: {
            type: Object,
            default: null,
        },

        showMenu: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            game: null,
            popupActive: false,
            isFollowed: false,
            tabs: ['Combos', 'Online Matches', 'Tournament Matches'],
        };
    },

    computed: {
        trendingStyle() {
            return {
                'background-image': `url(${this.game.banner})`,
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
            };
        },
    },

    watch: {
        gameId() {
            this.getGame();
        },
    },

    created() {
        eventbus.$on('account:update', this.isGameFollowed);
        this.getGame();
        this.isGameFollowed();
    },

    beforeDestroy() {
        eventbus.$off('account:update');
    },

    methods: {
        async getGame() {
            const response = await GamesService.getGame({
                id: this.gameId,
            });
            this.game = {
                title: response.data.Title,
                logoUrl: response.data.LogoUrl,
                banner: response.data.Banner,
            };
        },

        unfollowGame() {
            eventbus.$emit('game:unfollow', this.gameId);
        },

        followGame() {
            eventbus.$emit('game:follow', this.gameId);
        },

        isGameFollowed(response) {
            if (this.account) {
                var account = response || this.account;
                this.isFollowed = account.followedGames.some((game) => game.id === this.gameId);
            }
        },

        goToCharacter(character) {
            this.$router.push(`/character/${character.id}`);
        },

        selectedTab(tab) {
            this.$emit('selected-video', tab);
        },

        shareGame() {
            navigator.clipboard.writeText(window.location.href);
            alert('Game link copied to clipboard');
        },
    },
};
</script>
<style type="text/css">
.game-nav {
    width: 100%;
    z-index: 99;
    margin-bottom: 16px;
}

.game-nav .game-header {
    height: 100px;
    width: 100%;
    display: flex;
    align-items: end;
    padding: 0 20px 0 0;
    margin-bottom: 10px;
}

.game-nav .game-header img {
    height: 100%;
    width: auto;
}

.game-nav .game-header .divider {
    margin: 0 10px;
}

.game-nav .game-header select {
    margin: 0 5px;
    border-bottom: 1px solid #3eb489;
    font-weight: 600;
    cursor: pointer;
}

.game-nav .sort-filter-container .divider {
    margin: 0;
}
.game-nav .info-card {
    height: 40px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 1px solid #ffffff30;
    color: #ffffff;
    background: #242832;
    cursor: pointer;
    margin-right: 5px;
    position: relative;
    padding: 0 16px;
}

.game-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.game-nav .popup {
    background: #4447e2;
    width: 100%;
    margin-top: 20px;
    padding: 2px 2px;
    border-radius: 5px;
}

.game-nav .mdi-chevron-down::before {
    content: '\F0140';
    color: #4447e2;
}

.game-nav .follow-btn,
.game-nav .unfollow-btn {
    width: 50px;
    padding: 0;
}

.game-nav .v-icon.v-icon {
    color: #4447e2;
}

.game-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 24px;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: space-between;
}

.game-nav .quick-nav .left-section,
.game-nav .quick-nav .right-section {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    gap: 10px;
}

.mobile .game-nav .game-header img {
    width: auto;
    max-height: 100px;
}
</style>
