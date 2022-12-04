<!-- @format -->
<template>
    <div class="tournament-video-settings-container">
        <!-- <tournament-search v-model="tournament.id" @update:tournament="addTournament($event)" /> -->
        <v-radio-group v-model="tournament.isSingleMatch" :mandatory="false">
            <v-radio label="Single Match" :value="true"></v-radio>
            <v-radio label="Multiple Matches" :value="false"></v-radio>
        </v-radio-group>
        <div class="matches-container">
            <youtube-media
                ref="youtubeRef"
                :video-id="videoUrl"
                :player-width="400"
                :player-height="225"
                :player-vars="{ rel: 0 }"
            />
            <div v-for="(match, index) in tournament.matches" :key="index" class="match">
                <div class="match-title">
                    <h3 v-if="!tournament.isSingleMatch" @click="expandMatchMenu(index)">
                        Match {{ index + 1 }}
                    </h3>
                </div>
                <div v-show="match.isExpanded" class="match-container">
                    <add-match
                        :value="match"
                        :gameId="gameId"
                        @update:match="updateMatch($event, index)"
                    />
                    <div v-if="!tournament.isSingleMatch" class="more-matches">
                        <div class="clip-container">
                            <div class="start-time input-container">
                                <v-text-field
                                    v-model="match.startTime"
                                    type="Number"
                                    placeholder="Start Time"
                                />
                                <v-btn @click="setStartTime(index)">Set Start Time</v-btn>
                            </div>
                            <div class="end-time input-container">
                                <v-text-field
                                    v-model="match.endTime"
                                    type="Number"
                                    placeholder="End Time"
                                />
                                <v-btn @click="setEndTime(index)">Set End Time</v-btn>
                            </div>
                        </div>
                        <v-btn class="add-match-btn" rounded @click="addMatch(index)">
                            Add More Matches
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AddMatch from '@/components/videos/add-match';
// import TournamentSearch from '../tournament/tournament-search.vue';

export default {
    name: 'TournamentVideoSettings',

    components: {
        'add-match': AddMatch,
        // 'tournament-search': TournamentSearch,
    },

    props: {
        gameId: {
            type: String,
            default: null,
        },
        videoUrl: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            tournament: {
                id: '',
                matches: [
                    {
                        team1Players: [
                            {
                                id: null,
                                characterIds: [],
                                slot: null,
                                characterCount: 1,
                            },
                        ],
                        team2Players: [
                            {
                                id: null,
                                characterIds: [],
                                slot: null,
                                characterCount: 1,
                            },
                        ],
                        startTime: null,
                        endTime: null,
                        isExpanded: false,
                        winningPlayers: null,
                        losingPlayers: null,
                    },
                ],
                name: '',
                date: null,
                isSingleMatch: true,
            },
        };
    },

    computed: {},

    mounted() {
        this.tournament.matches[0].isExpanded = true;
    },

    methods: {
        expandMatchMenu(index) {
            this.tournament.matches.forEach((match) => (match.isExpanded = false));
            this.tournament.matches[index].isExpanded = true;
        },

        updateMatch(matchSettings, index) {
            this.tournament.matches[index].team1Players = matchSettings.team1Players;
            this.tournament.matches[index].team2Players = matchSettings.team2Players;
            this.tournament.matches[index].winningPlayers = matchSettings.winningPlayers;
            this.tournament.matches[index].losingPlayers = matchSettings.losingPlayers;
            this.tournament.matches[index].team1Players.characterIds =
                matchSettings.team1Players.characterIds.map((character) => {
                    return character.id;
                });
            this.tournament.matches[index].team2Players.characterIds =
                matchSettings.team2Players.characterIds.map((character) => {
                    return character.id;
                });

            this.$emit('update:tournament', this.tournament);
        },

        addMatch(index) {
            this.tournament.matches.push({
                team1Players: [
                    {
                        id: null,
                        characterIds: [],
                        slot: null,
                        characterCount: 1,
                    },
                ],
                team2Players: [
                    {
                        id: null,
                        characterIds: [],
                        slot: null,
                        characterCount: 1,
                    },
                ],
                startTime: null,
                endTime: null,
            });

            this.expandMatchMenu(index + 1);
            this.$emit('update:tournament', this.tournament);
        },

        addTournament(tournament) {
            this.tournament.id = tournament.id;
            this.tournament.name = tournament.name;
        },

        setStartTime(index) {
            this.tournament.matches[index].startTime = this.convertTime(
                this.$refs.youtubeRef.player.getCurrentTime()
            );
        },

        setEndTime(index) {
            this.tournament.matches[index].endTime = this.convertTime(
                this.$refs.youtubeRef.player.getCurrentTime()
            );
        },

        convertTime(time) {
            var h = Math.floor(time / 3600)
                    .toString()
                    .padStart(2, '0'),
                m = Math.floor((time % 3600) / 60)
                    .toString()
                    .padStart(2, '0'),
                s = Math.floor(time % 60)
                    .toString()
                    .padStart(2, '0');

            return h + ':' + m + ':' + s;
        },
    },
};
</script>

<style type="text/css">
.tournament-video-settings-container .start-time,
.tournament-video-settings-container .end-time {
    display: flex;
    align-items: center;
}

.tournament-video-settings-container .start-time .v-text-field__slot,
.tournament-video-settings-container .end-time .v-text-field__slot {
    display: flex;
    align-items: center;
}
</style>
