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
                    <div class="team1">
                        <div v-for="(player, index) in video.match.team1Players" :key="index">
                            <player-search
                                v-model="player.id"
                                @update:player="addPlayerToTeam1($event, index)"
                            />
                            <div class="character-container">
                                <h3>Characters</h3>
                                <div
                                    v-for="(character, i) in player.characterCount"
                                    :key="character"
                                >
                                    <character-search
                                        v-model="player.characters[i].id"
                                        :gameId="video.gameId"
                                        @update:character="addCharacterToPlayer($event, player)"
                                    />
                                </div>
                                <v-btn @click="addCharacter(player)">addCharacter</v-btn>
                            </div>
                        </div>
                        <v-btn @click="addToTeam1()">AddPlayers</v-btn>
                    </div>
                    <div class="versus">Vs.</div>
                    <div class="team2">
                        <div v-for="(player, index) in video.match.team2Players" :key="index">
                            <player-search
                                v-model="video.match.team2Players[index].id"
                                @update:player="addPlayerToTeam2($event, index)"
                            />
                            <div class="character-container">
                                <h3>Characters</h3>
                                <div
                                    v-for="(character, i) in player.characterCount"
                                    :key="character"
                                >
                                    <character-search
                                        v-model="player.characters[i].id"
                                        :gameId="video.gameId"
                                        @update:character="addCharacterToPlayer($event, player)"
                                    />
                                </div>
                                <v-btn @click="addCharacter(player)">addCharacter</v-btn>
                            </div>
                        </div>
                        <v-btn @click="addToTeam2()">AddPlayers</v-btn>
                    </div>
                    <div class="tag">
                        <tag-search
                            v-model="video.tags"
                            :taggable="true"
                            @update:tags="setTags($event)"
                        />
                    </div>
                </div>
            </div>
            <div v-if="currentStep === 'Combo'" class="combo-step">
                <div class="combos-container">
                    <youtube-media
                        v-if="video.type === 'youtube'"
                        :video-id="video.url"
                        :player-width="400"
                        :player-height="225"
                        :player-vars="{ rel: 0 }"
                    />
                    <div v-for="(combo, index) in video.combos" :key="index" class="combo">
                        <div class="combo-title" @click="expandComboMenu(index)">
                            <h3>Combo {{ index + 1 }}</h3>
                        </div>
                        <div v-show="combo.isExpanded" class="combo-container">
                            <div v-if="showErrorMessage" class="error-container">
                                <p class="error-msg">
                                    Please finish this combo before adding a new one.
                                </p>
                            </div>
                            <div class="character-container">
                                <character-search
                                    v-model="combo.characterId"
                                    :gameId="video.gameId"
                                    @update:character="setComboCharacter($event, combo)"
                                />
                            </div>
                            <div class="inputs-container">
                                <v-textarea v-model="combo.inputs" placeholder="Combo Inputs" />
                            </div>
                            <div class="combo-stats ">
                                <div class="startTime input-container">
                                    <v-text-field
                                        v-model="combo.startTime"
                                        type="Number"
                                        placeholder="Start Time"
                                    />
                                </div>
                                <div class="endTime input-container">
                                    <v-text-field
                                        v-model="combo.endTime"
                                        type="Number"
                                        placeholder="End Time"
                                    />
                                </div>
                                <div class="damage input-container">
                                    <v-text-field
                                        v-model="combo.damage"
                                        class="damage"
                                        type="Number"
                                        placeholder="Damage"
                                    />
                                </div>
                                <div class="hits input-container">
                                    <v-text-field
                                        v-model="combo.hits"
                                        class="hits"
                                        placeholder="Hits"
                                        type="Number"
                                    />
                                </div>
                            </div>
                            <div class="tag">
                                <tag-search
                                    v-model="video.tags"
                                    :taggable="true"
                                    @update:tags="setTags($event, combo)"
                                />
                            </div>
                            <v-btn class="add-combo-btn" rounded @click="addCombo(index)"
                                >Add More Combo</v-btn
                            >
                        </div>
                    </div>
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
import MatchesService from '@/services/matches-service';
import PlayerSearch from '@/components/players/player-search';
import CharacterSearch from '@/components/character/character-search';
import GameSearch from '@/components/games/game-search';
import CreatorSearch from '@/components/content-creator/creator-search';
import TournamentSearch from '@/components/tournament/tournament-search';
import TagSearch from '@/components/tags/tag-search';

