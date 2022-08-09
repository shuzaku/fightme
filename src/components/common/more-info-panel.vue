<!-- @format -->
<template>
    <div class="more-info-panel">
        <!-- <more-matchup-info v-if="routeName === 'MatchUps'" /> -->
        <more-character-info v-if="routeName === 'Character'" />
    </div>
</template>

<script>
import MoreMatchupInfo from '@/components/matchup/more-matchup-info';
import MoreCharacterInfo from '@/components/character/more-character-info';

export default {
    components: {
        'more-matchup-info': MoreMatchupInfo,
        'more-character-info': MoreCharacterInfo,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    computed: {
        routeName: function () {
            return this.$route.name;
        },
    },

    data() {
        return {};
    },

    created() {},

    methods: {},
};
</script>

<style>
.more-info-panel {
    margin-left: 50px;
    padding-top: 50px;
}

.more-info-panel .info-card {
    width: 200px;
    height: 120px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 2px solid #4447e2;
    color: #4447e2;
    background: #242832;
}

.more-info-panel .quick-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
}
</style>
