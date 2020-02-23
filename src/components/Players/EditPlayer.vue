<template>
  <div class="players">
    <h1>Edit Player</h1>
      <div class="form">
        <div>
          <input type="text" name="title" placeholder="TITLE" v-model="title">
        </div>
        <div>
          <button class="app_post_btn" @click="updatePlayer">Update</button>
        </div>
      </div>
  </div>
</template>

<script>
import PlayersService from '@/services/PlayersService'
import moment from 'moment'
export default {
  name: 'EditPlayer', 
  data () {
    return {
      title: '',
      description: '',
      createdDate: '',
      updatedDate: '',
    }
  },
  mounted () {
    this.getPlayer()
  },
  methods: {
    async getPlayer () {
      const response = await PlayersService.getPlayer({
        id: this.$route.params.id
      })
      this.title = response.data.PlayerTitle
      this.createdDate = response.data.CreatedDate
    },
    async updatePlayer () {
      await PlayersService.updatePlayer({
        id: this.$route.params.id,
        PlayerTitle: this.title,
        CreatedDate: this.createdDate,
        UpdatedDate: this.timestamp
      })
      this.$router.push({ name: 'Players' })
    }
  },
  computed: {
    timestamp: function() {
      return moment().format()
    }
  }
}
</script>
<style type="text/css">
.form input, .form textarea {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
}
.form div {
  margin: 20px;
}
.app_post_btn {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  width: 520px;
  border: none;
  cursor: pointer;
}
</style>