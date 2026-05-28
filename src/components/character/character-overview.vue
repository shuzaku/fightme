<!-- @format -->
<template>
    <div class="character-overview">
        <div class="overview-left">
            <div class="strengths-weaknesses overview-card">
                <h3>Strengths and Weaknesses</h3>
                <p><span class="strength">+ </span> {{ character.strengths }}</p>
                <p><span class="weakness">- </span> {{ character.weaknesses }}</p>
            </div>
            <div class="gameplan-strategy overview-card">
                <h3>Gameplan Summary</h3>
                <p>
                    {{ character.gameplan }}
                </p>
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

            <div v-if="character.players && character.players.length" class="top-players overview-card">
                <h3>Top Players</h3>
                <div class="top-players-list">
                    <router-link
                        v-for="player in character.players"
                        :key="player.id"
                        :to="player.slug ? '/player/' + player.slug : '/player/' + player.id"
                        class="top-player-row"
                    >
                        <div class="top-player-avatar">
                            <img v-if="player.imageUrl" :src="player.imageUrl" :alt="player.name" />
                            <span v-else class="top-player-initials">{{ playerInitials(player.name) }}</span>
                        </div>
                        <span class="top-player-name">{{ player.name }}</span>
                    </router-link>
                </div>
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
        playerInitials(name) {
            if (!name) return '?';
            return name.split(' ').slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
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
    background: #191b2490;
    border-radius: 15px;
    padding: 20px;
    color: #ffffff90;
    border: 1px solid #ffffff30;
    margin-top: 16px;
}

.character-overview .overview-card h3 {
    margin-bottom: 8px;
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
    margin-bottom: 8px;
    text-decoration: none;
    transition: color 0.2s;
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

.character-overview .strength {
    color: #5ae1ae;
}

.character-overview .weakness {
    color: #ba6d79;
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

/* ── Top Players ──────────────────────────────── */
.character-overview .top-players-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
}

.character-overview .top-player-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 8px;
    background: #ffffff08;
    border: 1px solid #ffffff10;
    text-decoration: none;
    color: #c0c4e0;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.character-overview .top-player-row:hover {
    background: #3eb48918;
    border-color: #3eb48960;
    color: #3eb489;
}

.character-overview .top-player-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid #ffffff20;
    background: #1c1f27;
    display: flex;
    align-items: center;
    justify-content: center;
}

.character-overview .top-player-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.character-overview .top-player-initials {
    font-size: 0.7rem;
    font-weight: 700;
    color: #6a6ef5;
}

.character-overview .top-player-name {
    font-size: 0.88rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
