<!-- @format -->
<template>
    <div class="add-match">
        <!--- players --->
        <div class="players-container">
            <div class="team1">
                <div v-for="(player, index) in match.team1Players" :key="index" class="player1">
                    <div class="player-header">
                        <h3>Team 1 Player {{ index + 1 }}</h3>
                        <v-btn
                            v-if="match.team1Players.length > 1"
                            icon
                            small
                            class="remove-player-btn"
                            @click="removeFromTeam1(index)"
                        >
                            <i class="fas fa-times"></i>
                        </v-btn>
                    </div>
                    <div class="player-container">
                        <player-search
                            v-model="player.id"
                            @update:player="addPlayerToTeam1($event, index)"
                        />
                    </div>
                    <div class="character-container">
                        <h3>Characters</h3>
                        <character-search
                            v-model="player.characterIds"
                            :gameId="gameId"
                            multiple
                            @update:character="addCharacterToPlayer($event, player)"
                        />
                    </div>
                </div>
                <v-btn v-if="match.team1Players.length < 2" @click="addToTeam1()"
                    >Add player to team 1</v-btn
                >
            </div>
            <div class="versus">Vs.</div>
            <div class="team2">
                <div v-for="(player, index) in match.team2Players" :key="index" class="player2">
                    <div class="player-header">
                        <h3>Team 2 Player {{ index + 1 }}</h3>
                        <v-btn
                            v-if="match.team2Players.length > 1"
                            icon
                            small
                            class="remove-player-btn"
                            @click="removeFromTeam2(index)"
                        >
                            <i class="fas fa-times"></i>
                        </v-btn>
                    </div>
                    <div class="player-container">
                        <player-search
                            v-model="player.id"
                            multiple
                            @update:player="addPlayerToTeam2($event, index)"
                        />
                    </div>
                    <div class="character-container">
                        <h3>Characters</h3>
                        <character-search
                            v-model="player.characterIds"
                            :gameId="gameId"
                            multiple
                            @update:character="addCharacterToPlayer($event, player)"
                        />
                    </div>
                </div>
                <v-btn v-if="match.team2Players.length < 2" @click="addToTeam2()"
                    >Add player to team 2</v-btn
                >
            </div>
            <!-- <div class="match-details">
                <multiselect
                    v-model="winningTeam"
                    :options="teams"
                    :multiple="false"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :preserve-search="true"
                    :taggable="true"
                    placeholder="Match Winner"
                    label="name"
                    @input="selectWinner($event)"
                >
                    <template slot="option" slot-scope="props">
                        {{ props.option.name }}:
                        <span v-for="player in props.option.players" :key="player.id">
                            {{ player.name }}
                        </span>
                    </template>
                </multiselect>
            </div> -->
        </div>
    </div>
</template>

<script>
import PlayerSearch from '@/components/players/player-search';
import CharacterSearch from '@/components/character/character-search';

export default {
    name: 'MatchVideoSettings',

    components: {
        'player-search': PlayerSearch,
        'character-search': CharacterSearch,
    },

    props: {
        gameId: {
            type: String,
            default: null,
        },
        value: {
            type: Object,
            default: null,
        },
        savedMatch: {
            type: Object,
            default: null,
        },

        match: {
            type: Object,
            default: {
                team1Players: [
                    {
                        id: null,
                        name: null,
                        characterIds: [],
                        slot: null,
                        characterCount: 1,
                    },
                ],
                team2Players: [
                    {
                        id: null,
                        name: null,
                        characterIds: [],
                        slot: null,
                        characterCount: 1,
                    },
                ],
                winningPlayers: null,
            },
        },
    },

    data() {
        return {
            winningTeam: null,
        };
    },

    computed: {
        teams: function () {
            var teams = [
                { name: 'Team1', players: this.match.team1Players },
                { name: 'Team2', players: this.match.team2Players },
            ];

            return teams;
        },
    },

    watch: {
        value() {
            this.setDefaultValues();
        },
    },

    mounted() {
        if (this.savedMatch) {
            this.match = this.savedMatch;
        }
    },

    methods: {
        setDefaultValues() {
            this.match.team1Players = this.value.team1Players;
            this.match.team2Players = this.value.team2Players;
            this.match.winningPlayers = this.value.winningPlayers;
            this.match.losingPlayers = this.value.losingPlayers;
        },

        addCharacterToPlayer(characters, player) {
            player.characterIds = characters.map((character) => character.id);
            this.$emit('update:match', this.match);
        },

        addCharacter(player) {
            player.characterCount++;
        },

        addPlayerToTeam1(item, index) {
            this.match.team1Players[index].id = item.id;
            this.match.team1Players[index].name = item.playerName;

            this.$emit('update:match', this.match);
        },

        addPlayerToTeam2(item, index) {
            this.match.team2Players[index].id = item.id;
            this.match.team2Players[index].name = item.playerName;

            this.$emit('update:match', this.match);
        },

        selectWinner(team) {
            if (team === this.teams[0]) {
                this.match.winningPlayers = this.teams[0].players.map((player) => {
                    return player.id;
                });
                this.match.losingPlayers = this.teams[1].players.map((player) => {
                    return player.id;
                });
            } else {
                this.match.winningPlayers = this.teams[1].players.map((player) => {
                    return player.id;
                });
                this.match.losingPlayers = this.teams[0].players.map((player) => {
                    return player.id;
                });
            }

            this.winningTeam = team;
            this.$emit('update:match', this.match);
        },

        addToTeam2() {
            this.match.team2Players.push({
                id: null,
                name: null,
                characterIds: [],
                slot: null,
                characterCount: 1,
            });
        },

        addToTeam1() {
            this.match.team1Players.push({
                id: null,
                name: null,
                characterIds: [],
                slot: null,
                characterCount: 1,
            });
        },

        removeFromTeam1(index) {
            this.match.team1Players.splice(index, 1);
            this.$emit('update:match', this.match);
        },

        removeFromTeam2(index) {
            this.match.team2Players.splice(index, 1);
            this.$emit('update:match', this.match);
        },
    },
};
</script>

<style type="text/css">
.add-match .versus {
    margin: 40px 0;
    padding: 8px;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
}

.add-match .player-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.add-match .player-header h3 {
    margin: 0;
}

.add-match .remove-player-btn {
    color: #ff6b6b !important;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.add-match .remove-player-btn:hover {
    opacity: 1;
}
</style>