import { eventbus } from '@/main';

export default {
    name: 'VideoWidget',

    components: {
        'upload-video': UploadVideo,
        'player-search': PlayerSearch,
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
        'character-search': CharacterSearch,
        'tournament-search': TournamentSearch,
        'tag-search': TagSearch
    },

    props: {
        videoId: {
            type: String,
            default: null
        }
    },

    data() {
        return {
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
                combos: [
                    {
                        id: '',
                        characterId: '',
                        damage: '',
                        hits: '',
                        inputs: '',
                        startTime: '',
                        endTime: '',
                        note: '',
                        isExpanded: true
                    }
                ],
                match: {
                    team1Players: [
                        {
                            id: null,
                            characterIds: [],
                            slot: null,
                            characterCount: 1
                        }
                    ],
                    team2Players: [
                        {
                            id: null,
                            characterIds: [],
                            slot: null,
                            characterCount: 1
                        }
                    ]
                },
                tags: []
            },
            importVideoUrl: null,
            origin: 'web',
            isTournament: false,
            contentTypes: ['Match', 'Combo', 'Analysis'],
            isLoading: true
        };
    },

    computed: {
        timeStamp: function() {
            return moment().format();
        },

        isValidated: function() {
            if (this.video.url && this.video.gameId) {
                if (
                    this.video.contentType === 'Match' &&
                    this.video.match.team1Players.length > 0 &&
                    this.video.match.team1Players.length > 0
                ) {
                    return true;
                } else if (this.video.contentType === 'Combo' && this.video.combos[0].id) {
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
                    this.addCombos();
                } else {
                    await CombosService.patchCombo({
                        id: this.video.combo.id,
                        CharacterId: this.video.combo.characterId,
                        Inputs: this.video.combo.inputs,
                        Damage: this.video.combo.damage,
                        Hits: this.video.combo.hits,
                        Tags: this.video.combo.tags
                    });
                    this.patchVideo();
                }
            } else {
                if (!this.videoId) {
                    this.addMatch();
                } else {
                    await MatchesService.patchMatch({
                        id: this.video.match.id,
                        Team1Players: this.video.match.team1Players.map(player => {
                            return {
                                Id: player.id,
                                Slot: 1,
                                CharacterIds: player.characterIds
                            };
                        }),
                        Team2Players: this.video.match.team2Players.map(player => {
                            return {
                                Id: player.id,
                                Slot: 2,
                                CharacterIds: player.characterIds
                            };
                        }),
                        VideoUrl: this.video.url,
                        GameId: this.video.gameId
                    });
                    this.patchVideo();
                }
            }
        },

        async addCombos() {
            var combos = this.video.combos;
            const response = await CombosService.addBulkCombos(
                combos.map(combo => {
                    return {
                        CharacterId: combo.characterId,
                        Inputs: combo.inputs,
                        Damage: combo.damage,
                        Hits: combo.hits,
                        StartTime: combo.startTime,
                        EndTime: combo.endTime,
                        Tags: combo.tags
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

        async addMatch() {
            var match = {
                Team1Players: this.video.match.team1Players.map(player => {
                    return {
                        Id: player.id,
                        Slot: 1,
                        CharacterIds: player.characterIds
                    };
                }),
                Team2Players: this.video.match.team2Players.map(player => {
                    return {
                        Id: player.id,
                        Slot: 2,
                        CharacterIds: player.characterIds
                    };
                }),
                VideoUrl: this.video.url,
                GameId: this.video.gameId
            };

            await MatchesService.addMatch(match);

            if (this.video.type === 'uploaded') {
                this.$refs.videoUploader.upload();
            } else {
                this.postVideo();
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
                    Combos: this.video.combos.map(combo => {
                        return {
                            Id: combo.id,
                            StartTime: combo.startTime,
                            EndTime: combo.endTime
                        };
                    }),
                    Tags: this.video.tags
                });

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } else {
                this.showErrorMessage = true;
            }
        },

        setComboCharacter(characterId, target) {
            target.characterId = characterId;
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
            this.video = videoResponse.map(video => {
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
                    tags: video.Tags
                        ? video.Tags.map(tag => {
                              return tag._id;
                          })
                        : null,
                    game: {
                        id: video.Game._id,
                        Title: video.Game.Title,
                        LogoUrl: video.Game.LogoUrl
                    },
                    match:
                        video.ContentType === 'Match'
                            ? {
                                  id: video.Match._id,
                                  team1Players: video.Match.Team1Players.map(player => {
                                      return {
                                          id: player.Id,
                                          slot: player.Slot,
                                          name: video.Match.Team1Player.filter(
                                              searchPlayer => searchPlayer._id === player.Id
                                          )[0].Name,
                                          characters: this.hydrateCharacters(
                                              player.CharacterIds,
                                              video.Match.Team1PlayerCharacters
                                          ),
                                          characterCount: player.CharacterIds.length
                                      };
                                  }),
                                  team2Players: video.Match.Team2Players.map(player => {
                                      return {
                                          id: player.Id,
                                          slot: player.Slot,
                                          name: video.Match.Team2Player.filter(
                                              searchPlayer => searchPlayer._id === player.Id
                                          )[0].Name,
                                          characters: this.hydrateCharacters(
                                              player.CharacterIds,
                                              video.Match.Team2PlayerCharacters
                                          ),
                                          characterCount: player.CharacterIds.length
                                      };
                                  })
                              }
                            : null
                };
            })[0];
            this.isLoading = false;
        },
        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach(id => {
                var filteredCharacter = characters.filter(character => character._id === id);
                playerCharacters.push({
                    name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                    id: filteredCharacter[0]._id,
                    imageUrl: filteredCharacter[0].ImageUrl
                });
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
                          id: comboResponse.Character._id
                      }
                    : null
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
                            ? this.video.combos.map(combo => {
                                  return combo.id;
                              })
                            : null
                };

                await VideosService.patchVideo(videoRequest);

                this.$emit('closeModal');
                eventbus.$emit('newVideoPosted');
            } else {
                this.showErrorMessage = true;
            }
        },

        addCombo(index) {
            if (!this.video.combos[index].inputs) {
                this.showErrorMessage = true;
            } else {
                this.video.combos[index].isExpanded = false;
                this.video.combos.push({
                    id: '',
                    characterId: '',
                    damage: '',
                    hits: '',
                    inputs: '',
                    startTime: '',
                    endTime: '',
                    isExpanded: true,
                    tags: []
                });
            }
        },

        expandComboMenu(index) {
            this.video.combos.forEach(combo => (combo.isExpanded = false));
            this.video.combos[index].isExpanded = true;
        },

        addToTeam1() {
            this.video.match.team1Players.push({
                id: null,
                characterIds: [],
                slot: null,
                characterCount: 1
            });
        },

        addToTeam2() {
            this.video.match.team2Players.push({
                id: null,
                characterIds: [],
                slot: null,
                characterCount: 1
            });
        },

        addCharacterToPlayer(character, player) {
            player.characterIds.push(character);
        },

        addCharacter(player) {
            player.characterCount++;
        },

        addPlayerToTeam1(item, index) {
            this.video.match.team1Players[index].id = item.id;
        },

        addPlayerToTeam2(item, index) {
            this.video.match.team2Players[index].id = item.id;
        },

        setTags(tags, combo) {
            if (combo) {
                combo.tags = tags.map(tag => {
                    return tag.id;
                });
            } else {
                this.video.tags = tags.map(tag => {
                    return tag.id;
                });
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
