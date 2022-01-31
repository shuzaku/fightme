<!-- @format -->
<template>
    <div class="match-step">
        <add-match @update-match="updateMatch()" />
    </div>
</template>

<script>
import AddMatch from '@/components/videos/add-match';

export default {
    name: 'MatchVideoSettings',

    components: {
        'add-match': AddMatch,
    },

    props: {
        gameId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {};
    },

    computed: {},

    mounted() {},

    methods: {
        updateMatch(match) {
            this.$emit('update:match', match);
        },
    },
};
</script>

<style type="text/css"></style>
