<template>
  <div class="video-card" ref="videoList"  >
      <div class="combo-card card" v-if="video.contentType === 'Combo'">
        <video 
          ref="videoRef"
          v-if="video.videoType === 'uploaded'"
          loop
          controls 
          muted >
          <source :src="video.videoUrl" type="video/mp4">
        </video>
        <div v-else class="video-ghost"/>
        <div class="card-label">{{video.contentType}}</div>
        <div class="character-container" :style="{ 'backgroundImage': `url('${video.combo.character.imageUrl}')` }" />
        <div class="heavy-weight character-name"><p>{{video.combo.character.name}}</p></div>
        <div class="combo-stats">
          <p>99 Hits</p>
          <p>999 Damage</p>
        </div>
        <v-btn 
          v-if="!video.isEditing"
          @click="video.isEditing = true">
          Edit
        </v-btn>
        <video-edit
          v-if="video.isEditing"
          :video="video"
          @update="patchVideo()" />
      </div>
      <div class="match-card card" v-if="video.contentType === 'Match'">
        <youtube-media
        v-if="video.videoType === 'youtube'"
        ref="youtubeRef"
        @ready="ready"
        :video-id="video.videoUrl"
        :player-width='556'
        :player-height='313'
        :player-vars="{ rel: 0 }"
        :mute="true" />
        <div class="card-label">{{video.contentType}}</div>
        <div class="character-container" :style="{ 'backgroundImage': `url('${video.players.player1.character.imageUrl}')` }" />
        <div class="character-container player2" :style="{ 'backgroundImage': `url('${video.players.player2.character.imageUrl}')` }" />
        <div class="characters" v-if="!video.isEditing">
          <div class="player1" >
            <div class="heavy-weight player-name"><p>{{video.players.player1.name}}</p></div>
            <div class="character-name"><p>{{video.players.player1.character.Name}}</p></div>
          </div>
          <div class="versus heavy-weight">vs.</div>
          <div class="player2">
            <div class="heavy-weight player-name"><p>{{video.players.player2.name}}</p></div>
            <div class="character-name"><p>{{video.players.player2.character.Name}}</p></div>
          </div>
        </div>
        <v-btn 
          v-if="!video.isEditing"
          @click="video.isEditing = true">
          Edit
        </v-btn>
        <video-edit
          v-if="video.isEditing"
          :video="video"
          @update="patchVideo()" />
      </div>

  </div>
</template>

<script>
import VideoEdit from '@/components/Videos/VideoEdit'
import VideosService from '@/services/VideosService';

export default {
  components: {
    'video-edit' : VideoEdit
  },
  name: 'video-card',

  props: {
    video: {
      type: Object,
    },
    value: {
      type: Boolean
    }
  },

  provide() {
    return {
        'video': this.video,
    };
  },

  data () {
    return {
    }
  },

  watch: {
    value: function() {
      if(this.video.videoType === 'uploaded'){
        if (this.video.isPlaying){
          this.$refs.videoRef.play();
        }
        else {
          this.$refs.videoRef.pause();
        }
      }
      else if(this.video.videoType === 'youtube'){
        if(this.video.isPlaying){
          this.player.playVideo();
        }
        else {
          this.player.pauseVideo();
        }
      }
    } 
  },

  methods: {
    ready (event) {
      this.player = event.target
    },

    async patchVideo() {
      await VideosService.updateVideo({
        id: this.video.id,
        VideoUrl: this.video.videoUrl,
        VideoType: this.video.videoType,
        Players: {
          Player1: {
            Id: this.video.players.player1.id,
            Name: this.video.players.player1.name,
            Character: {
              Name: this.video.players.player1.character.name,
              ImageUrl: this.video.players.player1.character.imageUrl
            }
          },
          Player2: {
            Id: this.video.players.player2.id,
            Name: this.video.players.player2.name,
            Character: {
              Name: this.video.players.player2.character.name,
              ImageUrl: this.video.players.player2.character.imageUrl
            }
          }
        },
        Game: {
          Id: this.video.game.id,
          Title: this.video.game.title
        },
        Tags: this.video.tags,
        Combo: this.combo ? {
          ComboCharacter: this.video.combo.comboCharacter,
          ComboInput: this.video.combo.comboInput
        } : null
      });
      this.video.isEditing = false;
    }
  }
}
</script>

<style>
.video-card {
    margin: 60px 0;
}

.video-card .character-container {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #1ab097 ;
  background-size: 150%;
  background-position: top center;
  position: absolute;
  top: -15px;
  left: -25px
}

.video-card .character-container.player2 {
  right: -25px;
  left: auto;
}

.video-card .combo-card,
.video-card .match-card {
  background: #fff;
  border-radius: 15px;
  margin-bottom: 30px;
  position: relative;
  border: 2px solid #fff;
  cursor: pointer;
}
.video-card .card {
  width: 100%;
  max-width: 560px;
}

.video-card .combo-card:hover,
.video-card .selected .card{
  border: 2px solid #1ab097 ;
}

.video-card .combo-card .combo-stats {
  display: flex;
  justify-content: space-between;
}

.video-card .combo-card .combo-stats p {
  font-size: 12px;
}

.video-card .match-card .player2 .player-name p {
  text-align: right;
}

.video-card .match-card .characters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-card .match-card .versus {
  font-size: 25px;
}

.video-card .card-label {
  position: absolute;
  width: 70px;
  border-radius: 30px;
  top: -15px;
  left: 50%;
  margin-left: -35px;
  background: green;
  text-align: center;
  padding: 5px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.video-card .match-card .card-label {
  background: blue;
}

.video-card video {
  width: 100%;
}

.video-card .character-name {
  padding: 5px 10px 0;
}
.video-card .combo-stats {
  padding: 0 10px 5px;
}

.video-card .characters {
  padding: 5px 10px 5px;
}

.video-card .video-ghost {
  height: 313px;
  width: 556px;
}
</style>