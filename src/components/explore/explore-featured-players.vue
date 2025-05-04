<!-- @format -->
<template>
    <div class="explore-featured-players">
        <h3>Featured Players</h3>
        <div class="players">
            <div v-for="player in featuredPlayers" :key="player.id" class="player">
                <featured-player-card :featuredPlayer="player" />
            </div>
        </div>
    </div>
</template>

<script>
import FeaturedPlayersService from '@/services/featured-players-service';
import FeaturedPlayerCard from '@/components/players/featured-player-card';

export default {
    name: 'explore-featured-players',
    components: {
        'featured-player-card': FeaturedPlayerCard,
    },

    props: {},

    data() {
        return {
            featuredPlayers: [],
        };
    },
    mounted() {
        this.getFeaturedPlayers();
    },

    methods: {
        async getFeaturedPlayers() {
            const response = await FeaturedPlayersService.fetchFeaturedPlayers();
            this.featuredPlayers = response.data.featuredPlayers.map((player) => {
                return {
                    id: player._id,
                    playerId: player.FeaturedPlayer[0]._id,
                    playerName: player.FeaturedPlayer[0].Name,
                    imageUrl: player.FeaturedPlayer[0].ImageUrl,
                };
            });
            this.featuredPlayers = this.featuredPlayers.reverse();
        },

        navigate(id) {
            this.$router.push(`/player/${id}`);
        },
    },
};
</script>

<style>
.explore-featured-players {
    margin-bottom: 40px;
}
.explore-featured-players .cover-art {
    width: 200px;
    height: 266px;
    background: cover;
    background-repeat: no-repeat;
    border: 1px solid #3eb489;
}

.explore-featured-players .cover-art img {
    width: 100%;
}

.explore-featured-players .players {
    display: flex;
    align-items: center;
}

.explore-featured-players h3 {
    color: #fff;
}
</style>
