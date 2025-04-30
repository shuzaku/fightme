<!-- @format -->
<template>
    <div class="tournamnets-search">
        <multiselect
            v-if="!isLoading"
            v-model="selectedTournament"
            :options="tournaments"
            :multiple="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :taggable="true"
            placeholder="Search or add a Tournament"
            label="name"
            @tag="addTournament($event)"
            @input="setTournament"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Series
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';
import { eventbus } from '@/main';

export default {
    name: 'tournaments-search',
    props: {
        tournament: {
            type: Number,
        },
    },
    data() {
        return {
            isLoading: false,
            tournaments: [],
            selectedTournament: null,
        };
    },

    mounted() {
        this.getTournaments();
    },

    created() {
        eventbus.$on('add:new-tournament', this.getTournaments);
    },

    beforeDestroy() {
        eventbus.$off('add:new-tournament', this.getTournaments);
    },

    methods: {
        async getTournamentSeries(newTournamentId) {
            this.isLoading = true;

            const response = await TournamentsService.fetchTournaments();
            this.tournaments = response.data.tournaments.map((tournament) => {
                return {
                    id: tournament._id,
                    name: tournament.Name,
                    games: tournament.Games
                        ? tournament.Games.map((game) => {
                              return {
                                  id: game._id,
                                  title: game.title,
                              };
                          })
                        : null,
                };
            });

            if (newTournamentId) {
                this.selectedTournament = this.tournaments.filter(
                    (tournament) => tournament.id === newTournamentId
                )[0];
                this.setTournament();
            }

            this.isLoading = false;
        },

        setTournament() {
            this.$emit('update:tournament', this.selectedTournament);
        },
    },
};
</script>
<style type="text/css"></style>
