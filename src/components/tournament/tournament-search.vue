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
                    Select Tournament
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';
import { eventbus } from '@/main';

/** API may return ObjectIds as strings or { _id } objects; populate may use Title */
function mapTournamentGameEntry(game) {
    if (game == null) return null;
    if (typeof game === 'string') {
        return { id: game, title: '' };
    }
    var rawId = game._id != null ? game._id : game.id;
    if (rawId != null && typeof rawId === 'object' && rawId.toString) {
        rawId = rawId.toString();
    }
    if (!rawId && game.$oid) {
        rawId = game.$oid;
    }
    if (!rawId) return null;
    var title = game.title != null ? game.title : game.Title != null ? game.Title : '';
    return { id: String(rawId), title: title || '' };
}

export default {
    name: 'tournaments-search',
    props: {
        tournament: {
            type: Number,
        },
        /** Select this tournament once the list has loaded (e.g. when editing an existing match). */
        initialTournamentId: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            isLoading: false,
            tournaments: [],
            selectedTournament: null,
        };
    },

    watch: {
        initialTournamentId() {
            this.applyInitialTournament();
        },
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
        async addTournament(newTournament) {
            var response = await TournamentsService.addTournament({
                Name: newTournament,
            });
            var tournamentId = response.data.tournamentId;
            this.getTournaments(tournamentId);
            eventbus.$emit('add:new-creator');
        },

        async getTournaments(newTournamentId) {
            this.isLoading = true;

            const response = await TournamentsService.fetchTournaments();
            this.tournaments = response.data.tournaments.map((tournament) => {
                return {
                    id: tournament._id,
                    name: tournament.Name,
                    games: tournament.Games ? tournament.Games.map(mapTournamentGameEntry).filter(Boolean) : null,
                };
            });

            if (newTournamentId) {
                this.selectedTournament = this.tournaments.filter(function (tournament) {
                    return String(tournament.id) === String(newTournamentId);
                })[0];
                this.setTournament();
            } else {
                this.applyInitialTournament();
            }

            this.isLoading = false;
        },

        applyInitialTournament() {
            if (!this.initialTournamentId || !this.tournaments.length) {
                return;
            }
            var want = String(this.initialTournamentId);
            var found = this.tournaments.filter(function (t) {
                return String(t.id) === want;
            })[0];
            if (found) {
                this.selectedTournament = found;
                this.setTournament();
            }
        },

        setTournament() {
            this.$emit('update:tournament', this.selectedTournament);
        },
    },
};
</script>
<style type="text/css"></style>
