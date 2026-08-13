<!-- @format -->
<template>
    <div class="character-nav">
        <!-- ── Hero banner ─────────────────────────────── -->
        <div class="hero" :class="{ 'has-video': !!character.overViewUrl }">
            <div class="hero-bg" aria-hidden="true">
                <div class="hero-wedge"></div>
                <div class="hero-dots"></div>
                <div class="hero-streaks"></div>
                <div class="hero-glow"></div>
            </div>

            <!-- Key art in an angled panel sweeping in from the right. -->
            <div v-if="heroArtUrl" class="hero-art" :style="heroArtStyle" role="img" :aria-label="character.name">
                <div class="hero-art-scrim"></div>
            </div>

            <!-- Oversized outlined echo of the name, Smash-style -->
            <div class="hero-ghost-name" aria-hidden="true">{{ character.name }}</div>

            <div class="hero-content">
                <div class="hero-top">
                    <img
                        v-if="game"
                        class="game-logo"
                        :src="game.logoUrl"
                        :alt="game.title"
                        @click="routeToGame()"
                    />
                    <div v-if="character.tier" class="tier-badge" :class="tierClass">
                        <span class="tier-letter">{{ character.tier }}</span>
                        <span class="tier-caption">Tier</span>
                    </div>
                </div>

                <h1 class="hero-name">{{ character.name }}</h1>

                <div v-if="character.archetype" class="hero-archetype">
                    <span>{{ character.archetype }}</span>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <p class="label">Pick Rate</p>
                        <p class="number">
                            {{ character.pickRate ? `${character.pickRate}%` : '???' }}
                        </p>
                        <div class="stat-meter">
                            <span :style="meterStyle(character.pickRate)"></span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <p class="label">Win Rate</p>
                        <p class="number">
                            {{ character.winRate ? `${character.winRate}%` : '???' }}
                        </p>
                        <div class="stat-meter">
                            <span :style="meterStyle(character.winRate)"></span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <p class="label">Tier</p>
                        <p class="number">{{ character.tier ? character.tier : '???' }}</p>
                        <div class="stat-meter">
                            <span :style="meterStyle(tierMeter)"></span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <p class="label">Difficulty</p>
                        <p class="number">{{ character.ease ? character.ease : '???' }}</p>
                        <div class="stat-meter">
                            <span :style="meterStyle(difficultyMeter)"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="character.overViewUrl" class="hero-video">
                <youtube-media
                    :video-id="character.overViewUrl"
                    :player-width="340"
                    :player-height="192"
                    :player-vars="{ autoplay: 0 }"
                    :mute="true"
                    :playsinline="1"
                />
            </div>
        </div>

        <!-- ── Tab rail ────────────────────────────────── -->
        <div v-if="showMenu" class="quick-nav">
            <div class="left-section">
                <div
                    v-for="tab in tabs"
                    :key="tab"
                    class="info-card"
                    :class="{ active: tab === selectedVideoType }"
                    @click="selectedTab(tab)"
                >
                    <span>{{ tab }}</span>
                </div>
            </div>

            <div class="right-section">
                <div class="info-card share" @click="shareCharacter()"><span>Share</span></div>
                <div v-if="account" class="followed-container">
                    <div v-if="!isFollowed" class="follow-btn info-card" @click="followCharacter()">
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

// Rough 0-100 fill used by the hero stat meters, so Tier and Difficulty
// (which are letters/words, not percentages) still read as a gauge.
const TIER_METER = { S: 100, A: 85, B: 65, C: 45, D: 30, E: 20, F: 10 };
const DIFFICULTY_METER = { EASY: 25, MEDIUM: 55, MODERATE: 55, HARD: 80, EXPERT: 95, 'VERY HARD': 95 };

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
        heroArtUrl() {
            if (!this.character) {
                return null;
            }
            return this.character.fullArtUrl || this.character.imageUrl || null;
        },

        heroArtStyle() {
            return this.heroArtUrl ? { backgroundImage: `url(${this.heroArtUrl})` } : {};
        },

        tierClass() {
            var tier = String((this.character && this.character.tier) || '').trim().charAt(0).toUpperCase();
            return tier ? `tier-${tier.toLowerCase()}` : '';
        },

        tierMeter() {
            var tier = String((this.character && this.character.tier) || '').trim().charAt(0).toUpperCase();
            return TIER_METER[tier] || 0;
        },

        difficultyMeter() {
            var ease = String((this.character && this.character.ease) || '').trim().toUpperCase();
            if (!ease) {
                return 0;
            }
            // Difficulty is stored either as a word ("Hard") or a number.
            // Numbers use a 1-5 scale, falling back to 1-10 for larger values.
            var numeric = Number(ease);
            if (!isNaN(numeric) && numeric > 0) {
                return numeric <= 5 ? (numeric / 5) * 100 : (Math.min(numeric, 10) / 10) * 100;
            }
            return DIFFICULTY_METER[ease] || 0;
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
        meterStyle(value) {
            var pct = Math.max(0, Math.min(100, Number(value) || 0));
            return { width: `${pct}%` };
        },

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

/* ── Hero banner ─────────────────────────────────── */
.character-nav .hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid #ffffff1a;
    background: #14161f;
    padding: 40px 44px 36px;
    min-height: 400px;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
}

