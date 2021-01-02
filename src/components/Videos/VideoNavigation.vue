<template>
  <div class="video-list">
    <div 
      v-for="(video, index) in videos" :key="video.id" 
      :class="{selected: video.selected}" 
      @click="emitNewVideo(index)"
      :id="video.id"
      v-waypoint="{ active: true, callback: onWaypoint, options: intersectionOptions }">
      <div class="combo-card card" v-if="video.contentType === 'Combo'">
        <div class="card-label">{{video.contentType}}</div>
        <div class="character-container" :style="{ 'backgroundImage': `url('${video.combo.character.imageUrl}')` }" />
        <div class="heavy-weight character-name"><p>{{video.combo.character.name}}</p></div>
        <div class="combo-stats">
          <div>99 Hits</div>
          <div>999 Damage</div>
        </div>
      </div>
      <div class="match-card card" v-if="video.contentType === 'Match'">
        <div class="card-label">{{video.contentType}}</div>
        <div class="character-container" :style="{ 'backgroundImage': `url('${video.players.player1.character.imageUrl}')` }" />
        <div class="character-container player2" :style="{ 'backgroundImage': `url('${video.players.player2.character.imageUrl}')` }" />
        <div class="characters">
          <div class="player1">
            <div class="heavy-weight player-name"><p>{{video.players.player1.name}}</p></div>
            <div class="character-name"><p>{{video.players.player1.character.Name}}</p></div>
          </div>
          <div class="versus heavy-weight">Vs.</div>
          <div class="player2">
            <div class="heavy-weight player-name"><p>{{video.players.player2.name}}</p></div>
            <div class="character-name"><p>{{video.players.player2.character.Name}}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VideosService from '@/services/VideosService';

export default {
  name: 'video-navigation',
  components: {
  },

  data () {
    return {
      isLoading: true,
      videos: [],
      videoSelectCounter: 0,
      scrollPos: 0,
      intersectionOptions: {
        root: null,
        rootMargin: null,
        threshold: 1.0  // [0.25, 0.75] if you want a 25% offset!
      },
    }
  }, 

  computed: {
    rootMargin: function() {
      return `0px 0px -${window.innerHeight - 132 + 'px'} 0px`;
    }
  },

  methods: {
    async getVideos () {
      const response = await VideosService.fetchVideos()
      this.videos = response.data.videos.map(video => {
        return {
          id: video._id,
          contentType: video.ContentType,
          videoUrl: video.VideoUrl,
          combo: video.ContentType === 'Combo' ? {
            character: {
              name: video.Combo.ComboCharacter.Name,
              imageUrl: video.Combo.ComboCharacter.ImageUrl,
            }
          } : null,
          players: video.ContentType === 'Match' ?{ 
            player1: {
              id: video.Players.Player1.Id,
              name: video.Players.Player1.Name,
              character: {
                name: video.Players.Player1.character.Name,
                imageUrl: video.Players.Player1.character.ImageUrl,
              }
            },
            player2: {
              id: video.Players.Player2.Id,
              name: video.Players.Player2.Name,
              character: {
                name: video.Players.Player2.character.Name,
                imageUrl: video.Players.Player2.character.ImageUrl,
              }
            },
          } : null,
          selected: false
        }
      });
      
      this.videos[0].selected = true;

      this.isLoading = false;      
    },

    resetSelected() {
      this.videos.forEach(video=>{
        video.selected = false;
      });
    },

    emitNewVideo(index) {
      this.$emit('video:update', this.videos[index]);
    },

    onWaypoint ({ el, going , direction }) {
      
      var objectId = el.id;
      var featuredVideo = this.videos.find(video => video.id == objectId);
      var index = this.videos.indexOf(featuredVideo);
      if (going === this.$waypointMap.GOING_IN && direction) {
        this.resetSelected();
        this.videos[index].selected = true;
      }
      console.log(this.videos.filter(video=>video.selected)[0].id);
    }
  },

  mounted() {
    this.getVideos();
    this.intersectionOptions.rootMargin = this.rootMargin;
    console.log(this.intersectionOptions)
    this.$emit('video:update', this.videos[0]);
  },

  beforeDestroy() {
  }
}
</script>

<style>
.video-list {
  padding-left: 50px;
  padding-top: 40px;
}

.character-container {
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

.character-container.player2 {
  right: -25px;
  left: auto;
}

.combo-card,
.match-card {
  background: #fff;
  border-radius: 15px;
  margin-bottom: 30px;
  padding: 15px 30px 10px;
  position: relative;
  border: 2px solid #fff;
  cursor: pointer;
}
.card {
  width: 100%;
  max-width: 250px;
}

.combo-card:hover,
.selected .card{
  border: 2px solid #1ab097 ;
}

.combo-card .combo-stats {
  display: flex;
  justify-content: space-between;
}

.combo-card .character-name p,
.match-card .player-name p{
  margin-bottom: 5px;
}

.match-card .player2 .player-name p {
  text-align: right;
}

.match-card .characters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-card .versus {
  font-size: 25px;
}

.card-label {
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

.match-card .card-label {
  background: blue;
}
</style>