<!-- @format -->
<template>
    <div class="featured-player-card">
        <div
            @click="navigate(featuredPlayer.playerId)"
            class="cover-art"
            :style="[
                { 'background-image': `url(${featuredPlayer.imageUrl})` },
                { 'background-size': 'cover' },
            ]"
        />
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
    margin-bottom: 40px;
    position: relative;
}

.featured-player-card .name {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 5px;
    font-size: 12px;
    background-color: #3eb489;
    color: #fff;
}
</style>