.character-nav .hero-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
}

/* Angled colour field sweeping in from the right, the way the Smash
   banners split the frame behind the fighter. */
.character-nav .hero-wedge {
    position: absolute;
    inset: 0;
    background: linear-gradient(112deg, #14161f 0%, #14161f 34%, #232766 60%, #4447e2 100%);
    clip-path: polygon(28% 0, 100% 0, 100% 100%, 8% 100%);
}

.character-nav .hero-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#ffffff 1px, transparent 1.2px);
    background-size: 8px 8px;
    opacity: 0.07;
    clip-path: polygon(38% 0, 100% 0, 100% 100%, 18% 100%);
}

/* Diagonal speed streaks. */
.character-nav .hero-streaks {
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

.character-nav .hero-glow {
    position: absolute;
    top: -30%;
    right: 4%;
    width: 620px;
    height: 620px;
    border-radius: 50%;
    background: radial-gradient(circle, #6a6ef555 0%, transparent 68%);
}

/* Huge outlined echo of the name, sitting behind the art. */
.character-nav .hero-ghost-name {
    position: absolute;
    z-index: 2;
    right: 2%;
    bottom: -4%;
    margin: 0;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 900;
    font-size: 190px;
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

/* Key art panel. Backgrounds rather than an <img> so any aspect ratio —
   wide banner art or a tall portrait — fills the angled panel cleanly. */
.character-nav .hero-art {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    width: 58%;
    background-size: cover;
    background-position: center 22%;
    background-repeat: no-repeat;
    clip-path: polygon(22% 0, 100% 0, 100% 100%, 4% 100%);
    pointer-events: none;
}

/* Fades the panel into the banner on its left and bottom edges so the
   art never collides with the name or the stat row. */
.character-nav .hero-art-scrim {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(90deg, #14161f 0%, #14161fe6 22%, #14161f4d 52%, transparent 78%),
        linear-gradient(0deg, #14161fcc 0%, transparent 42%);
}

.character-nav .hero-content {
    position: relative;
    z-index: 3;
    max-width: 60%;
    align-self: center;
}

.character-nav .hero-top {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
}

.character-nav .game-logo {
    max-height: 54px;
    max-width: 210px;
    cursor: pointer;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.character-nav .game-logo:hover {
    transform: translateY(-2px);
    opacity: 0.85;
}

/* Tier badge — the Smash "fighter number" mark, repurposed. */
.character-nav .tier-badge {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: skewX(-8deg);
    background: #4447e2;
    border: 2px solid #ffffff40;
    box-shadow: 0 6px 18px rgba(68, 71, 226, 0.4);
}

.character-nav .tier-badge.tier-s {
    background: #d64f6a;
    box-shadow: 0 6px 18px rgba(214, 79, 106, 0.4);
}

.character-nav .tier-badge.tier-a {
    background: #e08a2e;
    box-shadow: 0 6px 18px rgba(224, 138, 46, 0.4);
}

.character-nav .tier-badge.tier-b {
    background: #3eb489;
    box-shadow: 0 6px 18px rgba(62, 180, 137, 0.4);
}

.character-nav .tier-letter {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 900;
    font-size: 28px;
    line-height: 1;
    color: #fff;
    transform: skewX(8deg);
}

.character-nav .tier-caption {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #ffffffcc;
    transform: skewX(8deg);
}

.character-nav .hero-name {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 900;
    font-size: clamp(56px, 6.5vw, 104px);
    line-height: 0.92;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    color: #fff;
    margin: 0 0 14px;
    transform: skewX(-8deg);
    transform-origin: left bottom;
    text-shadow: 0 6px 24px rgba(0, 0, 0, 0.55);
    overflow-wrap: anywhere;
}

/* Archetype in a skewed banner strip. */
.character-nav .hero-archetype {
    display: inline-block;
    transform: skewX(-8deg);
    background: #ffffff14;
    border-left: 4px solid #3eb489;
    padding: 6px 18px 6px 14px;
    margin-bottom: 26px;
}

.character-nav .hero-archetype span {
    display: block;
    transform: skewX(8deg);
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 19px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffffdd;
}

.character-nav .hero-video {
    position: relative;
    z-index: 4;
    justify-self: end;
    margin-top: 28px;
    border-radius: 12px;
    overflow: hidden;
    /* Solid plate so an embed that fails to load reads as a panel rather
       than a floating outline over the key art. */
    background: #0b0d14;
    border: 1px solid #ffffff26;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    line-height: 0;
}

/* ── Stat cards ──────────────────────────────────── */
.character-nav .stats {
    display: flex;
    gap: 10px;
    max-width: 640px;
}

.character-nav .stat-card {
    flex: 1 1 0;
    min-width: 0;
    background: #0e1018cc;
    backdrop-filter: blur(4px);
    padding: 14px 16px 12px;
    color: #ffffff90;
    border: 1px solid #ffffff1f;
    border-bottom: 2px solid #4447e2;
    transform: skewX(-8deg);
}

.character-nav .stat-card > * {
    transform: skewX(8deg);
}

.character-nav .stat-card .number {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.05;
    color: #fff;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.character-nav .stat-card .label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 2px;
    color: #ffffff70;
}

.character-nav .stat-meter {
    height: 3px;
    background: #ffffff1a;
    overflow: hidden;
}

.character-nav .stat-meter span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #4447e2, #6a6ef5);
    transition: width 0.4s ease;
}

/* ── Tab rail ────────────────────────────────────── */
.character-nav .info-card {
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

.character-nav .info-card > span,
.character-nav .info-card .v-icon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transform: skewX(8deg);
}

.character-nav .info-card:hover {
    background: #2b2f52;
    border-color: #4447e280;
    color: #fff;
}

.character-nav .info-card.active {
    background: #4447e2;
    border-color: #6a6ef5;
    color: #fff;
    box-shadow: 0 6px 18px rgba(68, 71, 226, 0.35);
}

.character-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 28px;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: space-between;
}

.character-nav .quick-nav .left-section,
.character-nav .quick-nav .right-section {
    display: flex;
    align-items: center;
    gap: 6px;
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
    width: 52px;
    padding: 0;
}

.character-nav .v-icon.v-icon {
    color: #fff;
}

.character-nav .admin-edit-btn {
    border-color: #3eb489;
    color: #3eb489;
}

.character-nav .admin-edit-btn .v-icon.v-icon {
    color: #3eb489;
}

.character-nav .admin-edit-btn:hover {
    background: #3eb48920;
    border-color: #3eb489;
    color: #3eb489;
}

/* When an overview video is present, sit it in a second hero column and
   pull the key art back so the video plate isn't fighting it. */
.character-nav .hero.has-video {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 28px;
}

.character-nav .hero.has-video .hero-content {
    max-width: 100%;
}

.character-nav .hero.has-video .hero-art {
    width: 52%;
    background-position: center 18%;
}

.character-nav .hero.has-video .hero-art-scrim {
    background:
        linear-gradient(90deg, #14161f 0%, #14161fe6 26%, #14161f80 60%, #14161f59 100%),
        linear-gradient(0deg, #14161fcc 0%, transparent 42%);
}

.character-nav .hero.has-video .hero-ghost-name {
    right: 30%;
    font-size: 130px;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 1100px) {
    .character-nav .hero-ghost-name {
        font-size: 130px;
    }
}

.mobile .character-nav .hero {
    padding: 24px 20px 26px;
    min-height: 0;
    border-radius: 16px;
    grid-template-columns: minmax(0, 1fr);
}

.mobile .character-nav .hero.has-video {
    grid-template-columns: minmax(0, 1fr);
}

.mobile .character-nav .hero-wedge,
.mobile .character-nav .hero-dots {
    clip-path: polygon(0 46%, 100% 18%, 100% 100%, 0 100%);
}

.mobile .character-nav .hero-content,
.mobile .character-nav .hero.has-video .hero-content {
    max-width: 100%;
}

/* On mobile the art becomes a full-bleed backdrop behind the copy. */
.mobile .character-nav .hero-art,
.mobile .character-nav .hero.has-video .hero-art {
    width: 100%;
    clip-path: none;
    background-position: center 20%;
}

.mobile .character-nav .hero-art-scrim,
.mobile .character-nav .hero.has-video .hero-art-scrim {
    background:
        linear-gradient(180deg, #14161fd9 0%, #14161ff2 55%, #14161f 100%),
        linear-gradient(90deg, #14161fbf 0%, transparent 100%);
}

/* The full-bleed art backdrop already carries the hero on small screens —
   the outlined name on top of it just reads as clutter. */
.mobile .character-nav .hero-ghost-name {
    display: none;
}

.mobile .character-nav .game-logo {
    max-height: 40px;
    max-width: 46%;
}

.mobile .character-nav .hero-name {
    font-size: clamp(40px, 12vw, 64px);
}

.mobile .character-nav .hero-archetype {
    margin-bottom: 20px;
}

.mobile .character-nav .hero-archetype span {
    font-size: 15px;
}

.mobile .character-nav .stats {
    flex-wrap: wrap;
    max-width: 100%;
    gap: 8px;
}

.mobile .character-nav .stat-card {
    flex: 1 1 44%;
    padding: 10px 12px 10px;
}

.mobile .character-nav .stat-card .number {
    font-size: 24px;
}

.mobile .character-nav .hero-video {
    justify-self: stretch;
    margin-top: 22px;
}

.mobile .character-nav .hero-video iframe {
    width: 100%;
}

.mobile .character-nav .quick-nav .left-section,
.mobile .character-nav .quick-nav .right-section {
    max-width: 100%;
    flex-wrap: wrap;
}

.mobile .character-nav .info-card {
    height: 38px;
    font-size: 13px;
    padding: 0 14px;
}
</style>
