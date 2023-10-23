<!-- @format -->
<template>
    <div class="tournament-view">
        <div class="video-info">
            <!--- game --->
            <p v-show="showErrorMessage && !video.gameId" class="error-msg">Please Game</p>
            <div class="game-container">
                <game-search v-model="video.gameId" @update:game="setGame($event)" />
            </div>
            <!--- video --->
            <creator-search v-model="video.contentCreatorId" @update:creator="setCreator($event)" />
            <tournament-search v-model="tournament.id" @update:tournament="addTournament($event)" />
            <input id="import-video" v-model="importVideoUrl" type="text" placeholder="Video Url" />
            <input v-model="matchType" type="text" placeholder="Tournament Details" />
            <div class="match-nav">
                <div v-for="(match, index) in tournament.matches" :key="index" class="match">
                    <div class="match-title">
                        <h3>Match {{ index + 1 }}</h3>
                        <v-btn :disable="match.isExpanded" @click="expandMatchMenu(index)">v</v-btn>
                    </div>
                </div>
            </div>
            <hr />
            <v-btn class="submit-btn" rounded @click="submitVideo()">Submit</v-btn>
        </div>

        <div class="tournament-video-settings-container">
            <div class="matches-container">
                <youtube-media
                    ref="youtubeRef"
                    :video-id="video.url"
                    :player-width="600"
                    :player-height="338"
                    :player-vars="{ rel: 0 }"
                />
                <div
                    v-for="(match, index) in tournament.matches"
                    :key="index"
                    class="match-content"
                >
                    <div v-show="match.isExpanded" class="match-container">
                        <add-match
                            :value="match"
                            :gameId="video.gameId"
                            @update:match="updateMatch($event, index)"
                        />
                        <div class="more-matches">
                            <div class="clip-container">
                                <div class="start-time input-container">
                                    <input
                                        v-model="match.startTime"
                                        type="text"
                                        placeholder="Start Time"
                                    />
                                    <v-btn @click="setStartTime(index)">+</v-btn>
                                </div>
                                <div class="end-time input-container">
                                    <input
                                        v-model="match.endTime"
                                        type="text"
                                        placeholder="End Time"
                                    />
                                    <v-btn @click="setEndTime(index)">+</v-btn>
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
    </div>
</template>

<script>
import moment from 'moment';
import VideosService from '@/services/videos-service';
import MatchesService from '@/services/matches-service';
import GameSearch from '@/components/games/game-search';
import CreatorSearch from '@/components/content-creator/creator-search';
import AddMatch from '@/components/videos/add-match';
import TournamentSearch from '@/components/tournament/tournament-search.vue';
import { eventbus } from '@/main';

