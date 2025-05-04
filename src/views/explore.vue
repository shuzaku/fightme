<!-- @format -->
<template>
    <div class="explore-view">
        <div class="banner-section">
            <img
                src="https://res.cloudinary.com/shuzchef/image/upload/v1746394665/cg8jwlfdtc6r6qicze0q.png"
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
import ExploreTournaments from '@/components/explore/explore-tournaments';
import ExploreGames from '@/components/explore/explore-games';
import ExploreUpdates from '@/components/explore/explore-updates';
import ExploreFeaturedPlayers from '@/components/explore/explore-featured-players';
import CompletedTournament from '@/components/explore/completed-tournaments';

export default {
    name: 'explore',

    components: {
        'explore-games': ExploreGames,
        'explore-tournaments': ExploreTournaments,
        'explore-updates': ExploreUpdates,
        'explore-featured-players': ExploreFeaturedPlayers,
        'completed-tournaments': CompletedTournament,
    },

    data() {
        return {};
    },

    computed: {},

    methods: {},
};
</script>

<style>
.explore-view {
    padding: 10px 30px 0;
    min-width: calc(71vw - 140px);
    margin-top: 40px;
}

.explore-view h1 {
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.explore-view .header {
    margin-bottom: 30px;
    color: #fff;
    font-size: 20px;
}

.explore-view .explore-nav button {
    margin-right: 5px;
}

.explore-view .explore-nav {
    margin-bottom: 50px;
}

.explore-view .events {
    margin-bottom: 40px;
}

.explore-view .banner-section {
    text-align: center;
    margin-bottom: 40px;
}

.explore-view .completed-tournaments,
.explore-view .explore-updates,
.explore-view .explore-tournaments,
.explore-view .featured-players,
.explore-view .explore-games {
    margin-bottom: 40px;
}
</style>
