<template>
  <div class="post-video">
    <h1>Add Video</h1>
      <form v-on:submit.prevent="postVideo()">
        <!--- video --->
        <div class="import-video-container">
            <input 
                id="import-video"
                type="text"
                @change="scrubVideoUrl($event)"
                placeholder="Video Url" 
                v-model="videoUrl"/>
        </div>

        <strong class="or"> Or </strong>

        <div class="upload-video-container">
            <upload-video @upload:video="setUploadedVideo($event)"/>
        </div>
        {{videoUrl}}
        <!--- game --->
        <div class="game-container" >
            <label for="game">Game</label>
            <input 
                id="game"
                type="text"
                v-model="game" />
        </div>

        <!--- players --->
        <button  
            @click="isAddingPlayers = !isAddingPlayers"
            v-if="!isAddingPlayers"
            class="players-btn">
            Add Player(s)
        </button>
        <div class="players-container" v-if="isAddingPlayers">
            <button @click="isAddingPlayers = !isAddingPlayers">Close</button>
            <label for="player1">Player 1</label>
            <input 
                id="player1"
                type="text"
                v-model="player1" />
            <label for="player2">Player 2</label>
            <input 
                id="player2"
                type="text"
                v-model="player2" />
        </div>

        <div class="tag-containers">
            <label for="tags">Tags</label>
            <input type="textarea" v-model="rawTags"/> 
        </div>

        <button type="submit">Submit</button>
      </form>
  </div>
</template>

<script>
import UploadVideo from '@/components/Video/UploadVideo'
import VideosService from '@/services/VideosService'

import moment from 'moment'

export default {
  name: 'post-video',
  components:{
      'upload-video': UploadVideo
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
      videoUrl: null,
      videoPost: null,
      video: {}
    }
  },
  methods: {
    submitVideo() {
        this.parseTags();
    },
    
    parseTags(){
        this.tags = this.rawTags.split(",");
    },

    setUploadedVideo(uploadedVideo) {
      this.videoUrl = null
      this.videoUrl = uploadedVideo
      this.videoType = 'uploaded'
    },

    scrubVideoUrl(){
      if(this.videoUrl.includes('youtube')) {
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
    max-width: 300px;
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
</style>
