<template>
  <div class="videos-view">
    <div class="loading" v-if="isLoading" />
    <div class="videos-container" v-else>
    <div class="left-panel">
      <div class="character-1" :style="{ background: 'url(' + player1.ImageUrl + ') no-repeat top center/cover' , 'background-position' : '50%' , 'background-size' : '100%' }" style="background-size: cover" v-if="player1"></div>
      <div class="character-name"> <div class="inner-marquee"><span>{{player1.Name}} • {{player1.Name}}  • {{player1.Name}} •</span></div></div>
    </div>
    <div class="right-panel" v-if="player2">
      <div class="character-2" :style="{ background: 'url(' + player2.ImageUrl + ') no-repeat top center/cover' , 'background-position' : '50%' , 'background-size' : '100%' }" style="background-size: cover" v-if="player2"></div>
      <div class="character-name"> <div class="inner-marquee"><span>{{player2.Name}} • {{player2.Name}}  • {{player2.Name}} •</span></div></div>
    </div>
    <div v-if="filteredVideos" class="card-containers" >
        <div 
          v-for="video in filteredVideos" 
          :key="video._id" 
          class="video-card"
          v-waypoint="{ active: true, callback: onWaypoint, options: intersectionOptions }"
          :id="video._id">
          <div class="combo-banner" v-if="video.ContentType === 'Combo' "> Combo Video </div>
          <div class="combo-banner" v-else> Match Video </div>
          <div class="video-container" v-if="video.IsInView">
            <video 
              :src="video.VideoUrl"
              v-if="video.VideoType === 'uploaded'"
              v-waypoint="{ active: true, callback: playVideo, options: videoPlaybackOptions }"
              loop
              muted
              controls />
            <iframe 
              v-else
              :src="`https://www.youtube.com/embed/${video.VideoUrl}`"
              frameborder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
          <div class="input-container" v-if="video.ContentType == 'Combo'"> 
            <h4>Inputs:</h4>
            <p>{{video.Combo.ComboInput}}</p>
          </div>
          <div class="location-container" v-if="video.ContentType !== 'Combo'"> 
            Online Tournament
          </div>
          <div class="negative-space" v-if="video.ContentType == 'Combo'">
          </div>
        </div>
    </div>
    <div v-else>
      There are no videos.. Lets add one now <br /><br />
    </div>
    <!-- <infinite-loading @infinite="infiniteHandler"></infinite-loading> -->
    </div>
  </div>
</template>

<script>
import VideosService from '@/services/VideosService'
import { eventbus } from '@/main'
// import InfiniteLoading from 'vue-infinite-loading';


export default {
  name: 'videos',
  components: {
    // InfiniteLoading
  },

  data () {
    return {
      isLoading: true,
      filteredVideos: [],
      page: 1,
      player1: {
        ImageUrl: '',
        Name: ''
      },
      player2: {
        ImageUrl: '',
        Name: ''
      },
      game: null,
      videos: [],
      intersectionOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 1 // [0.25, 0.75] if you want a 25% offset!
      },
      videoPlaybackOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 1.0 // [0.25, 0.75] if you want a 25% offset!
      },
    }
  }, 

  mounted () {
    
  },

  methods: {
    async getVideos () {
      const response = await VideosService.fetchVideos()
      this.videos = response.data.videos;
      this.filteredVideos = this.videos;
      if (this.filteredVideos[0].ContentType === 'Combo') {
        this.player1 = this.filteredVideos[0].Combo.ComboCharacter;
      }
      else {
        this.player1 = this.filteredVideos[0].Players.Player1.character;
        this.player2 = this.filteredVideos[0].Players.Player2.character;
      }
      
      this.game = this.filteredVideos[0].Game.title
      
      for ( var i = 0 ; i < 2; i++ ){
        this.filteredVideos[i].IsInView = true;
      }

      this.isLoading = false;      
    },

    // async infiniteHandler($state) {
    //   const response = await VideosService.fetchVideos()
    //   this.videos = response.data.videos
    //   if (response.data.videos.length) {
    //     this.page += 1;
    //     this.videos.push(...response.data.videos);
    //     $state.loaded();
    //   } else {
    //     $state.complete();
    //   }
    // },

    onWaypoint ({ el, going }) {
      var objectId = el.id;
      var featuredVideo = this.videos.find(video => video._id == objectId);
      var index = this.videos.indexOf(featuredVideo);

      if (going === this.$waypointMap.GOING_IN) {
        this.videos[index].IsInView = true;

        if (this.videos[index].ContentType === "Combo" ) {
            this.player1 = this.videos[index].Combo.ComboCharacter;
            this.player2 = null;
        }
        else if (this.videos[index].ContentType === "Match") {
          if(this.player1 !== this.videos[index].Players.Player1.character || this.player2 !== this.videos[index].Players.Player2.character)
            this.player1 = this.videos[index].Players.Player1.character;
            this.player2 = this.videos[index].Players.Player2.character;
        }

        if(this.game !==  this.videos[index].Game.title) {
          this.game = this.videos[index].Game.title;
        }

      }
    },

    playVideo ({ el, going }) {
      var video = el;
        if (going === this.$waypointMap.GOING_IN) {
          video.play();
        }

        if (going === this.$waypointMap.GOING_OUT) {
          video.pause();
        }      
    },

    filterVideos(data) {
      this.filteredVideos = [];
      if(!data) {
        this.filteredVideos = this.videos;
      }
      else if (data.type === 'character'){
        this.filteredVideos = this.videos.filter( video => video.Players.Player1.character === data.name || video.Players.Player2.character === data.name ||  video.Combo.ComboCharacter.Name === data.name);
      }
      else if (data.type === 'game'){
        this.filteredVideos = this.videos.filter( video => video.Game.title === data.name);
      }
    }
  },

  created() {
    this.getVideos();
    eventbus.$on('search:update', (data) => { this.filterVideos(data) });
    eventbus.$on('newVideoPosted' , () => {this.getVideos()});
  },

  beforeDestroy() {
    eventbus.$off('search:update', (data) => { this.filterVideos(data) });
    eventbus.$off('newVideoPosted' , () => {this.getVideos()});
  }
}
</script>

