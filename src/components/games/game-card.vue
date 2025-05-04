<!-- @format -->
<template>
    <div class="game-card">
        <div
            @click="navigate(game.id)"
            class="cover-art"
            :style="[
                { 'background-image': `url(${game.coverArt})` },
                { 'background-size': 'cover' },
            ]"
        />
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
    width: 200px;
    height: 266px;
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
