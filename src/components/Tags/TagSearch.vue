<template>
  <div class="players-search">
      <multiselect 
        v-model="selectedTags" 
        :options="tags" 
        :multiple="true" 
        :close-on-select="false" 
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable= taggable
        @tag="addTag"
        @input="setTags"
        placeholder="Search or add a Tag"
        label="TagName" 
        track-by="TagName">
        <template slot="selection" 
          slot-scope="{ values, search, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Tags
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>
import TagsService from '@/services/TagsService'

export default {
  name: 'players-search',
  props: {
    taggable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tags: [],
      selectedTags: null
    }
  }, 
  mounted () {
    this.getTags()
  },
  methods: {
    async addTag (newTag) {
      await TagsService.addTag({
        TagName: newTag,
        CreatedDate: this.timestamp,
        UpdatedDate: null,
      })
      this.getTags();
    },

    async getTags () {
      const response = await TagsService.fetchTags()
      this.tags = response.data.tags
    },

    setTags() {
        this.$emit('update:tags' , this.selectedTags);
    }
  }
}
</script>
<style type="text/css">
</style>