<style>
  .videos-view {
    margin: 0 auto;
    padding: 60px 40px;
    max-width: 700px;
  }

  .videos-view video,
  .videos-view iframe{
    height: auto;
    width: 100%;
    min-height: 349px;
  }

  .videos-view .video-card {
    text-align: center;
    margin-bottom: 60px;
    background: #2b2a4a;
    border-radius: 10px;
    overflow: hidden;
    color: #fff;
  }

  .videos-view .video-container {
    max-width: 100%;
  }

  .videos-view .combo-character-container p {
    font-size: 30px;
    color: #fff;
    display: block;
    background: red;
    font-weight:600;
    padding: 10px;
    width: 100%;
  }

  .videos-view .combo-banner {
    background: #1ab097;
    color: #fff;
    padding: 8px;
  }

  .videos-view .input-container {
    padding: 20px;
  }

  .videos-view .input-container h4 {
    margin-bottom: 8px;
  }

  .videos-view .left-panel {
    width: 50vw;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;     
    z-index: 10;
  }

  .videos-view .right-panel {
    width: 50vw;
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;     
    z-index: 10;
  }

  .videos-view .character-1,
  .videos-view .character-2 {
    width: 100%;
    height: 100%; 
    background-position: center center;
    opacity: .5;
  }

  .videos-view .card-containers {
    z-index: 10;
    position: relative;
    padding: 20px;
    background: #0f102e;
  }

  .videos-view .left-panel .character-name {
  position: absolute;
    bottom: 15%;
    width: 80%;
    /* height: 20%; */
    font-size: 90px;
    font-weight: 900;
    background: #000;
    padding: 2%;
    color: #fff;
    text-transform: uppercase;
    text-align: center;
    -webkit-transform: skew(10deg, -10deg);
    transform: skew(10deg, -10deg);
    white-space: nowrap;
    overflow: hidden;
    --offset: 20vw;
    --move-initial: calc(-25% + var(--offset));
    --move-final: calc(-50% + var(--offset));
  }

  .videos-view .right-panel .character-name {
    position: absolute;
    bottom: 13%;
    right: -3%;
    width: 80%;
    /* height: 20%; */
    font-size: 90px;
    font-weight: 900;
    background: #000;
    padding: 2%;
    color: #fff;
    text-transform: uppercase;
    text-align: center;
    -webkit-transform: skew(10deg, -10deg);
    transform: skew(10deg, 10deg);
    white-space: nowrap;
    overflow: hidden;
    --offset: 20vw;
    --move-initial: calc(-50% + var(--offset));
    --move-final: calc(-25% + var(--offset));
  }


  .videos-view .inner-marquee {
    width: fit-content;
    display: flex;
    position: relative;
    transform: translate3d(var(--move-initial), 0, 0);
    animation: marquee 10s linear infinite;
  }

  .videos-view .location-container {
    padding: 20px;
    background: #3891cd;
  }
  

@keyframes marquee {
    0% {
        transform: translate3d(var(--move-initial), 0, 0);
    }

    100% {
        transform: translate3d(var(--move-final), 0, 0);
    }
}

@keyframes reverseMarquee {
    0% {
        transform: translate3d(var(--move-initial), 0, 0);
    }

    100% {
        transform: translate3d(var(--move-final), 0, 0);
    }
}
</style>