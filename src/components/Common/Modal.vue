<template>
    <div class="modals">
        <v-btn color="error" fab large dark class="close-btn" @click="closeModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <new-game 
          v-if="createType === 'game'"
          @closeModal="closeModal()"/>

        <new-creator 
          v-if="createType === 'creator'"
          @closeModal="closeModal()"/>

        <new-player 
          v-if="createType === 'player'"
          @closeModal="closeModal()"/>

        <new-video 
          v-if="createType === 'video'" 
          @closeModal="closeModal()"/>

        <new-tournament 
          v-if="createType === 'tournament'" 
          @closeModal="closeModal()"/>
      </div>
</template>

<script>
import newGame from '@/components/Games/NewGame'
import newCreator from '@/components/ContentCreator/NewCreator'
import newPlayer from '@/components/Players/NewPlayer'
import newVideo from '@/components/Videos/PostVideo'
import newTournament from '@/components/Tournament/NewTournament'

export default {
  name: 'Modal',

  props: {
    createType: {
      type: String
    }
  },

  components: {
    'new-game': newGame,
    'new-video': newVideo,
    'new-creator': newCreator,
    'new-player': newPlayer,
    'new-tournament': newTournament,
  },

  data: () => ({
  }),

  methods: {
    closeModal() {
      this.$emit('closeModal')
    }
  },

  created() {
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
    height: 650px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .modals .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }
</style>
