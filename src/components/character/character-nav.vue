<!-- @format -->
<template>
    <div class="character-nav">
        <div class="character-nav-container">
            <div class="character-nav-left">
                <div class="character-header">
                    <div class="character-image">
                        <img class="character-img" :src="character.imageUrl" />
                        <img
                            v-if="game"
                            class="game-logo game-logo-mobile"
                            :src="game.logoUrl"
                            @click="routeToGame()"
                        />
                    </div>
                    <div class="options">
                        <h2>{{ character.name }}</h2>
                        <img
                            v-if="game"
                            class="game-logo game-logo-desktop"
                            :src="game.logoUrl"
                            @click="routeToGame()"
                        />
                    </div>
                </div>
                <p class="character-archetype">
                    {{ character.archetype }}
                </p>
                <div class="stats">
                    <div class="stat-card">
                        <p class="label">Pick Rate</p>
                        <p class="number">
                            {{ character.pickRate ? `${character.pickRate}%` : '???' }}
                        </p>
                    </div>
                    <div class="stat-card">
                        <p class="label">Win Rate</p>
                        <p class="number">
                            {{ character.winRate ? `${character.winRate}%` : '???' }}
                        </p>
                    </div>
                    <div class="stat-card">
                        <p class="label">Tier</p>
                        <p class="number">{{ character.tier ? character.tier : '???' }}</p>
                    </div>
                    <div class="stat-card">
                        <p class="label">Difficulty</p>
                        <p class="number">{{ character.ease ? character.ease : '???' }}</p>
                    </div>
                </div>
            </div>
            <div class="character-nav-right">
                <youtube-media
                    v-if="character.overViewUrl"
                    :video-id="character.overViewUrl"
                    :player-width="350"
                    :player-height="200"
                    :player-vars="{ autoplay: 0 }"
                    :mute="true"
                    :playsinline="1"
                />
            </div>
        </div>
        <div v-if="showMenu" class="quick-nav">
            <div class="left-section">
                <div
                    v-for="tab in tabs"
                    :key="tab"
                    class="info-card"
                    :class="{ active: tab === selectedVideoType }"
                    @click="selectedTab(tab)"
                >
                    {{ tab }}
                </div>
            </div>

            <div class="right-section">
                <div class="info-card share" @click="shareCharacter()">Share</div>
                <div v-if="account" class="followed-container">
                    <div v-if="!isFollowed" class="follow-btn info-card" @click="followCharacter()">
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
        <div v-if="matchupPopupActive" class="popup">
            <character-search :gameId="character.gameId" @update:character="goToMatchup($event)" />
        </div>
        <div v-if="playerPopupActive" class="popup">
            <multiselect
                :options="character.players"
                :multiple="false"
                :clear-on-select="true"
                :preserve-search="true"
                label="name"
                :placeholder="'Featured Players'"
                @input="goToPlayer($event)"
            >
                <template slot="singleLabel" slot-scope="props">
                    <span class="option__name">{{ props.option.name }}</span>
                </template>
                <template slot="option" slot-scope="props">
                    <div class="option__desc">
                        <span class="option__name">{{ props.option.name }}</span>
                    </div>
                </template>
            </multiselect>
        </div>
    </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search';
import GamesService from '@/services/games-service';
import { gamePathFromAbbreviation, playerPagePath } from '@/utils/game-character-routes';

import { eventbus } from '@/main';

export default {
    name: 'CharacterNav',

    components: {
        'character-search': CharacterSearch,
    },

    props: {
        characterId: {
            type: String,
            default: '',
        },
        characterSlug: {
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

        selectedVideoType: {
            type: String,
            default: '',
        },

        character: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            matchupPopupActive: false,
            playerPopupActive: false,
            isFollowed: false,
            tabs: ['Combos', 'Montages', 'Matchups', 'Online Matches', 'Tournament Matches'],
            game: null,
        };
    },

    computed: {
        characterbubbleStyle() {
            return {
                'background-image': `url(${this.character.imageUrl})`,
                'background-size': '30%',
                'background-repeat': 'no-repeat',
                'background-position': '0% 20%',
            };
        },
        isAdmin() {
            return this.account && String(this.account.role || '').toLowerCase() === 'admin';
        },
    },

    created() {
        this.getGame();
        eventbus.$on('account:update', this.isCharacterFollowed);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isCharacterFollowed);
    },

    mounted() {
        this.isCharacterFollowed();
    },

    methods: {
        openEditModal() {
            eventbus.$emit('open:widget', { name: 'edit-character', characterId: this.character.id });
        },

        filter(filterType) {
            this.$emit('character-filter:update', filterType);
        },

        toggleMatchupPopup() {
            this.matchupPopupActive = !this.matchupPopupActive;
            this.playerPopupActive = false;
        },

        togglePlayerPopup() {
            this.playerPopupActive = !this.playerPopupActive;
            this.matchupPopupActive = false;
        },

        goToMatchup(character) {
            this.$router.push(`/matchups/${this.character.id}/${character.id}`);
        },

        unfollowCharacter() {
            eventbus.$emit('character:unfollow', this.character.id);
        },

        followCharacter() {
            eventbus.$emit('character:follow', this.character.id);
        },

        isCharacterFollowed(response) {
            if (this.account) {
                var account = response || this.account;
                this.isFollowed = account.followedCharacters.some(
                    (character) => character.id === this.character.id
                );
            }
        },

        goToPlayer(input) {
            var path = playerPagePath(input);
            if (path) { this.$router.push(path); }
        },

        routeToCharacterCombos() {
            this.$router.push(`/combos/character/${this.characterId}`);
        },

        queryTournamentMatches() {
            this.$emit('query-tournament-matches');
        },

        selectedTab(tab) {
            this.$emit('selected-video', tab);
        },

        getGame() {
            if (!this.character || !this.character.gameId) {
                return;
            }
            GamesService.getGame({
                id: this.character.gameId,
            }).then((response) => {
                this.game = {
                    id: response.data._id,
                    title: response.data.Title,
                    logoUrl: response.data.LogoUrl,
                    abbreviation: response.data.Abbreviation || null,
                };
            });
        },

        routeToGame() {
            var seg =
                gamePathFromAbbreviation(this.game && this.game.abbreviation) ||
                (this.game && this.game.id != null ? String(this.game.id) : '');
            if (seg) {
                this.$router.push(`/game/${encodeURIComponent(seg)}`);
            }
        },

        shareCharacter() {
            navigator.clipboard.writeText(window.location.href);
            alert('Character link copied to clipboard');
        },
    },
};
</script>
<style type="text/css">
.character-nav {
    width: 100%;
    z-index: 99;
}

