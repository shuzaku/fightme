<!-- @format -->
<template>
    <div class="add-match">
        <!--- players --->
        <div class="players-container">
            <div class="team1">
                <div class="player1" v-for="(player, index) in match.team1Players" :key="index">
                    <div class="player-container">
                        <h3>Player</h3>
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
                <!-- <v-btn @click="addToTeam1()">Add player to team 1</v-btn> -->
            </div>
            <div class="versus">Vs.</div>
            <div class="team2">
                <div class="player2" v-for="(player, index) in match.team2Players" :key="index">
                    <div class="player-container">
                        <h3>Player</h3>
                        <player-search
                            v-model="player.id"
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
                <!-- <v-btn @click="addToTeam2()">Add player to team 2</v-btn> -->
            </div>
            <div class="match-details">
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
            </div>
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
    },

    data() {
        return {
            winningTeam: null,
            match: {
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

    mounted() {},

    methods: {
        setDefaultValues() {
            this.match.team1Players = this.value.team1Players;
            this.match.team2Players = this.value.team2Players;
            this.match.winningPlayers = this.value.winningPlayers;
            this.match.losingPlayers = this.value.losingPlayers;
        },

        addCharacterToPlayer(characters, player) {
            player.characterIds = characters;
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
    },
};
</script>

<style type="text/css"></style>
