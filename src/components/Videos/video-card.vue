<template>
  <div class="video-card" ref="videoList"  >
      <div class="combo-card card" v-if="video.contentType === 'Combo'">
        <div class="video-container">
          <video 
            ref="videoRef"
            v-if="video.videoType === 'uploaded'"
            loop
            controls 
            muted >
            <source :src="video.videoUrl" type="video/mp4">
          </video>
        </div>
        <div class="card-label">{{video.contentType}}</div>
        <div class="character-bubble" :style="{ 'backgroundImage': `url('${video.combo.character.imageUrl}')` }" />
        <div class="heavy-weight character-name"><p>{{video.combo.character.name}}</p></div>
        <div class="combo-stats">
          <p v-if="video.combo.comboHits">{{video.combo.comboHits}} Hits</p>
          <p v-if="video.combo.comboDamage">{{video.combo.comboDamage}} Damage</p>
        </div>
        <div class="combo-input">
          <p class="inputs">{{video.combo.comboInput}}</p>
        </div>
        <div class="edit-btn-container">
          <v-btn 
            class="edit-btn"
            v-if="!video.isEditing"
            @click="video.isEditing = true">
            <v-icon dark>
              mdi-wrench
            </v-icon>
          </v-btn>
        </div>
        <video-edit
          v-if="video.isEditing"
          :video="video"
          @update="patchVideo()"
          @delete="deleteVideo()" />
      </div>
      <div class="match-card card" v-if="video.contentType === 'Match'">
        <youtube-media
          v-if="video.videoType === 'youtube'"
          ref="youtubeRef"
          @ready="ready"
          :video-id="video.url"
          :player-width='556'
          :player-height='313'
          :player-vars="{ rel: 0, start: video.startTime, end: video.endTime }"
          :mute="true" />
        <div class="card-label">{{video.contentType}}</div>
        <div class="character-bubble" :style="{ 'backgroundImage': `url('${video.match.player1.character.imageUrl}')` }" />
        <div class="character-bubble player2" :style="{ 'backgroundImage': `url('${video.match.player2.character.imageUrl}')` }" />
        <div class="characters" v-if="!video.isEditing">
          <div class="player1" >
            <div class="heavy-weight player-name" @click="queryPlayer(video.match.player1.id)"><p>{{video.match.player1.name}}</p></div>
            <div class="character-name" @click="queryCharacter(video.match.player1.character.id)"><p>{{video.match.player1.character.name}}</p></div>
          </div>
          <div class="versus heavy-weight">vs.</div>
          <div class="player2">
            <div class="heavy-weight player-name" @click="queryPlayer(video.match.player2.id)"><p>{{video.match.player2.name}}</p></div>
            <div class="character-name" @click="queryCharacter(video.match.player2.character.id)"><p>{{video.match.player2.character.name}}</p></div>
          </div>
        </div>
        <!-- <v-btn 
          v-if="!video.isEditing"
          @click="video.isEditing = true">
          <v-icon dark>
            mdi-wrench
          </v-icon>
        </v-btn>
        <video-edit
          v-if="video.isEditing"
          :video="video"
          @update="patchVideo()"
          @delete="deleteVideo()" /> -->
      </div>

  </div>
</template>

<script>
import VideoEdit from '@/components/videos/video-edit';
import VideosService from '@/services/videos-service';

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
      videoId: null,
      startTime : null
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
      if(this.video.isPlaying){
        this.player.playVideo();
      }
    },
    
    async deleteVideo() {
      await VideosService.deleteVideo(this.video.id);
      this.$emit('video:delete' , this.video);
    },

    queryPlayer(playerId) {
      this.$router.push(`/players/${playerId}`);
    },

    queryCharacter(characterId) {
      this.$router.push(`/characters/${characterId}`);
    },

    async patchVideo() {
      await VideosService.updateVideo({
        id: this.video.id,
        VideoUrl: this.video.videoUrl,
        VideoType: this.video.videoType,
        Match: {
          startTime: this.video.match.startTime,
          endTime: this.video.match.endTime,
          winnerId: this.video.match.winnerId,
        },
        Tournament: {
          tournamentId: this.video.tournament.id
        },
        Players: this.video.contentType === 'Match' ? {
          Player1: {
            Id: this.video.players.player1.id,
            CharacterId: this.video.players.player1.charcterId     
          },
          Player2: {
            Id: this.video.players.player2.id,
            CharacterId: this.video.players.player2.charcterId 
          }
        } : null,
        Game: {
          Id: this.video.game.id,
        },
        Tags: this.video.tags,
        //ComboId
        Combo: this.video.combo ? {
          ComboCharacterId: this.video.combo.characterId,
          ComboInput: this.video.combo.comboInput,
          ComboHits: this.video.combo.comboHits,
          ComboDamage: this.video.combo.comboDamage
        } : null
      });
      this.video.isEditing = false;
    }
  },

  mounted() {
      if(this.video.videoType === 'uploaded'){
        if (this.video.isPlaying){
          this.$refs.videoRef.play();
        }
      }
      else if(this.video.videoType === 'youtube'){
        if(this.video.isPlaying){
          this.player.playVideo();
        }
      }
  }
}
</script>

<style>
.video-card {
    margin: 60px 0;
}

.video-card .character-bubble {
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

.video-card .character-bubble.player2 {
  right: -25px;
  left: auto;
}

.video-card .combo-card,
.video-card .match-card {
  /* background-image: linear-gradient(#515b89, #171b33); */
  background: #515b89;
  border-radius: 15px;
  margin-bottom: 30px;
  position: relative;
  border: 2px solid #4a5689;
  cursor: pointer;
}
.video-card .card {
  width: 100%;
  max-width: 560px;
  box-shadow: 0px 0px 15px 0px rgb(0 0 0 / 54%);
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
  font-size: 14px;
  color: #1ab097;
  font-weight: 600;
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
  padding: 20px 20px 0;
  color: #fff;
  font-size: 20px;
}

.video-card .player-name{
  color: #fff;
  font-size: 20px;  
  padding: 0 20px;
} 

.video-card .match-card .character-name {
  padding-top: 0px;
  font-size: 13px;
}


.video-card .match-card .character-name p{
  font-size: 14px;
  color: #1ab097;
  font-weight: 600;
  margin-top: 5px;
}

.video-card .match-card .player2 .character-name p{
  text-align: right;
}

.video-card .combo-stats {
    padding: 5px 20px 5px;
}

.video-card .characters {
  padding: 5px 10px 5px;
}

.video-card .video-ghost {
  height: 313px;
  width: 556px;
}

.video-card .combo-input {
  padding: 0 20px;
  margin: 10px 0;
  font-style: italic;
}

.video-card .inputs {
    border-radius: 3px;
    padding: 10px;  
    background: rgba(255,255,255,.2);
    border: 1px solid #4a5689;
}

.video-card .card .edit-btn-container {
  padding: 10px;
}

.video-card .card .edit-btn-container button {
  padding: 20px 10px;
  background-color: #1ab097 !important;
  border-radius: 50%;
  min-width: 0px;
  color: #fff;
}

.video-card .video-container {
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
}


</style>