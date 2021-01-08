<template>
  <div class="video-nav">
    <h1>Search</h1>
    <game-search 
        v-model="video.game.title" 
        @update:game="setGame($event)" />
    <player-search 
        v-model="video.player1.name" 
        @update:player="setPlayer1($event)" />
    <character-search 
        v-model="video.player1.character"
        v-if="video.game.title"
        :characters="video.game.characters" 
        @update:character="setPlayer1Character($event)" />
    <tag-search
        v-model="video.tags"
        :taggable = true
        @update:tags="setTags($event)" />
    <v-btn class="submit-btn" rounded @click="postVideo()">Submit</v-btn>
    </div>
</template>

<script>
import PlayerSearch from '@/components/Players/PlayerSearch'
import CharacterSearch from '@/components/Games/CharacterSearch'
import GameSearch from '@/components/Games/GameSearch'
import TagSearch from '@/components/Tags/TagSearch'

export default {
  name: 'post-video',
  components:{
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
        tags: []
      },

      isAddingPlayers: false,
      isImportingVideo: true,
      importVideoUrl: null,
      games: [],
      videoOrigin: true,
    }
  },
  methods: {
    setPlayer1(player) {
      this.video.player1.id = player._id
      this.video.player1.name = player.PlayerName
    },

    setPlayer1Character(character) {
      this.video.player1.character = character
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
  }
}
</script>

<style type="text/css">
.post-video {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
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
