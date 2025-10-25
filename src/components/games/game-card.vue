<!-- @format -->
<template>
    <div class="game-card">
        <img @click="navigate(game.id)" class="cover-art" :src="game.coverArt" />
    </div>
</template>

<script>
export default {
    name: 'game-card',
    components: {},

    props: {
        game: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            games: [],
        };
    },
    mounted() {},

    methods: {
        navigate(id) {
            this.$router.push(`/game/${id}`);
        },
    },
};
</script>

<style>
.explore-games .cover-art {
    width: 185px;
    height: 246px;
    background: cover;
    background-repeat: no-repeat;
}

.explore-games .cover-art img {
    width: 100%;
}

.explore-games .game {
    margin: 3px;
}
</style>
