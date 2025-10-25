<!-- @format -->
<template>
    <div v-if="!isLoading || !videoId" class="new-combo">
        <div class="formcontainer">
            <h1 v-if="!videoId">Add Combo</h1>
            <h1 v-else>Edit Combo</h1>
            <div class="video-step">
                <youtube-media
                    v-if="video.url && video.type === 'youtube'"
                    ref="youtubeRef"
                    :video-id="video.url"
                    :player-width="417"
                    :player-height="234"
                    :mute="true"
                    :playsinline="1"
                />
                <tweet v-if="video.url && video.type === 'twitter'" :id="video.url" />

                <!--- video --->
                <div v-if="!videoId" class="video-container">
                    <div class="import-video-container">
                        <v-text-field
                            dark
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
                </div>
            </div>
            <!--- game --->
            <p v-show="showErrorMessage && !video.gameId" class="error-msg">Please Game</p>
            <div class="game-container">
                <game-search v-model="video.gameId" @update:game="setGame($event)" />
            </div>

            <combo-video-settings
                :combos="video.combos"
                :gameId="video.gameId"
                :videoUrl="video.url"
                @update:match="updateCombo($event)"
            />

            <v-btn class="submit-btn" rounded @click="submitVideo()">Submit</v-btn>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import UploadVideo from '@/components/videos/upload-video';
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';

import GameSearch from '@/components/games/game-search';
import CreatorSearch from '@/components/content-creator/creator-search';
import MatchVideoSettings from '@/components/videos/match-video-settings';
import ComboVideoSettings from '@/components/videos/combo-video-settings';
import MontageVideoSettings from '@/components/videos/montage-video-settings';
import TournamentVideoSettings from '@/components/videos/tournament-video-settings';

import { eventbus } from '@/main';
import { Tweet, Moment, Timeline } from 'vue-tweet-embed';

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
        tweet: Tweet,
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
                gameId: null,
                combos: [
                    {
                        id: '',
                        characterId: [],
                        damage: '',
                        hits: '',
                        inputs: '',
                        startTime: '',
                        endTime: '',
                        note: '',
                        isExpanded: true,
                    },
                ],
                match: null,
                montage: null,
                tournament: null,
                tags: [],
            },
            importVideoUrl: null,
            isLoading: true,
        };
    },

    computed: {
        timeStamp: function () {
            return moment().format();
        },

        isValidated: function () {
            if (this.video.url && this.video.gameId && this.video.combos[0].id) {
                return true;
            } else {
                return false;
            }
        },
    },

    watch: {
        importVideoUrl() {
            if (this.importVideoUrl.includes('youtube')) {
                this.importYoutube();
            } else if (
                this.importVideoUrl.includes('x.com') ||
                this.importVideoUrl.includes('twitter')
            ) {
                this.importTwitter();
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

    mounted() {},

    methods: {
        async submitVideo() {
            if (!this.video.id) {
                this.validateVideo();
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
        },

        async validateVideo() {
            await VideosService.validateVideo({
                Url: this.video.url,
                GameId: this.video.gameId,
                Combos: this.video.combos.map((combo) => {
                    return {
                        CharacterId: Array.isArray(combo.characterId)
                            ? combo.characterId
                            : [combo.characterId],
                        Inputs: combo.inputs,
                        Damage: combo.damage,
                        Hits: combo.hits,
                        StartTime: combo.startTime,
                        EndTime: combo.endTime,
                        Note: combo.note,
                    };
                }),
                VideoUrl: this.video.url,
                SubmittedBy: this.account.id,
                UpdatedBy: this.account.id,
                ContentType: 'Combo',
                ContentCreatorId: this.video.contentCreatorId || null,
                VideoType: this.video.type,
                Tags: this.video.tags,
                StartTime: this.video.startTime,
                EndTime: this.video.endTime,
            });

            this.$emit('closeModal');
        },

        importYoutube() {
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
        },

        importTwitter() {
            this.video.url = this.importVideoUrl.substring(
                this.importVideoUrl.indexOf('/status/') + 8,
                this.importVideoUrl.length + 1
            );

            this.video.type = 'twitter';
        },

        setGame(game) {
            this.video.gameId = game.id;
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

        updateCombo(combos) {
            this.video.combos = combos;
        },
    },
};
</script>

<style type="text/css">
.new-combo {
    text-align: left;
    margin: 0 auto;
    color: #fff;
}

.new-combo .players-container button,
.new-combo .players-container input,
.new-combo label,
.new-combo .or {
    display: block;
}

.new-combo .players-container,
.new-combo .game-container,
.new-combo .upload-video-container,
.new-combo .import-video-container,
.new-combo .or,
.new-combo .players-btn {
    margin-bottom: 20px;
}

.new-combo .submit-btn {
    margin-top: 30px;
}

.new-combo .players-container {
    position: relative;
}

.new-combo .players-container .close-btn {
    margin: 0 0 20px auto;
    position: absolute;
    min-width: 40px;
    top: 5px;
    right: 20px;
}

.new-combo .players-container {
    border: 1px solid #eee;
    text-align: center;
    padding: 10px 20px 20px;
}

.new-combo .players-container .multiselect {
    margin: 10px 0 0px;
}

.new-combo .players-container h2 {
    text-align: left;
    margin-bottom: 30px;
}

.new-combo .error-msg {
    color: red;
    font-weight: 300;
    font-style: italics;
    text-align: left;
}

.new-combo .v-label--active {
    transform: translateY(-18px) scale(0.75) translateX(-20px);
}

.new-combo .v-input input {
    margin: 5px 5px 5px;
    border: none;
}

.new-combo .combo-stats,
.new-combo .video-clip {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}

.new-combo .combo-stats,
.new-combo .inputs-container {
    padding: 0 2px;
}

.new-combo .inputs-container textarea {
    height: 75px;
    border: none;
}

.new-combo .input-container {
    padding: 0 5px;
}

.new-combo .input-container input {
    font-size: 12px;
}

.new-combo .inputs-container .v-input {
    padding-top: 0;
    margin-top: 0px;
}

.new-combo .inputs-container .v-input__slot {
    padding: 10px;
}

.new-combo .combo-title {
    margin: 20px 0 10px;
}

.new-combo .combo-container {
    border: 1px solid #eee;
    padding: 20px 10px;
}

.new-combo .character-container h3 {
    text-align: left;
}

.new-combo .character-container {
    border: 1px solid #eee;
    text-align: center;
    padding: 10px 20px 20px;
    margin-bottom: 10px;
}
</style>
