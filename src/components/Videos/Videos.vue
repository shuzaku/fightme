<template>
  <div class="videos-view" ref="videoViewRef">
    <div class="videos-container" v-if="videos.length > 0">
      <div 
        v-for="video in videos" :key="video.id" 
        :class="{selected: video.selected}" >
        <video-card 
          v-waypoint="{ active: true, callback: onWaypoint, options: intersectionOptions }"
          v-model="video.isPlaying"
          @video:delete="spliceVideo($event)"
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
      savedQuery: null,
      intersectionOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 1,
      }
    }
  }, 

  computed: {
    skip: function() {
      return this.videos.length;
    }
  },

  methods: {
    async getVideos() {
      const response = await VideosService.fetchVideos(this.skip);
      this.hydrateVideos(response);
      this.playFirstVideo();
    },

    async queryVideos(query) {
      var searchQuery = null;
      if(query != this.savedQuery) {
        
        this.savedQuery = query;
      }
      
      if(query){
        if(query.queryName === 'Game') {
          searchQuery = [{
            queryName : 'Game.Title',
            queryValue : query.queryValue.title
          }]
        }
        if(query.queryName === 'Player') {
          searchQuery = [{
            queryName : 'Players.Player1.Name',
            queryValue : query.queryValue.name
          },{
            queryName : 'Players.Player2.Name',
            queryValue : query.queryValue.name
          }]
        }
        if(query.queryName === 'Character') {
          searchQuery = [{
            queryName : 'Players.Player1.Character.Name',
            queryValue : query.queryValue.name
          },{
            queryName : 'Players.Player2.Character.Name',
            queryValue : query.queryValue.name
          },{
            queryName : 'Combo.ComboCharacter.Name',
            queryValue : query.queryValue.name
          }]
        }
        if(query.queryName === 'Video Type') {
          searchQuery = [{
            queryName : 'ContentType',
            queryValue : query.queryValue
          }]
        }
      }

      var queryParameter = {
        skip: this.skip,
        searchQuery: searchQuery
      }
      const response = await VideosService.queryVideos(queryParameter);
      this.videos = [];
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
       response.data.videos.forEach(video => {
        this.videos.push({
          id: video._id,
          contentType: video.ContentType,
          videoUrl: video.VideoUrl,
          videoType: video.VideoType,
          game: {
            id: video.Game.Id,
          },
          combo: video.Combo ? {
            character: {
              name: video.Combo.ComboCharacter.Name,
              imageUrl: video.Combo.ComboCharacter.ImageUrl,
            },
            comboDamage: video.Combo.ComboDamage || null,
            comboHits: video.Combo.ComboHits || null,
            comboInput: video.Combo.ComboInput
          } : null,
          players: video.ContentType === 'Match' ? { 
            player1: {
              id: video.Players.Player1.Id,
              character: {
                name: video.Players.Player1.Character.Name,
                imageUrl: video.Players.Player1.Character.ImageUrl,
              }
            },
            player2: {
              id: video.Players.Player2.Id,
              character: {
                name: video.Players.Player2.Character.Name,
                imageUrl: video.Players.Player2.Character.ImageUrl,
              }
            },
          } : null,
          tags: video.Tags.map(tag => {
            return {
              id:tag._id,
              name: tag.TagName
            }
          }),
          inview: false,
          isPlaying: false,
          isEditing: false
        })
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
    },

    handleScroll() {
      var bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
      if (bottomOfWindow) {
        this.queryVideos();
      }
    },

    spliceVideo(video) {
      this.videos.splice(this.videos.indexOf(video),1);
    }
  },

  mounted() {
    this.queryVideos();
    window.addEventListener('scroll', this.handleScroll);
    eventbus.$on('query:update', (data) => { this.queryVideos(data) });
    eventbus.$on('newVideoPosted' , () => {this.getVideos()});
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    eventbus.$off('query:update', (data) => { this.queryVideos(data) });
    eventbus.$off('newVideoPosted' , () => {this.getVideos()});
  }
}
</script>

<style>
  .videos-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    overflow: auto;
    justify-content: space-around;
    padding-top: 30px;
    height: 100%;
    overflow: auto;
  }

  .videos-view::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
  }

  .videos-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
  }

  .videos-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.2);
    background-color: #515b89;
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