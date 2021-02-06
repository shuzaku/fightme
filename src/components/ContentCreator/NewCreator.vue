<template>
  <div class="add-creator">
    <h1>Add Creator</h1>
      <div class="form">
        <div>
          <v-text-field 
              id="import-image"
              type="text"
              v-model="contentCreator.logo"
              placeholder="image Url"
              v-if="!contentCreator.logo" />
          <div class="creator-img-container" v-if="contentCreator.logo">
            <img  :src="contentCreator.logo" class="creator-img"/>
            <v-btn @click="contentCreator.logo=''">X</v-btn>
          </div>
          <input type="text" name="name" placeholder="Creator Name" v-model="contentCreator.name">
          <input type="text" name="youtubeChannel" placeholder="Youtube Channel" v-model="contentCreator.youtubeChannel">
        </div> 
        <div>
          <v-btn class="submit-btn" rounded @click="addCreator()">Add</v-btn>
          
        </div>
      </div>
  </div>
</template>

<script>
import CreatorsService from '@/services/CreatorsService'
import moment from 'moment'


export default {
  components: {

  },
  name: 'NewCreator',
  data () {
    return {
      contentCreator: {
        name: null,
        logo: null,
        youtubeChannel: null
      }
    }
  },
  methods: {
    async addCreator () {
      this.collectCreatorIds()
      await CreatorsService.addCreator({
        Name: this.contentCreator.name,
        Logo: this.contentCreator.logo,
        YoutubeChannel: this.contentCreator.youtubeChannel,
        CreatedDate: this.timestamp,
        UpdatedDate: null
      })
      this.$router.push({ name: 'Creators' })
    },

    async getCreators () {
      const response = await CreatorsService.fetchCreators()
      this.creators = response.data.creators
    },

    collectCreatorIds () {
      this.creatorIds = this.selectedCreators.map( x => x._id )
    }
  },
  computed: {
    timestamp: function() {
      return moment().format()
    }
  },
  mounted () {
    this.getCreators()
  }
}
</script>
<style type="text/css">
.add-creator {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.add-creator button,
.add-creator input {
    display: block;
    margin-bottom: 20px;
}

.add-creator .submit-btn {
  margin-top: 20px;
}

.add-creator .creator-img-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.add-creator .creator-img-container .creator-img {
  max-width: 175px;
  border-radius: 50%;
  margin: 0 auto;
  border: 5px solid #000;
}
</style>
