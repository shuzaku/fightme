<!-- @format -->
<template>
    <div class="match-box" @click="navigateToMatches()">
        <div class="heading">
            <h2>All Matches</h2>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MatchBox',

    props: {
        character: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    computed: {
        // boxStyle() {
        //     return {
        //         'background-color': '#3eb489',
        //         'background-size': 'cover',
        //         'background-repeat': 'no-repeat',
        //     };
        // },
    },

    mounted() {},

    methods: {
        navigateToCombo() {
            this.$router.push(`/character/${this.character.id}/matches`);
        },
    },
};
</script>

<style type="text/css">
.match-box {
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
}

.match-box h2.heading {
    margin-bottom: 20px;
    text-align: center;
}
</style>
