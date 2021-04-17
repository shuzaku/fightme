<!-- @format -->
<template>
    <div v-if="!isLoading || !videoId" class="post-video">
        <div class="formcontainer">
            <h1 v-if="!videoId">Add Video</h1>
            <h1 v-else>Edit Video</h1>
            <div v-show="currentStep === 'Video'" class="video-step">
                <p v-show="showErrorMessage && !video.contentType" class="error-msg">
                    Please select content type
                </p>
                <multiselect
                    v-model="video.contentType"
                    :options="contentTypes"
                    :multiple="false"
                    :close-on-select="true"
                    :clear-on-select="false"
                    placeholder="Select Content Type"
                >
                    <template slot="selection" slot-scope="{ values, isOpen }">
                        <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                            Select Content Type
                        </span>
                    </template>
                </multiselect>
                <!--- game --->
                <p v-show="showErrorMessage && !video.gameId" class="error-msg">Please Game</p>
                <div class="game-container">
                    <game-search v-model="video.gameId" @update:game="setGame($event)" />
                </div>
                <!--- video --->
                <div v-if="!videoId" class="video-container">
                    <v-radio-group v-model="video.origin" :mandatory="false">
                        <v-radio label="From the web" value="web"></v-radio>
                        <v-radio label="From my computer" value="computer"></v-radio>
                    </v-radio-group>
                    <div v-if="video.origin == 'web'" class="import-video-container">
                        <v-text-field
                            id="import-video"
                            v-model="importVideoUrl"
                            type="text"
                            placeholder="Video Url"
                        />
                        <v-btn
                            v-if="!isVideoClipped && video.type === 'youtube'"
                            class="players-btn"
                            tile
                            color="indigo"
                            @click="isVideoClipped = !isVideoClipped"
                        >
                            Clip Video
                        </v-btn>
                        <div v-if="isVideoClipped" class="video-clip-container">
                            <div class="startTime">
                                <v-text-field
                                    v-model="video.startTime"
                                    type="Number"
                                    placeholder="Start Time"
                                />
                            </div>
                            <div class="endTime">
                                <v-text-field
                                    v-model="video.endTime"
                                    type="Number"
                                    placeholder="End Time"
                                />
                            </div>
                        </div>
                    </div>
                    <div v-else class="upload-video-container">
                        <upload-video
                            ref="videoUploader"
                            @upload:video="setUploadedVideo($event)"
                        />
                    </div>
                </div>
            </div>
            <div v-if="currentStep === 'Match'" class="match-step">
                <!--- tournament --->
                <v-checkbox v-model="isTournament" :label="`Tournament Match?`"></v-checkbox>
                <tournament-search v-if="isTournament" v-model="video.match.tournamentId" />

                <!--- creator --->
                <div class="creator-container">
                    <creator-search
                        v-model="video.contentCreatorId"
                        @update:creator="setCreator($event)"
                    />
                </div>

                <!--- players --->
                <div class="players-container">
                    <h2>Players</h2>
                    <p v-show="showErrorMessage && !video.match.player1.id" class="error-msg">
                        Please select player 1
                    </p>
                    <player-search
                        v-model="video.match.player1.id"
                        :player="1"
                        @update:player="setPlayer1($event)"
                    />
                    <p
                        v-show="showErrorMessage && !video.match.player1.characterId"
                        class="error-msg"
                    >
                        Please select player 1's character
                    </p>
                    <character-search
                        v-if="video.gameId"
                        v-model="video.match.player1.characterId"
                        :gameId="video.gameId"
                        :player="1"
                        @update:character="setPlayer1Character($event)"
                    />
                    <v-btn
                        v-if="!player1Has2Characters && video.match.player1.characterId"
                        class="add-more-characters"
                        tile
                        color="indigo"
                        @click="player1Has2Characters = !player1Has2Characters"
                    >
                        Add another character
                    </v-btn>
                    <character-search
                        v-if="video.gameId && player1Has2Characters"
                        v-model="video.match.player1.characterId2"
                        :gameId="video.gameId"
                        :player="2"
                        @update:character="setPlayer1Character2($event)"
                    />
                    <v-btn
                        v-if="!player1Has3Characters && video.match.player1.character2Id"
                        class="add-more-characters"
                        tile
                        color="indigo"
                        @click="player1Has3Characters = !player1Has3Characters"
                    >
                        Add another character
                    </v-btn>
                    <character-search
                        v-if="video.gameId && player1Has3Characters"
                        v-model="video.match.player1.characterId3"
                        :gameId="video.gameId"
                        :player="2"
                        @update:character="setPlayer1Character3($event)"
                    />
                    <strong> VS. </strong>
                    <p v-show="showErrorMessage && !video.match.player2.id" class="error-msg">
                        Please select player 2
                    </p>
                    <player-search
                        v-model="video.match.player2.id"
                        :player="2"
                        @update:player="setPlayer2($event)"
                    />
                    <p
                        v-show="showErrorMessage && !video.match.player2.characterId"
                        class="error-msg"
                    >
                        Please select player 2's character
                    </p>
                    <character-search
                        v-if="video.gameId"
                        v-model="video.match.player2.characterId"
                        :gameId="video.gameId"
                        :player="2"
                        @update:character="setPlayer2Character($event)"
                    />
                    <v-btn
                        v-if="!player2Has2Characters && video.match.player2.characterId"
                        class="add-more-characters"
                        tile
                        color="indigo"
                        @click="player2Has2Characters = !player2Has2Characters"
                    >
                        Add another character
                    </v-btn>
                    <character-search
                        v-if="video.gameId && player2Has2Characters"
                        v-model="video.match.player2.characterId2"
                        :gameId="video.gameId"
                        :player="2"
                        @update:character="setPlayer2Character2($event)"
                    />
                    <v-btn
                        v-if="!player2Has3Characters && video.match.player2.character2Id"
                        class="add-more-characters"
                        tile
                        color="indigo"
                        @click="player2Has3Characters = !player2Has3Characters"
                    >
                        Add another character
                    </v-btn>
                    <character-search
                        v-if="video.gameId && player2Has3Characters"
                        v-model="video.match.player2.characterId3"
                        :gameId="video.gameId"
                        :player="2"
                        @update:character="setPlayer2Character3($event)"
                    />
                    <div v-if="video.match.player1.id && video.match.player2.id" class="winner">
                        <multiselect
                            v-model="video.match.winner"
                            :options="players"
                            :multiple="false"
                            :close-on-select="true"
                            :clear-on-select="false"
                            placeholder="Match Winner"
                            label="name"
                            @input="setWinner"
                        >
                            <template slot="selection" slot-scope="{ values, isOpen }">
                                <span
                                    v-if="values.length &amp;&amp; !isOpen"
                                    class="multiselect__single"
                                >
                                    Select Winner
                                </span>
                            </template>
                        </multiselect>
                        <select v-model="video.match.winner">
                            <option v-for="player in players" :key="player.id">
                                {{ player.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-if="currentStep === 'Combo'" class="combo-step">
                <div v-if="video.gameId" class="character-container">
                    <character-search
                        v-model="video.combo.characterId"
                        :gameId="video.gameId"
                        @update:character="setComboCharacter($event)"
                    />
                </div>
                <div class="combo-details-container">
                    <v-text-field v-model="video.combo.hits" label="Combo Hits" type="Number" />
                    <v-text-field v-model="video.combo.damage" type="Number" label="Combo Damage" />
                </div>
                <div class="inputs-container">
                    <v-textarea v-model="comboInputsRaw" placeholder="Combo Inputs" />
                </div>
            </div>
            <v-btn v-if="currentStep === 'Video'" class="video-btn" rounded @click="nextStep()"
                >Next</v-btn
            >
            <v-btn v-else class="submit-btn" rounded @click="setUpVideo()">Submit</v-btn>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import UploadVideo from '@/components/videos/upload-video';
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';
import PlayerSearch from '@/components/players/player-search';
import CharacterSearch from '@/components/character/character-search';
import GameSearch from '@/components/games/game-search';
import CreatorSearch from '@/components/content-creator/creator-search';
import TournamentSearch from '@/components/tournament/tournament-search';
import { eventbus } from '@/main';

export default {
    name: 'VideoWidget',

    components: {
        'upload-video': UploadVideo,
        'player-search': PlayerSearch,
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
        'character-search': CharacterSearch,
        'tournament-search': TournamentSearch
    },

    props: {
        videoId: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            winner: null,
            isVideoClipped: false,
            currentStep: 'Video',
            comboInputsRaw: '',
            showErrorMessage: false,
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
                comboId: '',
                match: {
                    player1: {
                        id: '',
                        name: '',
                        characterId: ''
                    },
                    player2: {
                        id: '',
                        name: '',
                        characterId: ''
                    },
                    winner: {
                        name: '',
                        id: ''
                    },
                    tournamentId: ''
                },
                tags: []
            },
            isAddingPlayers: false,
            isImportingVideo: true,
            importVideoUrl: null,
            games: [],
            origin: 'web',
            isTournament: false,
            contentTypes: ['Match', 'Combo', 'Analysis'],
            player1Has2Characters: false,
            player1Has3Characters: false,
            player2Has2Characters: false,
            player2Has3Characters: false,
            isLoading: true
        };
    },

    computed: {
        timeStamp: function() {
            return moment().format();
        },

        players: function() {
            var players = [];
            players.push(this.video.match.player1);
            players.push(this.video.match.player2);
            return players;
        },

        isValidated: function() {
            if (this.video.url && this.video.gameId) {
                if (
                    this.video.contentType === 'Match' &&
                    this.video.match.player1.characterId &&
                    this.video.match.player2.characterId &&
                    this.video.match.player1.id &&
                    this.video.match.player2.id
                ) {
                    return true;
                } else if (this.video.contentType === 'Combo' && this.video.combo.id) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    },

    watch: {
        importVideoUrl() {
            if (this.importVideoUrl.includes('youtube')) {
                this.video.url = this.importVideoUrl.substring(
                    this.importVideoUrl.indexOf('v=') + 2,
                    this.importVideoUrl.indexOf('&ab_channel')
                );
                this.video.type = 'youtube';
            } else {
                this.video.url = this.importVideoUrl;
            }
        },

        comboInputsRaw() {
            if (this.video.combo) {
                this.video.combo.inputs = this.comboInputsRaw.split('>');
            }
        }
    },

    mounted() {
        if (this.videoId) {
            this.getVideo();
        }
    },

    methods: {
        nextStep() {
            if (this.video.gameId && this.video.url && this.video.contentType) {
                this.showErrorMessage = false;
                if (this.video.contentType === 'Combo') {
                    this.currentStep = 'Combo';
                } else if (this.video.contentType === 'Match') {
                    this.currentStep = 'Match';
                }
            } else {
                this.showErrorMessage = true;
            }
        },

        setUploadedVideo(uploadedVideo) {
            this.video.url = null;
            this.video.url = uploadedVideo;
            this.video.type = 'uploaded';
            this.postVideo();
        },

        async setUpVideo() {
            if (this.video.contentType === 'Combo') {
                if (!this.videoId) {
                    const response = await CombosService.addCombo({
                        CharacterId: this.video.combo.characterId,
                        Inputs: this.video.combo.inputs,
                        Damage: this.video.combo.damage,
                        Hits: this.video.combo.hits
                    });

                    this.video.comboId = response.data.id;

                    if (this.video.type === 'uploaded') {
                        this.$refs.videoUploader.upload();
                    } else {
                        this.postVideo();
                    }
                } else {
                    await CombosService.patchCombo({
                        id: this.video.combo.id,
                        CharacterId: this.video.combo.characterId,
                        Inputs: this.video.combo.inputs,
                        Damage: this.video.combo.damage,
                        Hits: this.video.combo.hits
                    });
                    this.patchVideo();
                }
            } else {
                if (!this.videoId) {
                    this.postVideo();
                } else {
                    this.patchVideo();
                }
            }
        },

        async postVideo() {
            if (this.isValidated) {
                await VideosService.addVideo({
                    Url: this.video.url,
                    ContentType: this.video.contentType,
                    ContentCreatorId: this.video.contentCreatorId,
                    VideoType: this.video.type,
                    VideoUrl: this.video.url,
                    StartTime: this.video.startTime,
                    EndTime: this.video.endTime,
                    GameId: this.video.gameId,
                    ComboId: this.video.comboId,
                    Player1Id: this.video.match.player1.id,
                    Player1CharacterId: this.video.match.player1.characterId,
                    Player1Character2Id: this.video.match.player1.character2Id,
                    Player1Character3Id: this.video.match.player1.character3Id,
                    Player2Id: this.video.match.player2.id,
                    Player2CharacterId: this.video.match.player2.characterId,
                    Player2Character2Id: this.video.match.player2.character2Id,
                    Player2Character3Id: this.video.match.player2.character3Id,
                    WinnerId: this.video.match.winner.id,
                    // TournamentId: this.video.match.tournamentId,
                    Tags: this.video.tags
                });

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } else {
                this.showErrorMessage = true;
            }
        },

        setPlayer1(player) {
            this.video.match.player1.id = player.id;
            this.video.match.player1.name = player.name;
        },

        setPlayer2(player) {
            this.video.match.player2.id = player.id;
            this.video.match.player2.name = player.name;
        },

        setWinner(player) {
            this.video.match.winner.name = player.name;
            this.video.match.winner.id = player.id;
        },

        setPlayer1Character(characterId) {
            this.video.match.player1.characterId = characterId;
        },

        setPlayer1Character2(characterId) {
            this.video.match.player1.character2Id = characterId;
        },

        setPlayer1Character3(characterId) {
            this.video.match.player1.character3Id = characterId;
        },

        setPlayer2Character(characterId) {
            this.video.match.player2.characterId = characterId;
        },

        setPlayer2Character2(characterId) {
            this.video.match.player2.character2Id = characterId;
        },

        setPlayer2Character3(characterId) {
            this.video.match.player2.character3Id = characterId;
        },

        setComboCharacter(characterId) {
            this.video.combo.characterId = characterId;
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

        setTags(tags) {
            this.video.tags = tags;
        },

        async getVideo() {
            const response = await VideosService.getVideo(this.videoId);
            var videoResponse = response.data.video;
            console.log(videoResponse);
            this.video = videoResponse.map(video => {
                return {
                    url: video.Url,
                    contentType: video.ContentType,
                    contentCreatorId: video.ContentCreatorId,
                    type: video.VideoType,
                    startTime: video.StartTime,
                    endTime: video.EndTime,
                    gameId: video.GameId,
                    combo: video.Combo
                        ? {
                              id: video.ComboId,
                              characterId: video.Combo.CharacterId,
                              damage: video.Combo.Damage,
                              hits: video.Combo.Hits,
                              inputs: video.Combo.Inputs.join('>')
                          }
                        : null,
                    match: !video.Combo
                        ? {
                              player1: {
                                  id: video.Player1Id,
                                  name: video.Player1.Name,
                                  characterId: video.Player1CharacterId,
                                  character2Id: video.Player1Character2Id,
                                  character3Id: video.Player1Character3Id
                              },
                              player2: {
                                  id: video.Player2Id,
                                  name: video.Player2.Name,
                                  characterId: video.Player2CharacterId,
                                  character2Id: video.Player2Character2Id,
                                  character3Id: video.Player2Character3Id
                              },
                              winner: {
                                  id: video.WinnerId
                              }
                          }
                        : null,
                    tags: video.Tags,
                    origin: video.Type === 'youtube' ? 'web' : 'computer'
                };
            })[0];

            this.comboInputsRaw = videoResponse[0].Combo
                ? videoResponse[0].Combo.Inputs.join('>')
                : null;

            if (videoResponse[0].WinnerId) {
                this.video.match.winner = this.players.filter(
                    player => player.id === videoResponse[0].WinnerId
                );
            }

            if (!videoResponse[0].Combo) {
                this.player1Has2Characters = this.video.match.player1.character2Id ? true : false;
                this.player1Has3Characters = this.video.match.player1.character3Id ? true : false;
                this.player2Has2Characters = this.video.match.player2.character2Id ? true : false;
                this.player2Has3Characters = this.video.match.player2.character3Id ? true : false;
            }

            this.isLoading = false;
        },

        async patchVideo() {
            if (this.isValidated) {
                var request = {
                    id: this.videoId,
                    ContentType: this.video.contentType,
                    ContentCreatorId: this.video.contentCreatorId,
                    GameId: this.video.gameId,
                    Tags: this.video.tags
                };

                if (!this.video.combo) {
                    request.Player1Id = this.video.match.player1.id;
                    request.Player1CharacterId = this.video.match.player1.characterId;
                    request.Player1Character2Id = this.video.match.player1.character2Id;
                    request.Player1Character3Id = this.video.match.player1.character3Id;
                    request.Player2Id = this.video.match.player2.id;
                    request.Player2CharacterId = this.video.match.player2.characterId;
                    request.Player2Character2Id = this.video.match.player2.character2Id;
                    request.Player2Character3Id = this.video.match.player2.character3Id;
                    request.WinnerId = this.video.match.winner.id;
                } else {
                    request.ComboId = this.video.combo.id;
                }

                await VideosService.patchVideo(request);

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } else {
                this.showErrorMessage = true;
            }
        }
    }
};
</script>

<style type="text/css">
.post-video {
    text-align: left;
    margin: 0 auto;
}

.post-video .players-container button,
.post-video .players-container input,
.post-video label,
.post-video .or {
    display: block;
}

.post-video .players-container,
.post-video .game-container,
.post-video .upload-video-container,
.post-video .import-video-container,
.post-video .or,
.post-video .players-btn {
    margin-bottom: 20px;
}

.post-video .submit-btn {
    margin-top: 30px;
}

.post-video .players-container {
    position: relative;
}

.post-video .players-container .close-btn {
    margin: 0 0 20px auto;
    position: absolute;
    min-width: 40px;
    top: 5px;
    right: 20px;
}

.post-video .players-container {
    border: 1px solid #eee;
    text-align: center;
    padding: 10px 20px 20px;
}

.post-video .players-container .multiselect {
    margin: 10px 0 20px;
}

.post-video .players-container h2 {
    text-align: left;
    margin-bottom: 30px;
}

.post-video .error-msg {
    color: red;
    font-weight: 300;
    font-style: italics;
    text-align: left;
}

.post-video .v-label--active {
    transform: translateY(-18px) scale(0.75) translateX(-20px);
}

.post-video .v-input input {
    margin: 15px 5px 5px;
}
</style>