.character-nav .character-header {
    height: 60px;
    width: 100%;
    display: flex;
    align-items: flex-end;
    padding: 0 20px 0 0;
    margin-bottom: 10px;
}

.character-nav .character-header .character-img {
    border-radius: 50%;
    max-height: 70px;
    width: auto;
    position: relative;
    left: -10px;

    border: 2px solid #4447e2;
}

.character-nav .character-header h2 {
    text-align: right;
    font-size: 50px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0px;
}

.character-nav .character-archetype {
    font-size: 20px;
    color: #ffffff80;
    margin-bottom: 0px;
}

.character-nav .info-card {
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

.character-nav .info-card:hover {
    background: #4447e270;
}

.character-nav .info-card.active {
    background: #4447e2;
    border-color: #4447e2;
}

.character-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 24px;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: space-between;
}

.character-nav .quick-nav .left-section,
.character-nav .quick-nav .right-section {
    display: flex;
    align-items: center;
    gap: 4px;
}

.character-nav .popup {
    background: #4447e2;
    width: 100%;
    margin-top: 20px;
    padding: 2px 2px;
    border-radius: 5px;
}

.character-nav .mdi-chevron-down::before {
    content: '\F0140';
    color: #fff;
}

.character-nav .follow-btn,
.character-nav .unfollow-btn {
    width: 50px;
    padding: 0;
}

.character-nav .v-icon.v-icon {
    color: #fff;
}

.character-nav .character-header .character-img {
    border-radius: 25%;
    max-height: 70px;
    width: auto;
    position: relative;
    left: -10px;
}

.character-nav .stats {
    display: flex;
    gap: 16px;
    margin-top: 16px;
}

.character-nav .stat-card {
    background: #191b2490;
    border-radius: 15px;
    padding: 20px;
    min-width: 150px;
    height: 85px;
    width: 100%;
    color: #ffffff90;
    border: 1px solid #ffffff30;
}

.character-nav .stat-card .number {
    font-size: 25px;
    font-weight: 800;
    color: #fff;
}

.character-nav .stat-card .label {
    font-size: 12px;
    font-weight: 300;
    text-transform: uppercase;
}

.character-nav .matchup {
    padding-right: 8px;
}

.character-nav .character-nav-container {
    display: flex;
    justify-content: space-between;
}

.character-nav .options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
}

.character-nav .game-logo {
    max-height: 70px;
    margin-left: 10px;
    cursor: pointer;
    max-width: 280px;
}

.character-nav .game-logo-mobile {
    display: none;
}

.mobile .character-nav .character-nav-container {
    flex-direction: column;
}

.mobile .character-nav .character-nav-right {
    display: flex;
    justify-content: center;
}

.mobile .character-header,
.mobile .character-header .options {
    flex-direction: column;
    align-items: flex-start;
}

.mobile .character-nav .character-header {
    height: initial;
}

.mobile .character-nav .character-header h2 {
    text-align: left;
}

.mobile .character-nav .character-header .game-logo {
    max-width: 50%;
}

.mobile .character-nav .stats {
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.mobile .character-nav .stat-card {
    width: 47%;
}

.mobile .character-nav .quick-nav .left-section {
    max-width: 100%;
    flex-wrap: wrap;
}

.mobile .character-nav .game-logo-mobile {
    display: block;
}

.mobile .character-nav .game-logo-desktop {
    display: none;
}

.mobile .character-image {
    display: flex;
}

.character-nav .admin-edit-btn {
    border-color: #3eb489;
    color: #3eb489;
    gap: 4px;
}
.character-nav .admin-edit-btn:hover {
    background: #3eb48920;
}
</style>
