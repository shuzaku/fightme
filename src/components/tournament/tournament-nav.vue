<!-- @format -->
<template>
    <div class="tournament-nav">
        <div class="title-row">
            <div v-if="tournament" class="tournament-header">
                <img :src="tournament.logoUrl" />
                <div class="title-container">
                    <h3>{{ tournament.name }}</h3>
                </div>
            </div>
            <div class="details">
                <div class="date-container">
                    <v-icon> mdi-calendar-range </v-icon>
                    <p class="date">{{ tournament.eventDate }}</p>
                </div>
                <div class="location-container">
                    <v-icon> mdi-map-marker </v-icon>
                    <p class="location">{{ tournament.location }}</p>
                </div>
            </div>
            <a :href="tournament.bracketUrl" target="_blank" class="bracket-button">
                <tournament-bracket-svg />
                <p>Bracket</p>
            </a>
        </div>
        <div class="filters">
            <game-search
                v-if="tournament.games.length > 1"
                :filteredGameIds="tournament.games"
                @update:game="filterGame($event)"
            />

            <bracket-search @filter:bracket="filterBracket($event)" />
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GameSearch from '../games/game-search.vue';
import BracketSearch from '../tournament/bracket-search.vue';
import TournamentsService from '@/services/tournaments-service';
import TournamentBracketSvg from '../svg/tournament-bracket-svg.vue';
import moment from 'moment';

export default {
    name: 'TournamentNav',
    components: {
        'game-search': GameSearch,
        'bracket-search': BracketSearch,
        'tournament-bracket-svg': TournamentBracketSvg,
    },
    props: {
        tournamentId: {
            type: String,
            default: '',
        },

        account: {
            type: Object,
            default: null,
        },

        showMenu: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            tournament: {
                name: null,
                logoUrl: null,
                bracketUrl: null,
                games: [],
            },
            popupActive: false,
            isFollowed: false,
        };
    },

    computed: {},

    watch: {
        tournamentId() {
            this.getTournament();
        },
    },

    created() {
        eventbus.$on('account:update', this.isGameFollowed);
        this.getTournament();
    },

    beforeDestroy() {
        eventbus.$off('account:update');
    },

    methods: {
        async getTournament() {
            const response = await TournamentsService.getTournament({
                id: this.tournamentId,
            });
            this.tournament = {
                name: response.data.Name,
                logoUrl: response.data.Image,
                bracketUrl: response.data.BracketUrl,
                games: response.data.Games,
                eventDate: moment(response.data.EventDate).format('MMM Do, YYYY'),
                location: response.data.Location,
            };
        },

        togglePopup() {
            this.popupActive = !this.popupActive;
        },

        filterGame(game) {
            this.$emit('filter:game', { queryName: 'GameId', queryValue: game.id });
        },

        filterBracket(bracket) {
            this.$emit('filter:bracket', { queryName: 'Notes', queryValue: bracket });
        },
    },
};
</script>
<style type="text/css">
.tournament-nav {
    width: 100%;
    z-index: 99;
    max-width: 800px;
}

.tournament-nav .title-row {
    display: flex;
}

.tournament-nav .tournament-header {
    height: 80px;
    background: #242832;
    color: #4447e2;
    width: calc(100% - 160px);
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.tournament-nav .tournament-header .title-container {
    margin-left: 18px;
}

.tournament-nav .details .date-container,
.tournament-nav .details .location-container {
    display: flex;
    align-items: center;
}

.tournament-nav .details .date-container {
    margin-bottom: 8px;
}

.tournament-nav .details .date,
.tournament-nav .details .location {
    font-size: 12px;
    color: #4447e2;
    margin-left: 8px;
}

.tournament-nav .details {
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px;
}

.tournament-nav .bracket-button {
    width: 80px;
    height: 80px;
    background: #4447e2;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    text-decoration: none;
    justify-content: center;
}

.tournament-nav .bracket-button svg {
    max-width: 40px;
    height: 40px;
}

.tournament-nav .tournament-header img {
    height: 100%;
    width: auto;
}

.tournament-nav .tournament-header .divider {
    margin: 0 10px;
}

.tournament-nav .tournament-header h3 {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
}

.tournament-nav .tournament-header select {
    margin: 0 5px;
    border-bottom: 1px solid #3eb489;
    font-weight: 600;
    cursor: pointer;
}

.tournament-nav .sort-filter-container .divider {
    margin: 0;
}
.tournament-nav .info-card {
    width: 130px;
    height: 40px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 2px solid #4447e2;
    color: #4447e2;
    background: #242832;
    cursor: pointer;
    margin-right: 5px;
}

.tournament-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.tournament-nav .popup {
    background: #4447e2;
    width: 100%;
    margin-top: 20px;
    padding: 2px 2px;
    border-radius: 5px;
}

.tournament-nav .mdi-chevron-down::before {
    content: '\F0140';
    color: #4447e2;
}

.tournament-nav .follow-btn,
.tournament-nav .unfollow-btn {
    width: 50px;
}

.tournament-nav .v-icon.v-icon {
    color: #4447e2;
}

.tournament-nav .filters {
    display: flex;
}

.tournament-nav .filters .bracket-search {
    min-width: 300px;
}

.tournament-nav .filters .game-search {
    min-width: 500px;
}
</style>
