<template>
  <div class="creators-search">
      <multiselect 
        v-model="selectedCreator" 
        :options="creators" 
        :multiple="false" 
        :close-on-select="true" 
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable="true" 
        @tag="addCreator($event)"
        @input="setCreator()"
        placeholder="Search or add a Creator"
        label="name" >
        <template slot="selection" 
          slot-scope="{ values, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Creator
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>
import CreatorsService from '@/services/creators-service'

export default {
  name: 'creators-search',
  props: {
    creator: {
      type: Number
    }
  },  
  data () {
    return {
      creators: [],
      selectedCreator: null
    }
  }, 

  methods: {
    async addCreator(newCreator) { 
      await CreatorsService.addCreator({
        Name: newCreator,
        Logo: null,
        youtubeChannel: null
      })
      this.getCreators();
    },

    async getCreators () {
      const response = await CreatorsService.fetchCreators();
      this.creators = response.data.creators.map(creator => {
        return {
          id: creator._id,
          name: creator.Name,
          logo: creator.Logo,
          youtubeChannel: creator.YoutubeChannel
        }
      });
    },

    setCreator() {
      this.$emit('update:creator' , this.selectedCreator);
    }
  },

  mounted () {
    if(this.video){
      this.selectedCreator = this.video.contentCreator;
    }

    this.getCreators();
  }
}
</script>
