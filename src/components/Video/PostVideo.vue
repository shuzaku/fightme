<template>
  <div class="post-video">
    <h1>Add Video</h1>
    <v-row>
      <v-col>
          <v-radio-group v-model="videoOrigin" :mandatory="false">
            <v-radio label="From the web" value="web"></v-radio>
            <v-radio label="From my computer" value="computer"></v-radio>
          </v-radio-group>
        <!--- video --->
        <div class="import-video-container" v-if="videoOrigin == 'web'">
            <v-text-field 
                id="import-video"
                type="text"
                @change="scrubVideoUrl($event)"
                placeholder="Video Url" 
                v-model="importVideoUrl"/>
        </div>
        <div class="upload-video-container" v-else>
            <upload-video @upload:video="setUploadedVideo($event)"/>
        </div>
        {{videoUrl}}
      </v-col>
    </v-row>
        <!--- game --->
        <div class="game-container" >
            <game-search 
              v-model="game" 
              @update:game="setGame($event)" />
        </div>
        <!--- players --->
        <v-btn  
            @click="isAddingPlayers = !isAddingPlayers"
            v-if="!isAddingPlayers"
            class="players-btn"
            tile color="indigo">
            Add Player(s)
        </v-btn>
        <div class="players-container" v-if="isAddingPlayers">
            <h2>Players</h2>
            <v-btn class="close-btn" rounded @click="isAddingPlayers = !isAddingPlayers" >X</v-btn>
            <player-search 
              v-model="player1" 
              @update:player="setPlayer1($event)" />
            <strong> VS. </strong>
            <player-search 
              v-model="player2"
              @update:player="setPlayer2($event)" />
        </div>
        <!--- tags --->
        <div class="tag-containers">
            <tag-search
            v-model="tags"
            @update:tags="setTags($event)" />
        </div>
        <v-btn class="submit-btn" rounded @click="postVideo()">Submit</v-btn>
  </div>
</template>

<script>
import moment from 'moment'
import UploadVideo from '@/components/Video/UploadVideo'
import VideosService from '@/services/VideosService'
import PlayerSearch from '@/components/Players/PlayerSearch'
import GameSearch from '@/components/Games/GameSearch'
import TagSearch from '@/components/Tags/TagSearch'

export default {
  name: 'post-video',
  components:{
      'upload-video': UploadVideo,
      'player-search' : PlayerSearch,
      'game-search': GameSearch,
      'tag-search': TagSearch
  },
  data () {
    return {
      isAddingPlayers: false,
      isImportingVideo: true,
      game: null,
      player1: null,
      player2: null,
      rawTags: null,
      tags: [],
      importVideoUrl: null,
      videoUrl: null,
      videoPost: null,
      video: {},
      players: [],
      games: [],
      videoOrigin: true
    }
  },
  methods: {
    setUploadedVideo(uploadedVideo) {
      this.videoUrl = null
      this.videoUrl = uploadedVideo
      this.videoType = 'uploaded'
    },

    scrubVideoUrl(){
      if(this.importVideoUrl.includes('youtube')) {
        this.videoUrl = this.videoUrl.substr((this.videoUrl.indexOf("v=") + 2) , this.videoUrl.length);
        this.videoType = 'youtube'
      }
    },

    async postVideo() {
      await VideosService.addVideo({
        VideoUrl: this.videoUrl,
        VideoType: this.videoType,
        Players: {
          Player1: this.player1,
          Player2: this.player2
        },
        Game: this.game,
        isInView: false
      });
      this.$router.push({ name: 'Videos' })

    },

    setPlayer1(player) {
      this.player1 = player
    },

    setPlayer2(player) {
      this.player2 = player
    },

    setGame(game) {
      this.game = game
    },

    setTags(tags) {
      this.tags = tags
    }
  },
  computed: {
    timeStamp: function() {
      return moment().format()
    }
  }
}
</script>

<style type="text/css">
.post-video {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
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