export default {
    name: 'VideoWidget',

    components: {
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
        'add-match': AddMatch,
        'tournament-search': TournamentSearch,
    },

    props: {
        videoId: {
            type: String,
            default: null,
        },
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            isVideoClipped: false,
            currentStep: 'Video',
            showErrorMessage: false,
            error: null,
            video: {
                id: '',
                contentType: '',
                contentCreatorId: '',
                type: '',
                origin: '',
                url: '',
                startTime: '',
                endTime: '',
                gameId: '',
                combos: null,
                match: null,
                montage: null,
                tournament: null,
                tags: [],
            },
            importVideoUrl: null,
            isTournament: false,
            isLoading: true,
            matchType: null,
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

    computed: {
        timeStamp: function () {
            return moment().format();
        },

        isValidated: function () {
            if (this.video.url && this.video.gameId) {
                if (
                    this.video.contentType === 'Match' &&
                    this.video.match.team1Players.length > 0 &&
                    this.video.match.team1Players.length > 0
                ) {
                    return true;
                } else if (this.video.contentType === 'Combo' && this.video.combos[0].id) {
                    return true;
                } else if (
                    this.video.contentType === 'Montage' &&
                    this.video.montage.characters &&
                    this.video.montage.players
                ) {
                    return true;
                } else if (
                    this.video.contentType === 'Tournament Match' &&
                    this.video.tournament.id &&
                    this.video.tournament.matches.length > 0
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    },

    watch: {
        importVideoUrl() {
            if (this.importVideoUrl.includes('youtube')) {
                if (this.importVideoUrl.includes('ab_channel')) {
                    this.video.url = this.importVideoUrl.substring(
                        this.importVideoUrl.indexOf('v=') + 2,
                        this.importVideoUrl.indexOf('&ab_channel')
                    );
                } else {
                    this.video.url = this.importVideoUrl.substring(
                        this.importVideoUrl.indexOf('v=') + 2,
                        this.importVideoUrl.length
                    );
                }
                this.video.type = 'youtube';
            } else {
                this.video.url = this.importVideoUrl;
            }
        },
    },

    mounted() {
        this.tournament.matches[0].isExpanded = true;
    },

    methods: {
        async submitVideo() {
            this.postTournamentMatch();
        },

        async postTournamentMatch() {
            var matches = this.tournament.matches.map((match) => {
                return {
                    Team1Players: match.team1Players.map((player) => {
                        return {
                            Id: player.id,
                            Slot: 1,
                            CharacterIds: player.characterIds.map((character) => {
                                return character.id;
                            }),
                        };
                    }),
                    Team2Players: match.team2Players.map((player) => {
                        return {
                            Id: player.id,
                            Slot: 2,
                            CharacterIds: player.characterIds.map((character) => {
                                return character.id;
                            }),
                        };
                    }),
                    StartTime: match.startTime,
                    EndTime: match.endTime,
                    WinningPlayersId: match.winningPlayers,
                    VideoUrl: this.video.url,
                    GameId: this.video.gameId,
                    TournamentId: this.tournament.id,
                    TournamentMatchtype: this.matchType,
                    SubmittedBy: this.account.id,
                    UpdatedBy: this.account.id,
                };
            });

            await MatchesService.addMatches(matches);

            this.postVideo();
        },

        async postVideo() {
            if (this.isValidated) {
                if (this.video.contentType === 'Tournament Match') {
                    this.video.contentType = 'Match';
                }

                var response = await VideosService.addVideo({
                    Url: this.video.url,
                    ContentType: this.video.contentType,
                    ContentCreatorId: this.video.contentCreatorId,
                    VideoType: this.video.type,
                    VideoUrl: this.video.url,
                    StartTime: this.video.startTime,
                    EndTime: this.video.endTime,
                    GameId: this.video.gameId,
                    Combos:
                        this.video.contentType === 'Combo'
                            ? this.video.combos.map((combo) => {
                                  return {
                                      Id: combo.id,
                                      StartTime: combo.startTime,
                                      EndTime: combo.endTime,
                                  };
                              })
                            : null,
                    Tags: this.video.tags,
                    SubmittedBy: this.account.id,
                    UpdatedBy: this.account.id,
                });

                if (response.data.err) {
                    this.error = 'Video already exist';
                    this.showErrorMessage = true;
                } else {
                    eventbus.$emit('newVideoPosted');
                }
            } else {
                this.showErrorMessage = true;
            }
        },

        setGame(game) {
            this.video.gameId = game.id;
        },

        setTournament(tournament) {
            this.video.match.tournamentId = tournament._id;
        },

        setCreator(creatorId) {
            this.video.contentCreatorId = creatorId.id;
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push(filteredCharacter[0]._id);
            });
            return playerCharacters;
        },

        updateMatch(match, index) {
            this.tournament.matches[index].team1Players = match.team1Players;
            this.tournament.matches[index].team2Players = match.team2Players;
            this.tournament.matches[index].winningPlayers = match.winningPlayers;
        },

        updateTournament(tournament) {
            this.video.tournament = tournament;
        },

        expandMatchMenu(index) {
            this.tournament.matches.forEach((match) => (match.isExpanded = false));
            this.tournament.matches[index].isExpanded = true;
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
                isExpanded: false,
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
.tournament-view {
    background: #fff;
    width: 100%;
    padding: 40px 20px;
    border-radius: 15px;
    display: flex;
    justify-content: space-between;
}

.tournament-view .player1,
.tournament-view .player2 {
    display: flex;
    margin-top: 20px;
    margin-bottom: 10px;
}

.tournament-view .video-info {
    max-width: 30%;
    width: 100%;
}

.tournament-view .tournament-video-settings-container {
    max-width: 69%;
    width: 100%;
}

.tournament-view .player-container,
.tournament-view .character-container {
    max-width: 49%;
    width: 100%;
}

.tournament-view input {
    margin-bottom: 0px;
}

.tournament-view .clip-container {
    display: flex;
    margin-bottom: 20px;
    justify-content: space-between;
}

.tournament-view .multiselect {
    margin-bottom: 0px;
}

.tournament-view .match-details {
    margin-bottom: 20px;
}

.tournament-view h3 {
    margin-bottom: 10px;
}

.tournament-view .match-nav {
    margin-bottom: 20px;
    margin-top: 20px;
}

.tournament-view .submit-btn {
    margin-top: 20px;
}

.tournament-view .match {
    border-bottom: 1px dashed #efefef;
    padding: 10px 5px 0;
}

.tournament-view .match-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.tournament-view .match-title h3 {
    margin-bottom: 0;
}
</style>
