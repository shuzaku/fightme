<!-- @format -->
<template>
    <div class="character-videos">
        <div v-if="selectedVideoType === 'Combos'">
            <character-combos :account="account" :characterId="characterId" />
        </div>
        <div v-else-if="selectedVideoType === 'Online Matches'">
            <character-online-matches :account="account" :characterId="characterId" />
        </div>
        <div v-else-if="selectedVideoType === 'Tournament Matches'">
            <character-tournament-matches :account="account" :characterId="characterId" />
        </div>
        <div v-else-if="selectedVideoType === 'Matchups'">
            <character-matchups
                :account="account"
                :character2Id="character2Id"
                :characterId="characterId"
            />
        </div>
    </div>
</template>

<script>
import CharacterOnlineMatches from '@/components/character/character-online-matches';
import CharacterTournamentMatches from '@/components/character/character-tournament-matches';
import CharacterCombos from '@/components/character/character-combos';
import CharacterMatchups from '@/components/character/character-matchups';
export default {
    name: 'CharacterVideos',

    components: {
        'character-online-matches': CharacterOnlineMatches,
        'character-tournament-matches': CharacterTournamentMatches,
        'character-combos': CharacterCombos,
        'character-matchups': CharacterMatchups,
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

        character2Id: {
            type: Array,
            default: null,
        },

        characterId: {
            type: String,
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

    methods: {},
};
</script>

<style>
.character-videos {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.character-videos video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
