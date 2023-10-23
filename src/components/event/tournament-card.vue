<!-- @format -->
<template>
    <div class="tournament-card" :style="componentStyle" @click="navigate()">
        <p class="days-left">{{ tournament.date }}</p>
    </div>
</template>

<script>
export default {
    components: {},

    name: 'EventCard',

    props: {
        tournament: {
            type: Object,
            default: null,
        },
    },

    computed: {
        componentStyle() {
            return {
                'background-image': `url(${this.tournament.imageUrl})`,
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
            };
        },
    },

    data() {
        return {};
    },

    mounted() {},

    methods: {
        navigate() {
        },
    },
};
</script>
<style type="text/css">
.tournament-card {
    width: 250px;
    height: 125px;
    background-position: center;
    position: relative;
    margin-bottom: 10px;
    margin-right: 10px;
}

.tournament-card .days-left {
    background: red;
    color: #fff;
    position: absolute;
    padding: 2px 5px;
    right: 0;
    font-size: 12px;
}
</style>
