<!-- @format -->
<template>
    <div class="add-tournament">
        <h1>Add Tournament</h1>
        <div v-if="step === 'tournament'" class="form tournament-info">
            <div v-if="tournament.logoUrl" class="tournament-img-container">
                <img :src="tournament.logoUrl" class="tournament-img" />
                <v-btn @click="tournament.logoUrl = ''">X</v-btn>
            </div>
            <input
                id="import-image"
                v-model="tournament.image"
                type="text"
                placeholder="Image Url"
            />
            <input
                v-model="tournament.name"
                type="text"
                name="name"
                placeholder="Tournament Name"
            />
            <input
                v-model="tournament.location"
                type="text"
                name="location"
                placeholder="Location"
            />
            <input v-model="tournament.eventDate" type="text" name="date" placeholder="Date" />
            <input v-model="tournament.tournamentSeries" type="text" name="tournament series" placeholder="Tournament Series">
            <v-btn class="submit-btn" rounded @click="goToGameStep()">Set Games</v-btn>
        </div>
        <div v-if="step === 'games'" class="form">
            <game-search
                v-model="games"
                :taggable="true"
                class="games"
                @update:game="setGame($event)"
            />
            <ul class="list-of-games">
                <li v-for="game in games" :key="game._id" class="tournament-games">
                    {{ game.title }}
                </li>
            </ul>
            <v-btn class="submit-btn" rounded @click="addTournament()">Add Tournament</v-btn>
        </div>
        <!-- add players step -->
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';
import GameSearch from '@/components/games/game-search';

export default {

    name: 'NewTournament',
    components: {
        'game-search': GameSearch
    },

    data() {
        return {
            step: 'tournament',
            games: '',
            tournament: {
                name: '',
                location: '',
                games: [],
                date: '',
                series: '',
                logoUrl: '',
                players: []
            }
        };
    },

    computed: {
        gameIds: function() {
            return this.games.map(game => {
                return game.id;
            });
        }
    },

    methods: {
        async addTournament() {
            await TournamentsService.addTournament({
                Name: this.tournament.name,
                Location: this.tournament.location,
                GameIds: this.gameIds,
                Date: this.tournament.date,
                // Series: this.tournament.series,
                LogoUrl: this.tournament.logoUrl
                // PlayerIds: this.tournament.players
            });
        },

        goToGameStep() {
            this.step = 'games';
        },

        setGame(games) {
            this.games = games;
        }
    }
};
</script>
<style type="text/css">
.add-tournament button,
.add-tournament .tournament-info input {
    display: block;
    margin-bottom: 20px;
}

.add-tournament .submit-btn {
    margin-top: 20px;
}

.add-tournament .tournament-img-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.add-tournament .tournament-img-container .tournament-img {
    max-width: 175px;
    margin: 0 auto;
}

.add-tournament .games {
    margin-top: 20px;
}
</style>
