<!-- @format -->
<template>
    <div class="game-nav">
        <!-- ── Hero banner ─────────────────────────────── -->
        <div v-if="game" class="hero">
            <div class="hero-bg" aria-hidden="true">
                <div class="hero-wedge"></div>
                <div class="hero-dots"></div>
                <div class="hero-streaks"></div>
                <div class="hero-glow"></div>
            </div>

            <!-- Game banner art in an angled panel sweeping in from the right. -->
            <div v-if="game.banner" class="hero-art" :style="heroArtStyle" role="img" :aria-label="game.title">
                <div class="hero-art-scrim"></div>
            </div>

            <div class="hero-ghost-name" aria-hidden="true">{{ ghostTitle }}</div>

            <div class="hero-content">
                <div class="hero-top">
                    <img v-if="game.logoUrl" class="game-logo" :src="game.logoUrl" :alt="game.title" />
                </div>

                <h1 class="hero-name">{{ game.title }}</h1>

                <div v-if="game.abbreviation" class="hero-tagline">
                    <span>{{ game.abbreviation }}</span>
                </div>
            </div>
        </div>

        <!-- ── Tab rail ────────────────────────────────── -->
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
                    <span>{{ t.label }}</span>
                </div>
            </div>

            <div class="right-section">
                <div class="info-card share" @click="shareGame()"><span>Share</span></div>
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
                    <span><v-icon small>mdi-pencil</v-icon> Edit</span>
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
        heroArtStyle() {
            if (this.game && this.game.banner) {
                return { backgroundImage: `url(${this.game.banner})` };
            }
            return {};
        },

        // The outlined echo behind the art. Long titles would run off the
        // banner, so fall back to the abbreviation when there is one.
        ghostTitle() {
            if (!this.game) {
                return '';
            }
            var title = this.game.title || '';
            if (title.length > 14 && this.game.abbreviation) {
                return this.game.abbreviation;
            }
            return title;
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

/* ── Hero banner ─────────────────────────────────── */
.game-nav .hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid #ffffff1a;
    background: #14161f;
    padding: 40px 44px 36px;
    min-height: 300px;
    display: flex;
    align-items: center;
}

.game-nav .hero-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
}

/* Angled colour field sweeping in from the right. Games use the green
   accent, characters the indigo one, so the two pages stay distinct. */
.game-nav .hero-wedge {
    position: absolute;
    inset: 0;
    background: linear-gradient(112deg, #14161f 0%, #14161f 34%, #16453a 62%, #3eb489 100%);
    clip-path: polygon(28% 0, 100% 0, 100% 100%, 8% 100%);
}

.game-nav .hero-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#ffffff 1px, transparent 1.2px);
    background-size: 8px 8px;
    opacity: 0.07;
    clip-path: polygon(38% 0, 100% 0, 100% 100%, 18% 100%);
}

.game-nav .hero-streaks {
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
        112deg,
        #ffffff12 0px,
        #ffffff12 2px,
        transparent 2px,
        transparent 34px
    );
    opacity: 0.9;
}

