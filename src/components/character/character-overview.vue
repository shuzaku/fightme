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
                <a :href="character.wikiUrl" target="_blank">Character Frame Data</a>
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

import { eventbus } from '@/main';

export default {
    name: 'CharacterOverview',

    components: {
        loading: Loading,
        'character-search': CharacterSearch,
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

    computed: {},

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {
        setCharacter2Id(character) {
            this.$emit('character2Id:update', character.id);
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
