<template>
  <div class="add-creator">
    <h1>Add Creator</h1>
      <div class="form">
        <div>
          <input type="text" name="name" placeholder="Creator Name" v-model="contentCreator.name" />
          <input
            id="import-image"
            type="text"
            v-model="contentCreator.logoUrl"
            placeholder="Logo Url"
            v-if="!contentCreator.logoUrl" />
          <div class="creator-img-container" v-if="contentCreator.logoUrl">
            <img  :src="contentCreator.logoUrl" class="creator-img"/>
            <v-btn @click="contentCreator.logoUrl=''">X</v-btn>
          </div>
          <input type="text" name="youtubeChannel" placeholder="Youtube Channel" v-model="contentCreator.youtubeUrl" />
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
        logoUrl: null,
        youtubeUrl: null
      }
    }
  },
  methods: {
    async addCreator () {
      await CreatorsService.addCreator({
        Name: this.contentCreator.name,
        LogoUrl: this.contentCreator.logoUrl,
        YoutubeUrl: this.contentCreator.youtubeUrl,
      })
      this.$emit('closeModal');
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

.add-creator input {
    margin-bottom: 10px;
    border: 0;
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