.game-nav .hero-glow {
    position: absolute;
    top: -34%;
    right: 4%;
    width: 560px;
    height: 560px;
    border-radius: 50%;
    background: radial-gradient(circle, #3eb48955 0%, transparent 68%);
}

/* Banner art panel. A background rather than an <img> so any aspect ratio
   fills the angled panel cleanly. */
.game-nav .hero-art {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    width: 60%;
    background-size: cover;
    background-position: center 30%;
    background-repeat: no-repeat;
    clip-path: polygon(22% 0, 100% 0, 100% 100%, 4% 100%);
    pointer-events: none;
}

.game-nav .hero-art-scrim {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(90deg, #14161f 0%, #14161fe6 22%, #14161f4d 52%, transparent 78%),
        linear-gradient(0deg, #14161fcc 0%, transparent 42%);
}

.game-nav .hero-ghost-name {
    position: absolute;
    z-index: 2;
    right: 2%;
    bottom: -6%;
    margin: 0;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 900;
    font-size: 170px;
    line-height: 0.8;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    white-space: nowrap;
    color: transparent;
    -webkit-text-stroke: 2px #ffffff1f;
    transform: skewX(-8deg);
    pointer-events: none;
    user-select: none;
}

.game-nav .hero-content {
    position: relative;
    z-index: 3;
    max-width: 62%;
}

.game-nav .hero-top {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
}

.game-nav .game-logo {
    max-height: 76px;
    max-width: 240px;
    width: auto;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
}

.game-nav .hero-name {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 900;
    font-size: clamp(44px, 5vw, 78px);
    line-height: 0.94;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    color: #fff;
    margin: 0 0 14px;
    transform: skewX(-8deg);
    transform-origin: left bottom;
    text-shadow: 0 6px 24px rgba(0, 0, 0, 0.55);
    overflow-wrap: anywhere;
}

.game-nav .hero-tagline {
    display: inline-block;
    transform: skewX(-8deg);
    background: #ffffff14;
    border-left: 4px solid #3eb489;
    padding: 6px 18px 6px 14px;
}

.game-nav .hero-tagline span {
    display: block;
    transform: skewX(8deg);
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 19px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #ffffffdd;
}

/* ── Tab rail ────────────────────────────────────── */
.game-nav .info-card {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ffffff26;
    color: #ffffffcc;
    background: #1c1f2b;
    cursor: pointer;
    position: relative;
    padding: 0 20px;
    transform: skewX(-8deg);
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.game-nav .info-card > span,
.game-nav .info-card .v-icon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transform: skewX(8deg);
}

.game-nav .info-card:hover {
    background: #22392f;
    border-color: #3eb48980;
    color: #fff;
}

.game-nav .info-card.info-card--active {
    background: #3eb489;
    border-color: #5ae1ae;
    color: #06231a;
    box-shadow: 0 6px 18px rgba(62, 180, 137, 0.35);
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
    width: 52px;
    padding: 0;
}

.game-nav .v-icon.v-icon {
    color: #fff;
}

.game-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 28px;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: space-between;
}

.game-nav .quick-nav .left-section,
.game-nav .quick-nav .right-section {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.game-nav .admin-edit-btn {
    border-color: #3eb489;
    color: #3eb489;
}

.game-nav .admin-edit-btn .v-icon.v-icon {
    color: #3eb489;
}

.game-nav .admin-edit-btn:hover {
    background: #3eb48920;
    border-color: #3eb489;
    color: #3eb489;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 1100px) {
    .game-nav .hero-ghost-name {
        font-size: 120px;
    }
}

.mobile .game-nav .hero {
    padding: 24px 20px 26px;
    min-height: 0;
    border-radius: 16px;
}

.mobile .game-nav .hero-wedge,
.mobile .game-nav .hero-dots {
    clip-path: polygon(0 46%, 100% 18%, 100% 100%, 0 100%);
}

.mobile .game-nav .hero-content {
    max-width: 100%;
}

/* The art becomes a full-bleed backdrop behind the copy on small screens. */
.mobile .game-nav .hero-art {
    width: 100%;
    clip-path: none;
    background-position: center 25%;
}

.mobile .game-nav .hero-art-scrim {
    background:
        linear-gradient(180deg, #14161fd9 0%, #14161ff2 55%, #14161f 100%),
        linear-gradient(90deg, #14161fbf 0%, transparent 100%);
}

.mobile .game-nav .hero-ghost-name {
    display: none;
}

.mobile .game-nav .game-logo {
    max-height: 56px;
    max-width: 60%;
}

.mobile .game-nav .hero-name {
    font-size: clamp(34px, 10vw, 54px);
}

.mobile .game-nav .hero-tagline span {
    font-size: 15px;
}

.mobile .game-nav .info-card {
    height: 38px;
    font-size: 13px;
    padding: 0 14px;
}
</style>
