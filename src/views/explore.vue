<!-- @format -->
<template>
    <div class="explore-view">
        <div class="banner-section">
            <img
                src="https://res.cloudinary.com/shuzchef/image/upload/v1746394665/cg8jwlfdtc6r6qicze0q.png"
                alt="Explore Banner"
                class="banner-image"
            />
        </div>
        <completed-tournaments />
        <explore-updates />
        <explore-tournaments />
        <explore-featured-players />
        <explore-games />
    </div>
</template>

<script>
import CompletedTournaments from '@/components/explore/completed-tournaments.vue';
import ExploreUpdates from '@/components/explore/explore-updates.vue';
import ExploreTournaments from '@/components/explore/explore-tournaments.vue';
import ExploreFeaturedPlayers from '@/components/explore/explore-featured-players.vue';
import ExploreGames from '@/components/explore/explore-games.vue';
import appTwitterPlayer from '@/components/media-player/app-twitter-player.vue';
export default {
    name: 'explore',

    components: {
        'completed-tournaments': CompletedTournaments,
        'explore-updates': ExploreUpdates,
        'explore-tournaments': ExploreTournaments,
        'explore-featured-players': ExploreFeaturedPlayers,
        'explore-games': ExploreGames,
        'app-twitter-player': appTwitterPlayer,
    },
};
</script>

<style>
.explore-view {
    padding: 200px 30px 0;
    min-width: calc(71vw - 140px);
    margin-top: 40px;
}

.banner-section {
    text-align: center;
    margin-bottom: 40px;
}

.banner-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
}

/* Component spacing */
.explore-view > * {
    margin-bottom: 40px;
}

.explore-view > *:last-child {
    margin-bottom: 0;
}
</style>
