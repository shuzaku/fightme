<!-- @format -->
<template>
    <div class="explore-tournaments">
        <h3>Explore Tournaments</h3>
        <div class="tournaments">
            <div v-for="tournament in tournaments" :key="tournament.id" class="tournament">
                <img :src="tournament.logoUrl" class="logo" />
                <p>{{ tournament.name }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';

export default {
    name: 'explore-tournament',
    components: {},

    props: {},

    data() {
        return {
            tournaments: [],
        };
    },
    mounted() {
        this.getTournaments();
    },

    methods: {
        async getTournaments() {
            const response = await TournamentsService.fetchTournaments();
            this.tournaments = response.data.tournaments.map((tournament) => {
                return {
                    id: tournament._id,
                    name: tournament.Name,
                    logoUrl: tournament.Image,
                    games: tournament.Games,
                    location: tournament.Location,
                    eventDate: tournament.EventDate,
                };
            });
        },

        navigate(id) {
            this.$router.push(`/game/${id}`);
        },
    },
};
</script>

<style>
.explore-tournaments .tournament {
    max-width: 150px;
    color: #fff;
    padding: 8px;
}

.explore-tournaments .logo {
    width: 100%;
    border: 1px solid #fff;
    width: 134px;
    height: 134px;
}

.explore-tournaments .tournaments {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.explore-tournaments .game {
    margin: 3px;
}

.explore-tournaments h3 {
    color: #fff;
}
</style>
