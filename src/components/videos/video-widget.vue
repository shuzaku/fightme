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
                        <div class="creator-container">
                            <creator-search
                                v-model="video.contentCreatorId"
                                @update:creator="setCreator($event)"
                            />
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
            <match-video-settings
                v-if="currentStep === 'Match'"
                :gameId="video.gameId"
                @update:match="updateMatch($event)"
            />
            <combo-video-settings
                v-if="currentStep === 'Combo'"
                :gameId="video.gameId"
                :videoUrl="video.url"
                @update:match="updateCombo($event)"
            />

            <montage-video-settings
                v-if="currentStep === 'Montage'"
                :gameId="video.gameId"
                @update:match="updateMontage($event)"
            />

            <tournament-video-settings
                v-if="currentStep === 'Tournament Match'"
                :gameId="video.gameId"
                :videoUrl="video.url"
                @update:tournament="updateTournament($event)"
            />

            <v-btn v-if="currentStep === 'Video'" class="video-btn" rounded @click="nextStep()">
                Next
            </v-btn>
            <v-btn v-else class="submit-btn" rounded @click="submitVideo()">Submit</v-btn>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import UploadVideo from '@/components/videos/upload-video';
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';
import MatchesService from '@/services/matches-service';
import MontagesService from '@/services/montages-service';
import GameSearch from '@/components/games/game-search';
import CreatorSearch from '@/components/content-creator/creator-search';
import MatchVideoSettings from '@/components/videos/match-video-settings';
import ComboVideoSettings from '@/components/videos/combo-video-settings';
import MontageVideoSettings from '@/components/videos/montage-video-settings';
import TournamentVideoSettings from '@/components/videos/tournament-video-settings';

import { eventbus } from '@/main';

