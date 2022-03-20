<!-- @format -->
<template>
    <div class="video-nav inner-list ">
        <follows v-if="account.id" initialOpen :account="account" />
    </div>
</template>

<script>
import Follows from '@/components/account/follows';

export default {
    components: {
        'follows': Follows,
    },

    props: {
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            followedCharacters: null,
            followedGames: null,
            followedPlayers: null
        };
    },

    mounted() {
    }
};
</script>
