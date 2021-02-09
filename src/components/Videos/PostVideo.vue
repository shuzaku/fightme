<template>
  <div class="post-video">
    <h1>Add Video</h1>
    <v-row>
      <multiselect 
        v-model="video.type" 
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
    </v-row>
    <v-row>
      <v-col>
        <v-radio-group v-model="video.origin" :mandatory="false">
          <v-radio label="From the web" value="web"></v-radio>
          <v-radio label="From my computer" value="computer"></v-radio>
        </v-radio-group>
        <!--- video --->
        <div class="import-video-container" v-if="video.origin == 'web'">
          <v-text-field 
              id="import-video"
              type="text"
              @change="scrubVideoUrl($event)"
              placeholder="Video Url" 
              v-model="video.url"/>
          <div class="startTime">

          </div>
          <div class="endTime">
            
          </div>
        </div>
        <div class="upload-video-container" v-else>
            <upload-video 
              @upload:video="setUploadedVideo($event)"
              ref="videoUploader" />
        </div>
      </v-col>
    </v-row>

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

    <!--- game --->
    <div class="game-container" >
        <game-search 
          v-model="video.gameId" 
          @update:game="setGame($event)"/>
    </div>

    <!--- players --->
    <v-btn  
        @click="isAddingPlayers = !isAddingPlayers"
        v-if="!isAddingPlayers && video.type == 'Match'"
        class="players-btn"
        tile color="indigo">
        Add Player(s)
    </v-btn>
    <div class="players-container" v-if="isAddingPlayers && video.type == 'Match'">
        <h2>Players</h2>
        <v-btn class="close-btn" rounded @click="isAddingPlayers = !isAddingPlayers" >X</v-btn>
        <player-search 
          v-model="video.match.player1.id" 
          :player=1
          @update:player="setPlayer1($event)" />
        <character-search 
          v-model="video.match.player1.characterId"
          v-if="video.gameId"
          :game="video.gameId"
          :player=1 
          @update:character="setPlayer1Character($event)" />
        <strong> VS. </strong>
        <player-search 
          v-model="video.match.player2.id" 
          :player=2
          @update:player="setPlayer2($event)" />
        <character-search 
          v-if="video.gameId"
          v-model="video.match.player2.characterId"
          :game="video.gameId"
          :player=2 />
        <select v-model="winner">
          <option v-for="player in players" :key="player.id">
            {{player.name}}
          </option>
        </select>
    </div>
    <div class="character-container" v-if="video.contentType == 'Combo' && video.game.title">
        <character-search 
          v-if="video.game.title"
          v-model="video.combo.comboCharacter"
          :game="video.game" />
    </div>
    <div class="inputs-container" v-if="video.contentType == 'Combo' && video.combo.comboCharacter">
        <v-textarea v-model="video.combo.comboInput" placeholder="Combo Inputs"/>
    </div>

    <!--- tags --->
    <div class="tag-containers">
      <tag-search
        v-model="video.tags"
        :taggable = true
        @update:tags="setTags($event)" />
    </div>
    <v-btn class="submit-btn" rounded @click="setUpVideo()">Submit</v-btn>
  </div>
</template>

<script>
import moment from 'moment'
import UploadVideo from '@/components/Videos/UploadVideo'
import VideosService from '@/services/VideosService'
import PlayerSearch from '@/components/Players/PlayerSearch'
import CharacterSearch from '@/components/Games/CharacterSearch'
import GameSearch from '@/components/Games/GameSearch'
import TagSearch from '@/components/Tags/TagSearch'
import CreatorSearch from '@/components/ContentCreator/CreatorSearch'
import TournamentSearch from '@/components/Tournament/TournamentSearch'
import { eventbus } from '@/main'

export default {
  name: 'post-video',
  components:{
      'upload-video': UploadVideo,
      'player-search' : PlayerSearch,
      'creator-search' : CreatorSearch,
      'game-search': GameSearch,
      'tag-search': TagSearch,
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
        combo: {
          characterId: '',
          input: '',
          damage: '',
          hits: ''
        },
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
          winner: '',
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
    }
  },

  watch: {
  },

  methods: {
    setUploadedVideo(uploadedVideo) {
      this.video.url = null
      this.video.url = uploadedVideo
      this.video.type = 'uploaded'
      this.postVideo();
    },

    scrubVideoUrl(){
      if(this.importVideoUrl.includes('youtube')) {
        this.video.url = this.importVideoUrl.substr((this.importVideoUrl.indexOf("v=") + 2) , this.importVideoUrl.length);
        this.video.type = 'youtube'
      }
    },

    setUpVideo() {
      if (this.video.type == 'Combo') {
        this.$refs.videoUploader.upload()
      } 
      else {
        this.postVideo();
      }
    },

    async postVideo() {
      await VideosService.addVideo({
        Type: this.video.type,
        ContentCreatorId: this.video.contentCreatorId,
        VideoType: this.video.type,
        VideoUrl: this.video.url,
        StartTime: this.video.startTime,
        EndTime: this.video.endTime,
        GameId: this.video.gameId,
        ComboId: {
          CharacterId: this.combo.characterId,
          Input: this.combo.input,
          Damage: this.combo.damage,
          Hits: this.combo.hits
        },
        Match: {
          Player1: {
            Id: this.video.match.player1.id,
            CharacterId: this.video.player1.characterId
          },
          Player2: {
            Id: this.video.player2.id,
            CharacterId: this.video.player2.characterId
          },
          Winner: this.video.winner,
          TournamentId: this.video.tournament.id,
        },
        Tags: this.video.tags,
      });

      this.$emit('closeModal');
      eventbus.$emit('newVideoPosted');
    },

    setPlayer1(playerId) {
      this.video.match.player1.id = playerId;
    },

    setPlayer2(playerId) {
      this.video.match.player2.id = playerId;
    },

    setPlayer1Character(character) {
      this.video.match.player1.characterId = character._id
    },
  
    setPlayer2Character(character) {
      this.video.match.player2.characterId = character._id
    },

    setComboCharacter(character) {
      this.video.combo.characterId = character._id
    },

    setGame(gameId) {
      this.video.gameId = gameId
    },

    setTournament(tournament) {
      this.video.match.tournamentId = tournament._id
    },

    setCreator(creatorId) {
      this.video.contentCreatorId = creatorId;
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
  margin: 20px 0;
}

.post-video .players-container h2 {
  text-align: left;
}
</style>
