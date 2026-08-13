<!-- @format -->
<template>
    <div class="character-overview">
        <div class="overview-left">
            <div class="strengths-weaknesses overview-card">
                <h3>Strengths and Weaknesses</h3>
                <p class="sw-row"><span class="sw-tag strength">+</span> {{ character.strengths }}</p>
                <p class="sw-row"><span class="sw-tag weakness">−</span> {{ character.weaknesses }}</p>
            </div>
            <div class="gameplan-strategy overview-card">
                <h3>Gameplan Summary</h3>
                <p>
                    {{ character.gameplan }}
                </p>
            </div>

            <div v-if="selectedVideoType === 'Combos'" class="overview-card add-combo-card">
                <h3>Combo Clips</h3>
                <p class="add-combo-hint">
                    Share a combo clip for {{ character.name }}. Game and character are filled in automatically.
                </p>
                <button type="button" class="add-combo-btn" @click="openAddCombo">
                    <span class="btn-label"><i class="fas fa-plus"></i> Add Combo</span>
                </button>
            </div>

            <div v-if="selectedVideoType === 'Montages'" class="overview-card add-montage-card">
                <h3>Montages</h3>
                <p class="add-combo-hint">
                    Share a montage for {{ character.name }}. Game and character are filled in automatically.
                </p>
                <button type="button" class="add-montage-btn" @click="openAddMontage">
                    <span class="btn-label"><i class="fas fa-plus"></i> Add Montage</span>
                </button>
            </div>
            <!-- <div class="move-list">
                <div class="gameplan-strategy overview-card">
                    <h3>Unique Normals</h3>
                    <div class="moves">
                        <div class="move">Chain Buster</div>
                        <div class="move">Triple Flash Kicks</div>
                    </div>
                </div>
                <div class="gameplan-strategy overview-card">
                    <h3>Specials</h3>
                    <div class="moves">
                        <div class="move">Hadouken</div>
                        <div class="move">Shoryuken</div>
                        <div class="move">Tatsumaki Senpukyaku</div>
                        <div class="move">Dragonlash Kick</div>
                        <div class="move">Jinrai Kick</div>
                    </div>
                </div>
                <div class="gameplan-strategy overview-card">
                    <h3>Supers</h3>
                    <div class="moves">
                        <div class="move">Dragonlash Flame</div>
                        <div class="move">Shippu Jinrai-kyaku</div>
                        <div class="move">Shinryu Reppa</div>
                    </div>
                </div>
            </div> -->
        </div>
        <div class="overview-right">
            <div class="top-guides overview-card">
                <h3>Resources</h3>
                <a v-if="character.wikiUrl" :href="character.wikiUrl" target="_blank" rel="noopener noreferrer" class="wiki-link">
                    <i class="fab fa-wikipedia-w"></i> Character Wiki
                </a>
                <a
                    v-if="twitterSearchUrl"
                    :href="twitterSearchUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="twitter-link"
                >
                    <i class="fab fa-twitter"></i> Twitter (#{{ resourceHashtag }})
                </a>
                <a
                    v-if="blueskySearchUrl"
                    :href="blueskySearchUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="bluesky-link"
                >
                    <bluesky-icon width="18" height="18" />
                    Bluesky (#{{ resourceHashtag }})
                </a>
                <a v-if="character.discordLink" :href="character.discordLink" target="_blank" rel="noopener noreferrer" class="discord-link">
                    <i class="fab fa-discord"></i> Discord Server
                </a>
            </div>

            <div v-if="selectedVideoType === 'Matchups'" class="overview-card">
                <h3>Matchup Vs.</h3>
                <character-search
                    v-model="character2Id"
                    :gameId="character.gameId"
                    defaultSelect
                    @update:character="setCharacter2Id($event)"
                />
            </div>

            <!-- <div class="recent-patches overview-card">
                <h3>Recent Patches</h3>
                <div class="patch">
                    <div class="label-container">
                        <div class="patch-label nerf">Nerf</div>
                    </div>
                    <div class="patch-description">
                        Light DP invuln frames adjusted; Drive Rush pushback reduced.
                        <div class="patch-date">10/05/2025</div>
                    </div>
                </div>
                <div class="patch">
                    <div class="label-container">
                        <div class="patch-label mixed">Mixed</div>
                    </div>
                    <div class="patch-description">
                        J.MP juggle route expanded: OD Tatsu damage -10
                        <div class="patch-date">10/05/2025</div>
                    </div>
                </div>
                <div class="patch">
                    <div class="label-container">
                        <div class="patch-label buff">Buff</div>
                    </div>
                    <div class="patch-description">
                        Target combo consistency fix vs crouchers.
                        <div class="patch-date">10/05/2025</div>
                    </div>
                </div>
                <div class="patch">
                    <div class="label-container">
                        <div class="patch-label buff">Buff</div>
                    </div>
                    <div class="patch-description">
                        Target combo consistency fix vs crouchers.
                        <div class="patch-date">10/05/2025</div>
                    </div>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script>
import Loading from '@/components/common/loading';
import CharacterSearch from '@/components/character/character-search';
import BlueskyIcon from '@/components/svg/bluesky-icon';

import { eventbus } from '@/main';

export default {
    name: 'CharacterOverview',

    components: {
        loading: Loading,
        'character-search': CharacterSearch,
        'bluesky-icon': BlueskyIcon,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },

        character: {
            type: Object,
            default: null,
        },

        selectedVideoType: {
            type: String,
            default: 'Online Matches',
        },

        character2Id: {
            type: Array,
            default: null,
        },
    },

    data() {
        return {};
    },

    computed: {
        resourceHashtag() {
            if (!this.character || !this.character.slug) {
                return null;
            }
            var slug = String(this.character.slug).trim().toLowerCase();
            return slug || null;
        },

        twitterSearchUrl() {
            if (!this.resourceHashtag) {
                return null;
            }
            return `https://x.com/search?q=${encodeURIComponent('#' + this.resourceHashtag)}`;
        },

        blueskySearchUrl() {
            if (!this.resourceHashtag) {
                return null;
            }
            return `https://bsky.app/search?q=${encodeURIComponent('#' + this.resourceHashtag)}`;
        },

    },

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {
        setCharacter2Id(character) {
            // Forward the full character object so the parent has access
            // to both the id (for API queries) and the slug (for the URL).
            this.$emit('character2Id:update', character);
        },

        openAddCombo() {
            if (!this.character || !this.character.id) return;
            eventbus.$emit('open:widget', {
                name: 'combo',
                gameId: this.character.gameId,
                characterId: this.character.id,
            });
        },

        openAddMontage() {
            if (!this.character || !this.character.id) return;
            eventbus.$emit('open:widget', {
                name: 'montage',
                gameId: this.character.gameId,
                characterId: this.character.id,
            });
        },
    },
};
</script>

<style>
.character-overview {
    display: flex;
    gap: 16px;
}

.character-overview .overview-card ul {
    list-style-position: inside;
}

.character-overview .overview-card li {
    margin-bottom: 8px;
}

.character-overview .overview-card {
    position: relative;
    background: linear-gradient(180deg, #1b1e2b 0%, #16181f 100%);
    border-radius: 4px;
    padding: 18px 20px 20px;
    color: #ffffff90;
    border: 1px solid #ffffff1f;
    border-left: 3px solid #4447e2;
    margin-top: 16px;
    /* Clipped top-right corner, echoing the angled hero panels. */
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
}

.character-overview .overview-card h3 {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ffffff14;
}

.character-overview .strengths-weaknesses {
    border-left-color: #3eb489;
}

.character-overview .add-montage-card {
    border-left-color: #fc73c4;
}

.character-overview .top-guides {
    border-left-color: #3eb489;
}

.character-overview .character-overview {
    margin-top: 40px;
    display: flex;
    gap: 16px;
}

.character-overview .move-list {
    display: flex;
    gap: 16px;
}

.character-overview .move {
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 1px solid #ffffff30;
    color: #ffffff;
    background: #242832;
    cursor: pointer;
    margin-right: 5px;
    position: relative;
    padding: 8px 12px;
}

.character-overview .moves {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
}

.character-overview .top-guides a {
    display: block;
    color: #3eb489;
    margin-bottom: 6px;
    padding: 7px 10px;
    background: #ffffff08;
    border: 1px solid #ffffff10;
    border-radius: 2px;
    font-size: 0.9rem;
    text-decoration: none;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.character-overview .top-guides a:hover {
    background: #ffffff12;
    border-color: #ffffff26;
}

.character-overview .top-guides a:hover {
    color: #5ae1ae;
}

.character-overview .top-guides a.wiki-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #3eb489;
}

.character-overview .top-guides a.wiki-link:hover {
    color: #5ae1ae;
}

.character-overview .top-guides a.wiki-link i {
    font-size: 18px;
}

.character-overview .top-guides a.twitter-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e7e9ea;
}

.character-overview .top-guides a.twitter-link:hover {
    color: #1d9bf0;
}

.character-overview .top-guides a.twitter-link i {
    font-size: 18px;
}

.character-overview .top-guides a.bluesky-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8ec8f6;
}

