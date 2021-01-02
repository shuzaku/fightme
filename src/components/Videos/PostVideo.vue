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
            <upload-video 
            @upload:video="setUploadedVideo($event)"
            ref="videoUploader" />
        </div>
      </v-col>
    </v-row>
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
              v-model="video.player1.name" 
              @update:player="setPlayer1($event)" />
            <character-search 
              v-model="video.player1.character"
              v-if="video.game.title"
              :characters="video.game.characters" 
              @update:character="setPlayer1Character($event)" />
            <strong> VS. </strong>
            <player-search 
              v-model="video.player2.name"
              @update:player="setPlayer2($event)" />
            <character-search 
              v-if="video.game.title"
              v-model="video.player2.character"
              :characters="video.game.characters" 
              @update:character="setPlayer2Character($event)" />
        </div>
        <div class="character-container" v-if="video.contentType == 'Combo' && video.game.title">
            <character-search 
              v-if="video.game.title"
              v-model="video.combo.comboCharacter"
              :characters="video.game.characters" 
              @update:character="setComboCharacter($event)" />
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
import { eventbus } from '@/main'

export default {
  name: 'post-video',
  components:{
      'upload-video': UploadVideo,
      'player-search' : PlayerSearch,
      'game-search': GameSearch,
      'tag-search': TagSearch,
      'character-search': CharacterSearch
  },
  data () {
    return {
      video: {
        player1: {
          id: null,
          name: null,
          character: null,
        },
        player2: {
          id: null,
          name: null,
          character: null,
        },
        game: {
          id: null,
          title: null,
          characters: [],
        },
        url: null,
        videoType: null,
        tags: [],
        contentType: null,
        combo: {
          comboCharacter: null,
          comboInput: null
        }

      },

      isAddingPlayers: false,
      isImportingVideo: true,
      importVideoUrl: null,
      games: [],
      videoOrigin: "web",
      contentTypes: ['Match' , 'Combo' , 'Analysis']
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
        Combo: {
          ComboCharacter: this.video.combo.comboCharacter,
          ComboInput: this.video.combo.comboInput
        },
        IsInView: false
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

    setTags(tags) {
      this.video.tags = tags
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
