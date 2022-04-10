<!-- @format -->
<template>
    <div class="game-nav">
        <div v-if="game" class="game-header" :style="trendingStyle">
            <img :src="game.logoUrl" />
        </div>
        <div v-if="showMenu" class="quick-nav">
            <div v-if="account" class="followed-container">
                <div v-if="!isFollowed" class="follow-btn info-card" @click="followGame()">
                    <v-icon> mdi-heart-outline </v-icon>
                </div>
                <div v-else class="unfollow-btn info-card" @click="unfollowGame()">
                    <v-icon> mdi-heart </v-icon>
                </div>
            </div>
            <div class="info-card combos" @click="filter('Combo')">Combos</div>
            <div class="info-card matches" @click="filter('Match')">Matches</div>
            <!-- <div class="info-card montages" @click="filter('Montage')">Montages</div> -->
            <div class="info-card character" @click="togglePopup()">
                Characters
                <v-icon> mdi-chevron-down </v-icon>
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
        eventbus.$off('account:update', this.isGameFollowed);
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

        filter(filterType) {
            this.$emit('game-filter:update', filterType);
        },

        togglePopup() {
            this.popupActive = !this.popupActive;
        },

        goToGame() {
            this.$router.push(`/game/${this.gameId}`);
        },

        unfollowGame() {
            eventbus.$emit('game:unfollow', this.gameId);
        },

        followGame() {
            eventbus.$emit('game:follow', this.gameId);
        },

        isGameFollowed(response) {
            if (account) {
                var account = response || this.account;
                this.isFollowed = account.followedGames.some((game) => game.id === this.gameId);
            }
        },

        goToCharacter(character) {
            this.$router.push(`/character/${character.id}`);
        },
    },
};
</script>
<style type="text/css">
.game-nav {
    width: 100%;
    align-items: center;
    justify-content: space-between;
}

.game-nav .game-header {
    height: 80px;
    background: #242832;
    color: #4447e2;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
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
}

.game-nav .quick-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
}

.game-nav .v-icon.v-icon {
    color: #4447e2;
}
</style>
