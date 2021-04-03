<template>
  <div class="post-video">
    <h1>Add Video</h1>
    <div class="video-step" v-show="currentStep==='Video'">
      <p v-show="showErrorMessage && !video.contentType" class="error-msg" >Please select content type</p>
      <multiselect 
        v-model="video.contentType" 
        :options="contentTypes" 
        :multiple="false" 
        :close-on-select="true" 
        :clear-on-select="false" 
        placeholder="Select Content Type">
        <template slot="selection" 
          slot-scope="{ values, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Content Type
          </span>
        </template>
      </multiselect>
      <!--- game --->
      <p v-show="showErrorMessage && !video.gameId" class="error-msg" >Please Game</p>
      <div class="game-container" >
        <game-search 
          v-model="video.gameId" 
          @update:game="setGame($event)"/>
      </div>
      <v-radio-group v-model="video.origin" :mandatory="false">
        <v-radio label="From the web" value="web"></v-radio>
        <v-radio label="From my computer" value="computer"></v-radio>
      </v-radio-group>
      <!--- video --->
      <div class="import-video-container" v-if="video.origin == 'web'">
        <v-text-field 
            id="import-video"
            type="text"
            placeholder="Video Url" 
            v-model="importVideoUrl"/>
        <v-btn  
          @click="isVideoClipped = !isVideoClipped"
          v-if="!isVideoClipped && video.type==='youtube'"
          class="players-btn"
          tile color="indigo">
          Clip Video
        </v-btn>
        <div class="video-clip-container" v-if="isVideoClipped">
          <div class="startTime">
            <v-text-field 
                type="Number"
                placeholder="Start Time" 
                v-model="video.startTime"/>
          </div>
          <div class="endTime">
            <v-text-field 
                type="Number"
                placeholder="End Time" 
                v-model="video.endTime"/>
          </div>
        </div>
      </div>
      <div class="upload-video-container" v-else>
          <upload-video 
            @upload:video="setUploadedVideo($event)"
            ref="videoUploader" />
      </div>
    </div>
    <div class="match-step" v-if="currentStep === 'Match'">
      <!--- tournament --->
      <v-checkbox
        v-model="isTournament"
        :label="`Tournament Match?`"
      ></v-checkbox>
      <tournament-search
        v-if="isTournament"
        v-model="video.match.tournamentId" />

      <!--- creator --->
      <div class="creator-container" >
          <creator-search 
            v-model="video.contentCreatorId" 
            @update:creator="setCreator($event)"/>
      </div>

      <!--- players --->
      <div class="players-container">
        <h2>Players</h2>
        <p v-show="showErrorMessage && !video.match.player1.id" class="error-msg" >Please select player 1</p>
        <player-search 
          v-model="video.match.player1.id" 
          :player=1
          @update:player="setPlayer1($event)" />
          <p v-show="showErrorMessage && !video.match.player1.characterId" class="error-msg" >Please select player 1's character</p>
        <character-search 
          v-if="video.gameId"
          v-model="video.match.player1.characterId"
          :gameId="video.gameId"
          :player=1 
          @update:character="setPlayer1Character($event)" />
        <strong> VS. </strong>
        <p v-show="showErrorMessage && !video.match.player2.id" class="error-msg" >Please select player 2</p>
        <player-search 
          v-model="video.match.player2.id" 
          :player=2
          @update:player="setPlayer2($event)" />
          <p v-show="showErrorMessage && !video.match.player2.characterId" class="error-msg" >Please select player 2's character</p>
        <character-search 
          v-if="video.gameId"
          v-model="video.match.player2.characterId"
          :gameId="video.gameId"
          :player=2
          @update:character="setPlayer2Character($event)" />
        <div class="winner" v-if="video.match.player1.id && video.match.player2.id">
          <multiselect 
            v-model="video.match.winner" 
            :options="players" 
            :multiple="false" 
            :close-on-select="true" 
            :clear-on-select="false" 
            @input="setWinner"
            placeholder="Match Winner"
            label="name" >
            <template slot="selection" 
              slot-scope="{ values, isOpen }">
              <span class="multiselect__single" 
                v-if="values.length &amp;&amp; !isOpen">
                Select Winner
              </span>
            </template>
          </multiselect>
          <select v-model="video.match.winner" >
            <option v-for="player in players" :key="player.id">
              {{player.name}}
            </option>
          </select>          
        </div>
      </div>
    </div>
    <div class="match-step" v-if="currentStep === 'Combo'">
      <div class="character-container" v-if="video.gameId">
          <character-search 
            v-model="combo.characterId"
            :gameId="video.gameId"
            @update:character="setComboCharacter($event)" />
      </div>
      <div class="inputs-container" >
          <v-textarea v-model="comboInputsRaw" placeholder="Combo Inputs"/>
      </div>
    </div>
    <v-btn class="video-btn" v-if="currentStep === 'Video'" rounded @click="nextStep()">Next</v-btn>
    <v-btn class="submit-btn" v-else rounded @click="setUpVideo()">Submit</v-btn>
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
  name: 'post-video',
  components:{
      'upload-video': UploadVideo,
      'player-search' : PlayerSearch,
      'creator-search' : CreatorSearch,
      'game-search': GameSearch,
      'character-search': CharacterSearch,
      'tournament-search': TournamentSearch,
  }, 
  provide() {
    return {
        'video': this.video,
    };
  },
  data () {
    return {
      winner: null,
      isVideoClipped: false,
      currentStep: 'Video',
      comboInputsRaw: '',
      combo: {
        inputs: [],
        characterId: ''
      },
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
          tournamentId: '',
        },
        tags: [],
      },
      isAddingPlayers: false,
      isImportingVideo: true,
      importVideoUrl: null,
      games: [],
      origin: "web",
      isTournament: false,
      contentTypes: ['Match' , 'Combo' , 'Analysis']
    }
  },

  computed: {
    timeStamp: function() {
      return moment().format()
    },

    players: function() {
      var players = [];
      players.push(this.video.match.player1);
      players.push(this.video.match.player2);
      return players;
    },

    isValidated: function() {
      var setMatchPlayers = this.video.match.player1.characterId && this.video.match.player2.characterId;
      var setMatchCharacters = this.video.match.player1.id && this.video.match.player2.id;
      var matchSettingsValidated = this.video.contentType === "Match" && setMatchPlayers  && setMatchCharacters;
      var comboSettingsValidated = this.video.contentType === "Combo" && this.video.comboId

      if (this.video.url && this.video.gameId) {
        return matchSettingsValidated || comboSettingsValidated;
      }
      else {
        return false
      }
    }
  },

  watch: {
    importVideoUrl() {
        if(this.importVideoUrl.includes('youtube')) {
        this.video.url = this.importVideoUrl.substring((this.importVideoUrl.indexOf("v=") + 2) , (this.importVideoUrl.indexOf("&ab_channel")));
        this.video.type = 'youtube'
      }    
    },

    comboInputsRaw() {
      this.combo.inputs = this.comboInputsRaw.split('>');
    }
  },

  methods: {
    nextStep(){
      if(this.video.gameId && this.video.url && this.video.contentType) {
        this.showErrorMessage = false;
        if(this.video.contentType === 'Combo'){
          this.currentStep = 'Combo'
        } 
        else if(this.video.contentType === 'Match'){
          this.currentStep = 'Match'
        }
      }
      else {
        this.showErrorMessage = true;
      }

    },

    setUploadedVideo(uploadedVideo) {
      this.video.url = null
      this.video.url = uploadedVideo
      this.video.type = 'uploaded'
      this.postVideo();
    },
    
    async setUpVideo() {
      if (this.video.contentType == 'Combo') {
        const response = await CombosService.addCombo({
          CharacterId: this.combo.characterId,
          Inputs: this.combo.inputs
        });
        this.video.comboId = response.data.id

        this.$refs.videoUploader.upload();
      } 
      else {
        this.postVideo();
      }
    },

    async postVideo() {
      if(this.isValidated){
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
          Player1Id:this.video.match.player1.id,
          Player1CharacterId: this.video.match.player1.characterId,
          Player2Id:this.video.match.player2.id,
          Player2CharacterId: this.video.match.player2.characterId,
          WinnerId: this.video.match.winner.id,
          // TournamentId: this.video.match.tournamentId,
          Tags: this.video.tags,
        });

        this.$emit('closeModal');
        eventbus.$emit('newVideoPosted');
      }
      else {
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
  
    setPlayer2Character(characterId) {
      this.video.match.player2.characterId = characterId;
    },

    setComboCharacter(characterId) {
      this.combo.characterId = characterId;
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
      this.video.tags = tags
    }
  }
}
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
</style>
