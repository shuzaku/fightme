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
            <source :src="video.url" type="video/mp4">
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
          <p class="inputs">{{formattedInputs}}</p>
        </div>
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
        <div v-if="video.match.player1.character2" class="character-bubble character-2" :style="{ 'backgroundImage': `url('${video.match.player1.character2.imageUrl}')` }" />
        <div v-if="video.match.player1.character3" class="character-bubble character-3" :style="{ 'backgroundImage': `url('${video.match.player1.character3.imageUrl}')` }" />
        <div class="character-bubble player2" :style="{ 'backgroundImage': `url('${video.match.player2.character.imageUrl}')` }" />
        <div v-if="video.match.player2.character2" class="character-bubble player2 character-2" :style="{ 'backgroundImage': `url('${video.match.player2.character2.imageUrl}')` }" />
        <div v-if="video.match.player2.character3" class="character-bubble player2 character-3" :style="{ 'backgroundImage': `url('${video.match.player2.character3.imageUrl}')` }" />
        <div class="characters" v-if="!video.isEditing">
          <div class="player1" >
            <div class="heavy-weight player-name" @click="queryPlayer(video.match.player1.id)"><p>{{video.match.player1.name}}</p></div>
            <div class="character-name" @click="queryCharacter(video.match.player1.character.id)"><p>{{video.match.player1.character.name}}</p></div>
          </div>
          <div class="versus heavy-weight">vs</div>
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
// import VideoEdit from '@/components/videos/video-edit';
import VideosService from '@/services/videos-service';

export default {
  components: {
    // 'video-edit' : VideoEdit
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
  computed: {
    formattedInputs: function() {
      return this.video.combo.inputs.join(' > ');
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
  border: 2px solid #3EB489 ;
  background-size: 150%;
  background-position: top center;
  position: absolute;
  top: -15px;
  left: -25px;
  background-color: #e8e8e8;
}

.video-card .character-bubble.player2 {
  right: -25px;
  left: auto;
}

.video-card .combo-card,
.video-card .match-card {
  /* background-image: linear-gradient(#515b89, #171b33); */
  background: #444;
  border: 5px solid #444;
  border-radius: 15px;
  margin-bottom: 30px;
  position: relative;
  cursor: pointer;
}

.video-card .card {
  width: 100%;
  max-width: 570px;
  box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
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
  color: #FFFF00;
  text-transform: uppercase;
}

.video-card .card-label {
  position: absolute;
  width: 70px;
  border-radius: 30px;
  top: -15px;
  left: 50%;
  margin-left: -35px;
  background: #db8c10;
  text-align: center;
  padding: 5px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.video-card .match-card .card-label {
  background: #3c73a8;
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
  color: #3EB489;
  font-weight: 300;
  margin-top: 3px;
}

.video-card .match-card .player2 .character-name p{
  text-align: right;
}

.video-card .combo-stats {
    padding: 5px 20px 5px;
}

.video-card .characters {
  padding: 10px 10px 15px;
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

.video-card .character-2 {
  top: 40px;
}

.video-card .character-3 {
  top: 120px;
}
</style>