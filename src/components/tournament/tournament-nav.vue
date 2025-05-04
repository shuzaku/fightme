<!-- @format -->
<template>
    <div class="tournament-nav">
        <div v-if="tournament" class="tournament-header">
            <img :src="tournament.logoUrl" />
            <h3>{{ tournament.name }}</h3>
        </div>

        <game-search :filteredGameIds="tournament.games" @update:game="filterGame($event)" />
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GameSearch from '../games/game-search.vue';
import TournamentsService from '@/services/tournaments-service';

export default {
    name: 'TournamentNav',
    components: {
        'game-search': GameSearch,
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
            };
        },

        togglePopup() {
            this.popupActive = !this.popupActive;
        },

        filterGame(game) {
            this.$emit('filter:game', { queryName: 'GameId', queryValue: game.id });
        },
    },
};
</script>
<style type="text/css">
.tournament-nav {
    width: 100%;
    z-index: 99;
    max-width: 600px;
}

.tournament-nav .tournament-header {
    height: 80px;
    background: #242832;
    color: #4447e2;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
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
    margin-left: 18px;
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
</style>
