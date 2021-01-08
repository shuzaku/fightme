<template>
  <div class="videos-view" ref="videoViewRef">
    <div class="videos-container">
      <div 
        v-for="video in videos" :key="video.id" 
        :class="{selected: video.selected}" >
        <video-card 
        v-waypoint="{ active: true, callback: onWaypoint, options: intersectionOptions }"
        v-model="video.isPlaying"
        :id="video.id"
        :video="video" />
      </div>
    </div>
  </div>
</template>

<script>
import VideosService from '@/services/VideosService';
import VideoCard from '@/components/Videos/VideoCard';
import { eventbus } from '@/main'


export default {
  name: 'videos',

  components: {
    'video-card': VideoCard,
  },

  data () {
    return {
      videos: [],
      loading: true,
      query: null,
      intersectionOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 1,
      }
    }
  }, 

  computed: {
  },

  methods: {
    async getVideos() {
      const response = await VideosService.fetchVideos();
      this.hydrateVideos(response);
      this.playFirstVideo();
    },

    async queryVideos(query) {
      var searchQuery = null;
      if(query.queryName === 'Game') {
        searchQuery = [{
          queryName : 'Game.Title',
          queryValue : query.queryValue.GameTitle
        }]
      }
      if(query.queryName === 'Player') {
        searchQuery = [{
          queryName : 'Players.Player1.Name',
          queryValue : query.queryValue.PlayerName
        },{
          queryName : 'Players.Player2.Name',
          queryValue : query.queryValue.PlayerName
        }]
      }
      if(query.queryName === 'Character') {
        searchQuery = [{
          queryName : 'Players.Player1.Character.Name',
          queryValue : query.queryValue.Name
        },{
          queryName : 'Players.Player2.Character.Name',
          queryValue : query.queryValue.Name
        },{
          queryName : 'Combo.ComboCharacter.Name',
          queryValue : query.queryValue.Name
        }]
      }
      if(query.queryName === 'Video Type') {
        searchQuery = [{
          queryName : 'ContentType',
          queryValue : query.queryValue
        }]
      }
      const response = await VideosService.queryVideos(searchQuery);
      this.hydrateVideos(response);
      this.playFirstVideo();
    },

    playFirstVideo() {
      for(var i = 0; i < 3; i++){
        this.videos[i].inview = true;
      }
      this.videos[0].isPlaying = true;
      this.isLoading = false;
    },

    hydrateVideos(response){
      this.videos = response.data.videos.map(video => {
        return {
          id: video._id,
          contentType: video.ContentType,
          videoUrl: video.VideoUrl,
          videoType: video.VideoType,
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
                name: video.Players.Player1.Character.Name,
                imageUrl: video.Players.Player1.Character.ImageUrl,
              }
            },
            player2: {
              id: video.Players.Player2.Id,
              name: video.Players.Player2.Name,
              character: {
                name: video.Players.Player2.Character.Name,
                imageUrl: video.Players.Player2.Character.ImageUrl,
              }
            },
          } : null,
          inview: false,
          isPlaying: false
        }
      });
    },

    onWaypoint ({ el, going, direction }) {
        var objectId = el.id;
        var featuredVideo = this.videos.find(video => video.id == objectId);
        if (going === this.$waypointMap.GOING_IN && direction) {
          featuredVideo.inview = true;
          featuredVideo.isPlaying = true;
        }

        if (going === this.$waypointMap.GOING_OUT && direction) {
          featuredVideo.isPlaying = false;
        }
    }
  },

  mounted() {
    this.getVideos();
    eventbus.$on('query:update', (data) => { this.queryVideos(data) });
    eventbus.$on('newVideoPosted' , () => {this.getVideos()});
  },

  beforeDestroy() {
    eventbus.$off('query:update', (data) => { this.queryVideos(data) });
    eventbus.$off('newVideoPosted' , () => {this.getVideos()});
  }
}
</script>

<style>
  .videos-view {
    display: flex;
    align-items: flex-start;
    position: relative
  }

  .videos-view .videos-container {
    position: relative;
    padding: 0 40px;
  }

  .videos-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
  }
</style>