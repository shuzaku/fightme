<!-- @format -->
<template>
    <div class="add-match">
        <!--- players --->
        <div class="players-container">
            <h2>Players</h2>
            <div class="team1">
                <div v-for="(player, index) in match.team1Players" :key="index">
                    <player-search
                        v-model="player.id"
                        @update:player="addPlayerToTeam1($event, index)"
                    />
                    <div class="character-container">
                        <h3>Characters</h3>
                        <character-search
                            v-model="player.characterIds"
                            :gameId="gameId"
                            @update:character="addCharacterToPlayer($event, player)"
                        />
                    </div>
                </div>
            </div>
            <div class="versus">Vs.</div>
            <div class="team2">
                <div v-for="(player, index) in match.team2Players" :key="index">
                    <player-search
                        v-model="player.id"
                        @update:player="addPlayerToTeam2($event, index)"
                    />
                    <div class="character-container">
                        <h3>Characters</h3>
                        <character-search
                            v-model="player.characterIds"
                            :gameId="gameId"
                            @update:character="addCharacterToPlayer($event, player)"
                        />
                    </div>
                </div>
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
                losingPlayers: null,
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
        match() {
            this.$emit('update:match', this.match);
        },
    },

    mounted() {},

    methods: {
        addCharacterToPlayer(character, player) {
            player.characterIds.push(character);
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
    },
};
</script>

<style type="text/css"></style>
