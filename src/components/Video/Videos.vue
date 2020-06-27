<template>
  <div class="videos">
    <h1>Videos</h1>
    <div v-if="videos">
        <div v-for="video in videos" :key="video._id">
          <video 
            :src="video.VideoUrl"
            v-if="video.VideoType === 'uploaded'"
            width="560" 
            height="315"
            controls />
          <iframe 
            width="560" 
            height="315" 
            v-else
            :src="`https://www.youtube.com/embed/${video.VideoUrl}`"
            frameborder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
          <div class="players">
            <p>Player 1: {{video.Players.Player1}}</p>
            <p>Player 2: {{video.Players.Player2}}</p>
          </div>
        </div>
    </div>
    <div v-else>
      There are no videos.. Lets add one now <br /><br />
    </div>
  </div>
</template>

<script>
import VideosService from '@/services/VideosService'

export default {
  name: 'videos',
  data () {
    return {
      videos: []
    }
  }, 
  mounted () {
    this.getVideos()
  },
  methods: {
    async getVideos () {
      const response = await VideosService.fetchVideos()
      this.videos = response.data.videos
    }
  }
}
</script>

<style>
  .videos {
    max-width: 600px;
    margin: 0 auto;
  }

  .videos .players {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: center;
  }
</style>