.character-overview .top-guides a.bluesky-link:hover {
    color: #1185fe;
}

.character-overview .top-guides a.discord-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #7289da;
}

.character-overview .top-guides a.discord-link:hover {
    color: #99aab5;
}

.character-overview .top-guides a.discord-link i {
    font-size: 18px;
}

.character-overview .overview-left {
    max-width: 70%;
    width: 100%;
}

.character-overview .overview-right {
    width: 100%;
    max-width: 30%;
}

.character-overview .recent-patches .patch {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;
}

.character-overview .sw-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    line-height: 1.6;
}

.character-overview .sw-tag {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-top: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    line-height: 1;
    transform: skewX(-8deg);
}

.character-overview .sw-tag.strength {
    color: #5ae1ae;
    background: #3eb4891f;
    border: 1px solid #3eb48959;
}

.character-overview .sw-tag.weakness {
    color: #ba6d79;
    background: #ba6d791f;
    border: 1px solid #ba6d7959;
}

.character-overview .patch-label {
    border: 1px solid #5ae1ae;
    padding: 4px 12px;
    color: #5ae1ae;
    border-radius: 4px;
    background: #5ae1ae20;
    display: inline-block;
    font-size: 12px;
}

.character-overview .patch-label.nerf {
    border: 1px solid #ba6d79;
    padding: 4px 12px;
    color: #ba6d79;
    border-radius: 4px;
    background: #ba6d7920;
}

