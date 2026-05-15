<!-- @format -->
<template>
    <div class="game-nav">
        <div v-if="game" class="game-header" :style="trendingStyle">
            <div class="game-header-logo">
                <img :src="game.logoUrl" />
            </div>
            <div v-if="showMenu" class="game-header-actions">
                <div class="info-card share" @click="shareGame()">Share</div>
                <div v-if="account" class="followed-container">
                    <div
                        v-if="!isFollowed"
                        class="follow-btn info-card"
                        @click="followCharacter()"
                    >
                        <v-icon> mdi-heart-outline </v-icon>
                    </div>
                    <div v-else class="unfollow-btn info-card" @click="unfollowCharacter()">
                        <v-icon> mdi-heart </v-icon>
                    </div>
                </div>
                <div v-if="isAdmin" class="admin-edit-btn info-card" @click="openEditModal()">
                    <v-icon small>mdi-pencil</v-icon> Edit
                </div>
            </div>
        </div>
        <div v-if="showMenu" class="quick-nav">
            <div class="left-section" role="tablist" aria-label="Game content">
                <div
                    v-for="t in contentTabs"
                    :key="t.id"
                    class="info-card"
                    :class="{
                        'info-card--active': t.id === activeTabId,
                    }"
                    role="tab"
                    :aria-selected="t.id === activeTabId"
                    @click="onSelectContentTab(t.id)"
                >
                    {{ t.label }}
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
import { characterPagePath } from '@/utils/game-character-routes';
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

        /** { id, label }[] from parent — Combos, Online, Tournament, optional Tier/Updates */
        contentTabs: {
            type: Array,
            default: () => [],
        },

        activeTabId: {
            type: String,
            default: 'online',
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
            if (this.game && this.game.banner) {
                return {
                    'background-image': `url(${this.game.banner})`,
                    'background-size': 'cover',
                    'background-repeat': 'no-repeat',
                };
            }
            return {};
        },
        isAdmin() {
            return this.account && String(this.account.role || '').toLowerCase() === 'admin';
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
        openEditModal() {
            eventbus.$emit('open:widget', { name: 'edit-game', gameId: this.gameId });
        },

        async getGame() {
            const response = await GamesService.getGame({
                id: this.gameId,
            });
            this.game = {
                title: response.data.Title,
                logoUrl: response.data.LogoUrl,
                banner: response.data.Banner,
                abbreviation: response.data.Abbreviation || null,
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
            var path = characterPagePath(
                this.game && this.game.abbreviation ? { Abbreviation: this.game.abbreviation } : null,
                character
            );
            if (path) {
                this.$router.push(path);
            }
        },

        onSelectContentTab(id) {
            this.$emit('select-content-tab', id);
        },

        shareGame() {
            navigator.clipboard.writeText(window.location.href);
            alert('Game link copied to clipboard');
        },

        followCharacter() {
            this.followGame();
        },

        unfollowCharacter() {
            this.unfollowGame();
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
    min-height: 100px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;
    padding: 8px 12px 8px 16px;
    margin-bottom: 10px;
    border-radius: 12px;
    overflow: hidden;
}

.game-nav .game-header-logo {
    display: flex;
    align-items: center;
    min-height: 0;
    flex: 0 1 auto;
}

.game-nav .game-header-logo img {
    height: 100px;
    max-height: 100px;
    width: auto;
    object-fit: contain;
    display: block;
}

.game-nav .game-header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    flex-wrap: wrap;
    gap: 10px;
    z-index: 1;
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

.game-nav .info-card.info-card--active {
    border-color: #3eb489;
    color: #fff;
    background: #1a2e28;
    box-shadow: 0 0 0 1px #3eb489;
}

.game-nav .info-card.info-card--info {
    white-space: nowrap;
    max-width: 100%;
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
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: flex-start;
}

.game-nav .quick-nav .left-section {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.mobile .game-nav .game-header-logo img {
    width: auto;
    max-height: 100px;
}

.game-nav .admin-edit-btn {
    border-color: #3eb489;
    color: #3eb489;
    gap: 4px;
}
.game-nav .admin-edit-btn:hover {
    background: #3eb48920;
}
</style>
