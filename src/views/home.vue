<!-- @format -->
<template>
    <div class="home-view">
        <new-characters />
        <new-games />
        <new-tournament />
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    name: 'Home',

    components: {},

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            notes: null,
        };
    },

    watch: {},

    mounted() {
        this.queryNotes();
    },

    beforeDestroy() {},

    methods: {},
};
</script>

<style></style>
