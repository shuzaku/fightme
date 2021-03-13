<template>
  <div class="tournamnets-search">
      <multiselect 
        v-model="selectedTournament" 
        :options="tournaments" 
        :multiple="false" 
        :close-on-select="true" 
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable="true" 
        @tag="addTournament"
        @input="setTournament"
        placeholder="Search or add a Tournament"
        label="name" >
        <template slot="selection" 
          slot-scope="{ values, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Tournament
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service'

export default {
  inject: ['video'],
  name: 'tournaments-search',
  props: {
    tournament: {
      type: Number
    }
  },  
  data () {
    return {
      tournaments: [],
      selectedTournament: null
    }
  }, 

  watch: {
    selectedTournament: function() {
      this.video.tournament = this.selectedTournament
    }
  },

  methods: {
    async addTournament (newTournament) {
      await TournamentsService.addTournament({
        Name: newTournament,
        CreatedDate: this.timestamp,
        UpdatedDate: null,
      })
      this.getTournaments();
    },

    async getTournaments () {
      const response = await TournamentsService.fetchTournaments()
      this.tournaments = response.data.tournaments.map(tournament => {
        return {
          id: tournament._id,
          name: tournament.Name,
          games: tournament.Games ? tournament.Games.map(game => {
            return {
              id: game._id,
              title: game.title 
            }
          }):null
        }
      });
    },

    setTournament() {
      this.$emit('update:tournament' , this.selectedTournament);
    }
  },

  mounted () {
    if(this.video){
      this.selectedTournament = this.video.Tournament;
    }

    this.getTournaments();
  }
}
</script>
<style type="text/css">
</style>