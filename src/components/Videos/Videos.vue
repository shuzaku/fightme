<template>
  <div class="videos-view">
    <video-navigation 
    @video:update="setVideo($event)"/>
    <div class="loading" v-if="loading">Loading...</div>
    <div v-else class="videos-container"> 
      <video controls width="100%">
        <source :src="video.videoUrl">
      </video>
    </div>
  </div>
</template>

<script>
import VideoNavigation from '@/components/Videos/VideoNavigation'
import { eventbus } from '@/main'


export default {
  name: 'videos',
  components: {
    'video-navigation': VideoNavigation,
  },

  data () {
    return {
      video: null,
      loading: true
    }
  }, 

  mounted () {
    
  },

  methods: {
  setVideo(video){
    this.loading = true;
    setTimeout(() => {     
      this.video = video;
      this.loading = false; 
    }, 600);
  }

    // filterVideos(data) {
    //   this.filteredVideos = [];
    //   if(!data) {
    //     this.filteredVideos = this.videos;
    //   }
    //   else if (data.type === 'character'){
    //     this.filteredVideos = this.videos.filter( video => video.Players.Player1.character === data.name || video.Players.Player2.character === data.name ||  video.Combo.ComboCharacter.Name === data.name);
    //   }
    //   else if (data.type === 'game'){
    //     this.filteredVideos = this.videos.filter( video => video.Game.title === data.name);
    //   }
    // }
  },

  created() {
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
  .videos-view .video-list{
    max-width: 350px;
    margin-right: 80px;
    width: 100%;
    overflow-y: scroll;
    max-height: 850px;
  }

  .videos-view {
    display: flex;
    align-items: flex-start;
  }

  .videos-view .videos-container {
    position: relative;
    padding: 40px;
    max-width: 1200px;
    width: 100%;
  }

  .videos-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
  }
</style>