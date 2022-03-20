<!-- @format -->
<template>
    <div class="sidebar">
        <follows :account="account" />
    </div>
</template>

<script>
import Follows from '@/components/account/follows';

export default {
    components: {
        follows: Follows,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            createOptions: [
                {
                    name: 'Video',
                    value: 'video',
                },
                {
                    name: 'Game',
                    value: 'game',
                },
                {
                    name: 'Player',
                    value: 'player',
                },
                {
                    name: 'Creator',
                    value: 'creator',
                },
                {
                    name: 'Character',
                    value: 'character',
                },
                {
                    name: 'Tournament',
                    value: 'tournament',
                },
            ],
        };
    },

    created() {},

    methods: {},
};
</script>

<style></style>
