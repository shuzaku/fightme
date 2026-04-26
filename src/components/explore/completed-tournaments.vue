<!-- @format -->
<template>
    <div class="completed-tournaments">
        <h2>🏆 Recent Tournaments</h2>
        <div class="tournaments tournaments--grid">
            <div v-for="(tournament, index) in tournaments" :key="tournament.id" class="tournament">
                <tournament-card :tournament="tournament" v-if="index < 7" />
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
                sort: 'EventDate desc',
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
    margin-bottom: 24px;
}

.completed-tournaments .tournaments--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
    gap: clamp(12px, 2.5vw, 18px);
    width: 100%;
    min-width: 0;
    margin: 0;
    align-items: stretch;
}

.completed-tournaments .tournament {
    display: flex;
    min-width: 0;
    max-width: 100%;
    width: 100%;
}

@media (max-width: 600px) {
    .completed-tournaments .tournaments--grid {
        grid-template-columns: 1fr;
    }
}
</style>
