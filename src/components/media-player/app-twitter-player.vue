<!-- @format -->
<template>
    <div class="twitter-player">
        <tweet id="1923786245249052977"></tweet>
    </div>
</template>
<script>
import { Tweet, Moment, Timeline } from 'vue-tweet-embed';
export default {
    name: 'TwitterPlayer',

    components: {
        tweet: Tweet,
    },

    props: {
        video: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    computed: {},

    methods: {},
};
</script>

<style></style>
