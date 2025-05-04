<!-- @format -->
<template>
    <div class="completed-tournaments">
        <h3>Recent Tournaments</h3>
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
import { event } from 'vue-gtag';

export default {
    name: 'completed-character',
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
                    queryValue: true,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
                sortOption: 'EventDate desc',
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
            this.$router.push(`/tournament/${id}`);
        },
    },
};
</script>

<style>
.completed-tournaments h3 {
    color: #fff;
}

.completed-tournaments .tournaments {
    display: flex;
}
</style>
