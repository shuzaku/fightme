<!-- @format -->
<template>
    <div class="explore-tournaments">
        <h3>Upcoming Majors</h3>
        <div class="tournaments">
            <div v-for="tournament in tournaments" :key="tournament.id" class="tournament">
                <tournament-card :tournament="tournament" />
            </div>
        </div>
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';
import TournamentCard from '@/components/tournament/tournament-card';
import moment from 'moment';

export default {
    name: 'explore-tournament',
    components: {
        'tournament-card': TournamentCard,
    },

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
            var searchQuery = [
                {
                    queryName: 'IsFinished',
                    queryValue: false,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await TournamentsService.queryTournaments(queryParameter);
            this.tournaments = response.data.tournaments.map((tournament) => {
                return {
                    id: tournament._id,
                    name: tournament.Name,
                    logoUrl: tournament.Image,
                    games: tournament.Games,
                    location: tournament.Location,
                    eventDate: moment(tournament.EventDate).format('MM.DD.YY'),
                    bracketUrl: tournament.BracketUrl,
                    isFinished: tournament.IsFinished,
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
.explore-tournaments .tournaments {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.explore-tournaments h3 {
    margin-bottom: 24px;
    color: #fff;
}
</style>