export default {
    name: 'VideoWidget',

    components: {
        'upload-video': UploadVideo,
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
        'match-video-settings': MatchVideoSettings,
        'combo-video-settings': ComboVideoSettings,
        'montage-video-settings': MontageVideoSettings,
        'tournament-video-settings': TournamentVideoSettings,
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
            comboInputsRaw: '',
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
            origin: 'web',
            isTournament: false,
            contentTypes: ['Match', 'Combo', 'Montage', 'Tournament Match'],
            isLoading: true,
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

        comboInputsRaw() {
            if (this.video.combo) {
                this.video.combo.inputs = this.comboInputsRaw.split('>');
            }
        },
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
                } else if (this.video.contentType === 'Montage') {
                    this.currentStep = 'Montage';
                } else if (this.video.contentType === 'Tournament Match') {
                    this.currentStep = 'Tournament Match';
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

        async submitVideo() {
            switch (this.video.contentType) {
                case 'Combo':
                    if (!this.videoId) {
                        this.postCombos();
                    } else {
                        await CombosService.patchCombo({
                            id: this.video.combo.id,
                            CharacterId: this.video.combo.characterId,
                            Inputs: this.video.combo.inputs,
                            Damage: this.video.combo.damage,
                            Hits: this.video.combo.hits,
                            Tags: this.video.combo.tags,
                        });
                        this.patchVideo();
                    }
                    break;
                case 'Match':
                    if (!this.videoId) {
                        this.postMatch();
                    } else {
                        await MatchesService.patchMatch({
                            id: this.video.match.id,
                            Team1Players: this.video.match.team1Players.map((player) => {
                                return {
                                    Id: player.id,
                                    Slot: 1,
                                    CharacterIds: player.characterIds,
                                };
                            }),
                            Team2Players: this.video.match.team2Players.map((player) => {
                                return {
                                    Id: player.id,
                                    Slot: 2,
                                    CharacterIds: player.characterIds,
                                };
                            }),
                            VideoUrl: this.video.url,
                            GameId: this.video.gameId,
                        });
                        this.patchVideo();
                    }
                    break;
                case 'Tournament Match':
                    this.postTournamentMatch();
                    break;
                case 'Montage':
                    this.postMontage();
                    break;
            }
        },

        async postCombos() {
            var combos = this.video.combos;
            const response = await CombosService.addBulkCombos(
                combos.map((combo) => {
                    return {
                        CharacterId: combo.characterId,
                        Inputs: combo.inputs,
                        Damage: combo.damage,
                        Hits: combo.hits,
                        StartTime: combo.startTime,
                        EndTime: combo.endTime,
                        Tags: combo.tags,
                    };
                })
            );

            for (var i = 0; i < this.video.combos.length; i++) {
                let combo = this.video.combos[i];
                combo.id = response.data.combos[i]._id;
            }

            if (this.video.type === 'uploaded') {
                this.$refs.videoUploader.upload();
            } else {
                this.postVideo();
            }
        },

        async postMatch() {
            var match = {
                Team1Players: this.video.match.team1Players.map((player) => {
                    return {
                        Id: player.id,
                        Slot: 1,
                        CharacterIds: player.characterIds,
                    };
                }),
                Team2Players: this.video.match.team2Players.map((player) => {
                    return {
                        Id: player.id,
                        Slot: 2,
                        CharacterIds: player.characterIds,
                    };
                }),
                VideoUrl: this.video.url,
                GameId: this.video.gameId,
                SubmittedBy: this.account.id,
                UpdatedBy: this.account.id,
            };

            await MatchesService.addMatch(match);

            if (this.video.type === 'uploaded') {
                this.$refs.videoUploader.upload();
            } else {
                this.postVideo();
            }
        },

        async postTournamentMatch() {
            var matches = this.video.tournament.matches.map((match) => {
                return {
                    Team1Players: match.team1Players.map((player) => {
                        return {
                            Id: player.id,
                            Slot: 1,
                            CharacterIds: player.characterIds,
                        };
                    }),
                    Team2Players: match.team2Players.map((player) => {
                        return {
                            Id: player.id,
                            Slot: 2,
                            CharacterIds: player.characterIds,
                        };
                    }),
                    StartTime: match.startTime,
                    EndTime: match.endTime,
                    WinningPlayersId: match.winningPlayers,
                    LosingPlayersId: match.losingPlayers,
                    VideoUrl: this.video.url,
                    GameId: this.video.gameId,
                    TournamentId: this.video.tournament.id,
                    SubmittedBy: this.account.id,
                    UpdatedBy: this.account.id,
                };
            });

            if (this.video.tournament.isSingleMatch) {
                await MatchesService.addMatch(matches[0]);
            } else {
                await MatchesService.addMatches(matches);
            }

            if (this.video.type === 'uploaded') {
                this.$refs.videoUploader.upload();
            } else {
                this.postVideo();
            }
        },

        async postMontage() {
            var montage = {
                Players: this.video.montage.players.map((player) => {
                    return player;
                }),
                Characters: this.video.montage.characters.map((character) => {
                    return {
                        Id: character.id,
                    };
                }),
                Type: this.video.montage.type,
                VideoUrl: this.video.url,
                GameId: this.video.gameId,
                SubmittedBy: this.account.id,
                UpdatedBy: this.account.id,
            };

            var response = await MontagesService.addMontage(montage);
            if (response.data.err) {
                this.error = 'Montage already exist';
                this.showErrorMessage = true;
            } else {
                if (this.video.type === 'uploaded') {
                    this.$refs.videoUploader.upload();
                } else {
                    this.postVideo();
                }
            }
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
                    this.$emit('closeModal');
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

        async getVideo() {
            const response = await VideosService.getVideo(this.videoId);
            var videoResponse = response.data.video;
            this.video = videoResponse.map((video) => {
                return {
                    id: video._id,
                    contentType: video.ContentType,
                    videoType: video.VideoType,
                    inview: false,
                    isEditing: false,
                    isPlaying: false,
                    url: video.Url,
                    combo: video.ContentType === 'Combo' ? this.getCombos(video.Combo) : null,
                    isFavorited: false,
                    gameId: video.GameId,
                    contentCreatorId: video.ContentCreatorId,
                    tags: video.Tags
                        ? video.Tags.map((tag) => {
                              return tag._id;
                          })
                        : null,
                    game: {
                        id: video.Game._id,
                        Title: video.Game.Title,
                        LogoUrl: video.Game.LogoUrl,
                    },
                    match:
                        video.ContentType === 'Match'
                            ? {
                                  id: video.Match._id,
                                  team1Players: video.Match.Team1Players.map((player) => {
                                      return {
                                          id: player.Id,
                                          slot: player.Slot,
                                          name: video.Match.Team1Player.filter(
                                              (searchPlayer) => searchPlayer._id === player.Id
                                          )[0].Name,
                                          characterIds: this.hydrateCharacters(
                                              player.CharacterIds,
                                              video.Match.Team1PlayerCharacters
                                          ),
                                          characterCount: player.CharacterIds.length,
                                      };
                                  }),
                                  team2Players: video.Match.Team2Players.map((player) => {
                                      return {
                                          id: player.Id,
                                          slot: player.Slot,
                                          name: video.Match.Team2Player.filter(
                                              (searchPlayer) => searchPlayer._id === player.Id
                                          )[0].Name,
                                          characterIds: this.hydrateCharacters(
                                              player.CharacterIds,
                                              video.Match.Team2PlayerCharacters
                                          ),
                                          characterCount: player.CharacterIds.length,
                                      };
                                  }),
                              }
                            : null,
                };
            })[0];
            this.isLoading = false;
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push(filteredCharacter[0]._id);
            });
            return playerCharacters;
        },

        getCombos(comboResponse) {
            return {
                id: comboResponse._id,
                inputs: comboResponse.Inputs,
                hits: comboResponse.Hits,
                damage: comboResponse.Damage,
                startTime: comboResponse.StartTime,
                endTime: comboResponse.EndTime,
                tags: comboResponse.Tags,
                character: comboResponse.CharacterId
                    ? {
                          name: comboResponse.Character.Name,
                          imageUrl: comboResponse.Character.ImageUrl,
                          id: comboResponse.Character._id,
                      }
                    : null,
            };
        },
        async patchVideo() {
            if (this.isValidated) {
                var videoRequest = {
                    id: this.video.id,
                    Tags: this.video.tags,
                    GameId: this.video.gameid,
                    Combos:
                        this.video.ContentType === 'Combo'
                            ? this.video.combos.map((combo) => {
                                  return combo.id;
                              })
                            : null,
                };

                await VideosService.patchVideo(videoRequest);

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } else {
                this.showErrorMessage = true;
            }
        },

        updateMatch(match) {
            this.video.match = match;
        },

        updateCombo(combo) {
            this.video.combo = combo;
        },

        updateMontage(montage) {
            this.video.montage = montage;
        },

        updateTournament(tournament) {
            this.video.tournament = tournament;
        },
    },
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
    margin: 10px 0 0px;
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
    margin: 5px 5px 5px;
}

.post-video .combo-stats,
.post-video .video-clip {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}

.post-video .combo-stats,
.post-video .inputs-container {
    padding: 0 2px;
}

.post-video .inputs-container textarea {
    height: 75px;
}

.post-video .input-container {
    padding: 0 5px;
}

.post-video .input-container input {
    font-size: 12px;
}

.post-video .inputs-container .v-input {
    padding-top: 0;
    margin-top: 0px;
}

.post-video .inputs-container .v-input__slot,
.post-video .input-container .v-input__slot {
    background: #fff;
}

.post-video .inputs-container .v-input__slot {
    padding: 10px;
}

.post-video .combo-title {
    margin: 20px 0 10px;
}

.post-video .combo-container {
    border: 1px solid #eee;
    padding: 20px 10px;
    background: #eee;
}

.post-video .character-container h3 {
    text-align: left;
}

.post-video .character-container {
    border: 1px solid #eee;
    text-align: center;
    padding: 10px 20px 20px;
    background: #eee;
    margin-bottom: 10px;
}
</style>
