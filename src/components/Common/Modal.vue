<template>
    <div class="modals">
        <v-btn color="error" fab large dark class="close-btn" @click="closeModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <new-game v-if="createType === 'game'"/>
        <!-- <new-player /> -->
        <new-video 
        v-if="createType === 'video'" 
        @closeModal="closeModal()"/>
      </div>
</template>

<script>
import newGame from '@/components/Games/NewGame'
// import newPlayer from '@/components/Players/NewPlayer'
import newVideo from '@/components/Videos/PostVideo'

export default {
  name: 'TopNav',

  props: {
    createType: {
      type: String
    }
  },

  components: {
    'new-game': newGame,
    'new-video': newVideo,
    // 'new-player': newPlayer,
  },

  data: () => ({
  }),

  methods: {
    closeModal() {
      this.$emit('closeModal')
    }
  },

  created() {
    console.log(this.createType)
  }
};
</script>

<style type="text/css">
  .modals {
    position: fixed;
    width: 100%;
    z-index: 999;
    max-width: 600px;
    background: #fff;
    left: 50%;
    margin-left: -310px;
    top: 0px;
    border-radius: 20px;
    padding: 40px;  
  }

  .modals .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }
</style>
