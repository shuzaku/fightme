<!-- @format -->
<template>
    <div class="game-videos">
        <div v-if="selectedVideoType === 'Combos'">
            <game-combos :account="account" />
        </div>
        <div v-else-if="selectedVideoType === 'Online Matches'">
            <game-online-matches :account="account" :teamChar1="teamChar1" :teamChar2="teamChar2" />
        </div>
        <div v-else-if="selectedVideoType === 'Tournament Matches'">
            <game-tournament-matches :account="account" :teamChar1="teamChar1" :teamChar2="teamChar2" />
        </div>
    </div>
</template>

<script>
import GameOnlineMatches from '@/components/games/game-online-matches';
import GameTournamentMatches from '@/components/games/game-tournament-matches';
import GameCombos from '@/components/games/game-combos';
export default {
    name: 'GameVideos',

    components: {
        'game-online-matches': GameOnlineMatches,
        'game-tournament-matches': GameTournamentMatches,
        'game-combos': GameCombos,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
        selectedVideoType: {
            type: String,
            default: 'Online Matches',
        },
        teamChar1: { type: String, default: null },
        teamChar2: { type: String, default: null },
    },

    data() {
        return {};
    },

    computed: {},

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {},
};
</script>

<style>
.game-videos {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.game-videos video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