.character-overview .patch-label.mixed {
    border: 1px solid #ddb529;
    padding: 4px 12px;
    color: #ddb529;
    border-radius: 4px;
    background: #ddb52920;
}

.character-overview .label-container {
    min-width: 60px;
}

.character-overview .patch-description {
    font-size: 12px;
}

.character-overview .patch-description {
    font-size: 14px;
}

.character-overview .patch-date {
    font-size: 10px;
    color: #ffffff50;
}

.character-overview .strengths-weaknesses p {
    margin-bottom: 8px;
}

.character-overview .add-combo-hint {
    color: #ffffff90;
    font-size: 13px;
    line-height: 1.5;
    margin: 0 0 14px 0;
}

.character-overview .add-combo-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    background: #3eb489;
    color: #06231a;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 16px;
    border-radius: 0;
    border: none;
    transform: skewX(-8deg);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(62, 180, 137, 0.25);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.character-overview .add-combo-btn:hover {
    transform: skewX(-8deg) translateY(-1px);
    box-shadow: 0 6px 16px rgba(62, 180, 137, 0.35);
}

.character-overview .add-combo-btn:active {
    transform: skewX(-8deg) translateY(0);
}

.character-overview .btn-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transform: skewX(8deg);
}

.character-overview .add-combo-btn i,
.character-overview .add-montage-btn i {
    font-size: 12px;
}

.character-overview .add-montage-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    background: #fc73c4;
    color: #3d0d2b;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 16px;
    border-radius: 0;
    border: none;
    transform: skewX(-8deg);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(252, 115, 196, 0.25);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.character-overview .add-montage-btn:hover {
    transform: skewX(-8deg) translateY(-1px);
    box-shadow: 0 6px 16px rgba(252, 115, 196, 0.35);
}

.character-overview .add-montage-btn:active {
    transform: skewX(-8deg) translateY(0);
}

.mobile .character-overview {
    flex-direction: column;
}

.mobile .overview-card,
.mobile .overview-left,
.mobile .overview-right {
    width: 100%;
    max-width: 100%;
}

</style>
