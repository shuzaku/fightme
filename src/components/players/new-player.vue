<!-- @format -->
<template>
    <div class="add-player">
        <h1>Add Player</h1>
        <div class="form">
            <div>
                <input
                    id="import-image"
                    type="text"
                    v-model="player.imageUrl"
                    placeholder="Player Image Url"
                />
                <div class="player-img-container" v-if="player.imageUrl">
                    <img :src="player.imageUrl" class="player-img" />
                    <v-btn @click="player.imageUrl = ''">X</v-btn>
                </div>
                <input type="text" name="name" placeholder="Player Name" v-model="player.name" />
                <!-- <input type="text" name="region" placeholder="Region" v-model="player.region"> -->
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addPlayer()">Add Player</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';

export default {
    components: {},
    name: 'NewPlayer',
    data() {
        return {
            player: {
                name: '',
                region: '',
                imageUrl: '',
            },
        };
    },

    methods: {
        async addPlayer() {
            await PlayersService.addPlayer({
                Name: this.player.name,
                // PlayerRegion: this.player.region,
                ImageUrl: this.player.imageUrl,
            });
            this.$emit('closeModal');
        },
    },
};
</script>

<style type="text/css">
.add-player button,
.add-player input {
    display: block;
    margin-bottom: 20px;
}

.add-player .submit-btn {
    margin-top: 20px;
}

.add-player .player-img-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.add-player .player-img-container .player-img {
    max-width: 100px;
    height: auto;
    border-radius: 50%;
    margin: 0 auto;
}
</style>
