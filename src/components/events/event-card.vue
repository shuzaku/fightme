<!-- @format -->
<template>
    <div class="event-card" :style="componentStyle" @click="navigate()">
        <p class="days-left">{{ event.daysLeft }}d left</p>
    </div>
</template>

<script>
export default {
    components: {},

    name: 'EventCard',

    props: {
        event: {
            type: Object,
            default: null,
        },
    },

    computed: {
        componentStyle() {
            return {
                'background-image': `url(${this.event.imageUrl})`,
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
            console.log('navigate');
        },
    },
};
</script>
<style type="text/css">
.event-card {
    width: 200px;
    height: 100px;
    background-position: center;
    position: relative;
}

.event-card .days-left {
    background: red;
    color: #fff;
    position: absolute;
    padding: 2px 5px;
    right: 0;
    font-size: 12px;
}
</style>
