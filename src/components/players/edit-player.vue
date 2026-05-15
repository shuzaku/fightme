<!-- @format -->
<template>
    <div class="edit-player">
        <h1>Edit Player</h1>
        <div v-if="isLoading" class="loading-msg">Loading...</div>
        <div v-else class="form">
            <div v-if="player.imageUrl" class="player-img-container">
                <img :src="player.imageUrl" class="player-img" />
                <v-btn small @click="player.imageUrl = ''">Remove</v-btn>
            </div>
            <v-text-field v-model="player.imageUrl" dark type="text" placeholder="Image URL" />
            <v-text-field v-model="player.name" dark type="text" placeholder="Player Name" />
            <v-text-field v-model="player.twitter" dark type="text" placeholder="Twitter URL" />
            <v-text-field v-model="player.stream" dark type="text" placeholder="Twitch URL" />
            <v-text-field v-model="player.youtube" dark type="text" placeholder="YouTube URL" />

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>

            <v-btn class="submit-btn" rounded :loading="isSaving" @click="savePlayer()">
                Save Changes
            </v-btn>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';

export default {
    name: 'EditPlayer',

    props: {
        playerId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            isLoading: true,
            isSaving: false,
            errorMessage: null,
            successMessage: null,
            player: {
                name: '',
                imageUrl: '',
                twitter: '',
                stream: '',
                youtube: '',
            },
        };
    },

    created() {
        if (this.playerId) this.fetchPlayer();
    },

    methods: {
        async fetchPlayer() {
            this.isLoading = true;
            try {
                const res = await PlayersService.getPlayer({ id: this.playerId });
                const p = res.data;
                this.player = {
                    name:     p.Name     || '',
                    imageUrl: p.ImageUrl || '',
                    twitter:  p.Twitter  || '',
                    stream:   p.Stream   || '',
                    youtube:  p.Youtube  || '',
                };
            } catch (e) {
                this.errorMessage = 'Failed to load player data.';
            }
            this.isLoading = false;
        },

        async savePlayer() {
            this.errorMessage = null;
            this.successMessage = null;
            this.isSaving = true;
            try {
                await PlayersService.updatePlayer({
                    id:       this.playerId,
                    Name:     this.player.name,
                    ImageUrl: this.player.imageUrl,
                    Twitter:  this.player.twitter,
                    Stream:   this.player.stream,
                    Youtube:  this.player.youtube,
                });
                this.successMessage = 'Player updated successfully!';
            } catch (e) {
                this.errorMessage = 'Failed to save changes.';
            }
            this.isSaving = false;
        },
    },
};
</script>

<style scoped>
.edit-player h1 {
    color: #fff;
    margin-bottom: 20px;
}
.edit-player .form {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.edit-player .player-img-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}
.edit-player .player-img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
}
.edit-player .submit-btn {
    margin-top: 16px;
}
.edit-player .error-msg {
    color: #ff5252;
    font-size: 13px;
}
.edit-player .success-msg {
    color: #3eb489;
    font-size: 13px;
}
.edit-player .loading-msg {
    color: #fff;
}
</style>
