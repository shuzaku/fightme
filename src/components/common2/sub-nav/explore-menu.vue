<!-- @format -->
<template>
    <div class="explore-nav inner-list ">
        <h2>Suggestions:</h2>
        <games />
    </div>
</template>

<script>
import Games from '@/components/games/games';

export default {
    components: {
        'games': Games,
    },

    data() {
        return {
            selectedGame: {
                id: null
            },
            selectedCharacter: null
        };
    },

    methods: {

    }
};
</script>
