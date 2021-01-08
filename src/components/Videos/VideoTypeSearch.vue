<template>
  <div class="video-type-search">
      <multiselect 
        v-model="selectedType" 
        :options="types" 
        :close-on-select="true"
        :clear-on-select="false" 
        :preserve-search="true" 
        @input="setType"
        placeholder="Select Video Type">
        <template slot="selection" 
          slot-scope="{ values, search, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Video Type
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>
export default {
  name: 'video-type-search',
  props: {

  },
  data () {
    return {
      types: ['Combo' , 'Match'],
      selectedType: null
    }
  }, 
  mounted () {

  },
  methods: {
    setType() {
      this.$emit('update:type' , this.selectedType);
    }
  }
}
</script>
<style type="text/css">
</style>