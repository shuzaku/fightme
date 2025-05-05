<!-- @format -->
<template>
    <div class="featured-player-card">
        <img class="player" :src="featuredPlayer.imageUrl" />

        <div class="name">
            {{ featuredPlayer.playerName }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'featured-player-card',
    components: {},

    props: {
        featuredPlayer: {
            type: Object,
            required: true,
        },
    },

    methods: {
        navigate(id) {
            this.$router.push(`/player/${id}`);
        },
    },
};
</script>

<style>
.featured-player-card {
    position: relative;
    width: 100%;
    height: auto;
    padding: 4px;
    cursor: pointer;
}

.featured-player-card .name {
    position: absolute;
    bottom: 7px;
    right: 4px;
    padding: 5px;
    font-size: 12px;
    background-color: #3eb489;
    color: #fff;
}

.featured-player-card .player {
    max-width: 260px;
    width: 100%;
    border: 1px solid #3eb489;
}
</style>
