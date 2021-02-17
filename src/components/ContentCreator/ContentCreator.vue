<template>
  <div class="creators">
      <li v-for="creator in creators" :key="creator.id">
          <img :src="creator.logoUrl" class="logo-img"/>
          {{creator.name}}
      </li>
  </div>
</template>

<script>
import CreatorsService from '@/services/CreatorsService'

export default {
  name: 'creators',
  props: {
  },

  data () {
    return {
      creators: [],
    }
  },

  methods: {
    async getCreators () {
      const response = await CreatorsService.fetchCreators()
      this.creators = response.data.creators.map(creator => {
        return {
            id: creator._id,
            name: creator.Name,
            logoUrl: creator.LogoUrl
        }
      })
    },
  },

  mounted () {    
      this.getCreators();
  },
}
</script>
<style type="text/css">
.creators .logo-img{
  width: 50px;
  height: auto;
  border-radius: 50%;
}
</style>