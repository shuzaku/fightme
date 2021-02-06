<template>
  <div class="post-video">
    <h1>Add Video</h1>
    <v-row>
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
    </v-row>
    <v-row>
      <v-col>
        <v-radio-group v-model="videoOrigin" :mandatory="false">
          <v-radio label="From the web" value="web"></v-radio>
          <v-radio label="From my computer" value="computer"></v-radio>
        <!--- video --->
        <div class="import-video-container" v-if="videoOrigin == 'web'">
          <v-text-field 
              id="import-video"
              type="text"
              @change="scrubVideoUrl($event)"
              placeholder="Video Url" 
              v-model="importVideoUrl"/>
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
      v-model="video.isTournament"
      :label="`Tournament Match?`"
    ></v-checkbox>
    <tournament-search
      v-if="video.isTournament"
      v-model="video.tournament" 
      @update:tournament="setTournament($event)" />

    <!--- creator --->
    <div class="creator-container" >
        <creator-search 
          v-model="video.contentCreator" 
          @update:creator="setCreator($event)" />
    </div>

    <!--- game --->
    <div class="game-container" >
        <game-search 
          v-model="video.game.title" 
          @update:game="setGame($event)" />
    </div>

    <!--- players --->
    <v-btn  
        @click="isAddingPlayers = !isAddingPlayers"
        v-if="!isAddingPlayers && video.contentType == 'Match'"
        class="players-btn"
        tile color="indigo">
        Add Player(s)
    </v-btn>
    <div class="players-container" v-if="isAddingPlayers && video.contentType == 'Match'">
        <h2>Players</h2>
        <v-btn class="close-btn" rounded @click="isAddingPlayers = !isAddingPlayers" >X</v-btn>
        <player-search 
          v-model="video.players.player1" 
          :player=1
          @update:player="setPlayer1($event)" />
        <character-search 
          v-model="video.players.player1.character"
          v-if="video.game.title"
          :game="video.game"
          :player=1 
          @update:character="setPlayer1Character($event)" />
        <strong> VS. </strong>
        <player-search 
          v-model="video.players.player2"
          :player=2
          @update:player="setPlayer2($event)" />
        <character-search 
          v-if="video.game.title"
          v-model="video.players.player2.character"
          :game="video.game"
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
        id: null,
        contentType: null,
        contentCreator: {
          name: null,
          logo: null,
          youtubeUrl: null,
        },
        videoUrl: null,
        startTime: null,
        endTime: null,
        videoType: null,
        isTournament: false,
        tournament: {
          name: null,
          tournamentImgUrl: null
        },
        game: {
          id: null,
          title: null,
          characters: null
        },
        combo: {
          character: {
            name: null,
            imageUrl: null,
          }
        },
        players: { 
          player1: {
            id: null,
            name: null,
            character: {
              name: null,
              imageUrl: null,
            },
            isWinner: false
          },
          player2: {
            id: null,
            name: null,
            character: {
              name: null,
              imageUrl: null,
            },
            isWinner: null
          },
        },
        tags: null
      },
      isAddingPlayers: false,
      isImportingVideo: true,
      importVideoUrl: null,
      games: [],
      videoOrigin: "web",
      contentTypes: ['Match' , 'Combo' , 'Analysis']
    }
  },

  computed: {
    timeStamp: function() {
      return moment().format()
    },

    players: function() {
      var players = [];
      players.push(this.video.players.player1, this.video.players.player2);
      return players
    }
  },

  watch: {
    winner: function() {
      if(this.winner === this.video.players.player1.name) {
        this.video.players.player1.isWinner = true;
        this.video.players.player2.isWinner = false;
      }
      else if(this.winner === this.video.players.player2.name) {
        this.video.players.player1.isWinner = false;
        this.video.players.player2.isWinner = true;       
      }
    }
  },

  methods: {
    setUploadedVideo(uploadedVideo) {
      this.$refs.videoUploader.upload();
      this.video.url = null
      this.video.url = uploadedVideo
      this.video.videoType = 'uploaded'
      this.postVideo();
    },

    scrubVideoUrl(){
      if(this.importVideoUrl.includes('youtube')) {
        this.video.url = this.importVideoUrl.substr((this.importVideoUrl.indexOf("v=") + 2) , this.importVideoUrl.length);
        this.videoType = 'youtube'
      }
    },

    setUpVideo() {
      if (this.video.contentType == 'Combo') {
        this.$refs.videoUploader.upload()
      } 
      else {
        this.postVideo();
      }
    },

    async postVideo() {
      await VideosService.addVideo({
        VideoUrl: this.video.url,
        VideoType: this.video.videoType,
        Players: {
          Player1: {
            Id: this.video.player1.id,
            Name: this.video.player1.name,
            Character: this.video.player1.character
          },
          Player2: {
            Id: this.video.player2.id,
            Name: this.video.player2.name,
            Character: this.video.player2.character
          }
        },
        Game: {
          Id: this.video.game.id,
          Title: this.video.game.title
        },
        Tags: this.video.tags,
        ContentType: this.video.contentType,
        ContentCreator: this.video.contentCreator,
        Combo: {
          ComboCharacter: this.video.combo.comboCharacter,
          ComboInput: this.video.combo.comboInput
        },
        Tournament: {
          Name: this.video.tournament.name,
          TournamentImgUrl: this.video.tournament.tournamentImgUrl
        },
        StartTime: this.video.startTime,
        EndTime: this.video.endTime
      });

      this.$emit('closeModal');
      eventbus.$emit('newVideoPosted');
    },

    setPlayer1(player) {
      this.video.player1.id = player._id
      this.video.player1.name = player.PlayerName
    },

    setPlayer2(player) {
      this.video.player2.id = player._id
      this.video.player2.name = player.PlayerName
    },

    setPlayer1Character(character) {
      this.video.player1.character = character
    },
  
    setPlayer2Character(character) {
      this.video.player2.character = character
    },

    setComboCharacter(character) {
      this.video.combo.comboCharacter = character
    },

    setGame(game) {
      this.video.game.id = game._id
      this.video.game.title = game.GameTitle
      this.video.game.characters = game.Characters
    },

    setCreator(creator) {
      this.video.contentCreator = creator;
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
