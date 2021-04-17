<!-- @format -->
<template>
    <div class="add-tournament">
        <h1>Add Tournament</h1>
        <div class="form tournament-info" v-if="step === 'tournament'">
            <div class="tournament-img-container" v-if="tournament.logoUrl">
                <img :src="tournament.logoUrl" class="tournament-img" />
                <v-btn @click="tournament.logoUrl = ''">X</v-btn>
            </div>
            <input
                id="import-image"
                type="text"
                v-model="tournament.logoUrl"
                placeholder="Image Url"
            />
            <input
                type="text"
                name="name"
                placeholder="Tournament Name"
                v-model="tournament.name"
            />
            <input
                type="text"
                name="location"
                placeholder="Location"
                v-model="tournament.location"
            />
            <input type="text" name="date" placeholder="Date" v-model="tournament.date" />
            <!-- <input type="text" name="tournament series" placeholder="Tournament Series" v-model="tournament.date"> -->
            <v-btn class="submit-btn" rounded @click="goToGameStep()">Set Games</v-btn>
        </div>
        <div class="form" v-if="step === 'games'">
            <game-search
                v-model="games"
                :taggable="true"
                class="games"
                @update:game="setGame($event)"
            />
            <ul class="list-of-games">
                <li v-for="game in games" class="tournament-games" :key="game._id">
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
    components: {
        'game-search': GameSearch
    },

    name: 'NewTournament',

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
