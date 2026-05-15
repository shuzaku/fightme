<!-- @format -->
<template>
    <div class="edit-game">
        <h1>Edit Game</h1>
        <div v-if="isLoading" class="loading-msg">Loading...</div>
        <div v-else class="form">
            <div v-if="game.logoUrl" class="logo-preview">
                <img :src="game.logoUrl" class="logo-img" />
                <v-btn small @click="game.logoUrl = ''">Remove</v-btn>
            </div>
            <v-text-field v-model="game.title" dark   type="text" placeholder="Game Title" />
            <v-text-field v-model="game.logoUrl" dark type="text" placeholder="Logo URL" />

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>

            <v-btn class="submit-btn" rounded :loading="isSaving" @click="saveGame()">
                Save Changes
            </v-btn>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'EditGame',

    props: {
        gameId: {
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
            game: {
                title: '',
                logoUrl: '',
            },
        };
    },

    created() {
        if (this.gameId) this.fetchGame();
    },

    methods: {
        async fetchGame() {
            this.isLoading = true;
            try {
                const res = await GamesService.getGame({ id: this.gameId });
                const g = res.data.game || res.data;
                this.game = {
                    title:   g.Title   || '',
                    logoUrl: g.LogoUrl || '',
                };
            } catch (e) {
                this.errorMessage = 'Failed to load game data.';
            }
            this.isLoading = false;
        },

        async saveGame() {
            this.errorMessage = null;
            this.successMessage = null;
            this.isSaving = true;
            try {
                await GamesService.updateGame({
                    id:      this.gameId,
                    Title:   this.game.title,
                    LogoUrl: this.game.logoUrl,
                });
                this.successMessage = 'Game updated successfully!';
            } catch (e) {
                this.errorMessage = 'Failed to save changes.';
            }
            this.isSaving = false;
        },
    },
};
</script>

<style scoped>
.edit-game h1 {
    color: #fff;
    margin-bottom: 20px;
}
.edit-game .form {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.edit-game .logo-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}
.edit-game .logo-img {
    max-width: 120px;
    height: auto;
}
.edit-game .submit-btn {
    margin-top: 16px;
}
.edit-game .error-msg {
    color: #ff5252;
    font-size: 13px;
}
.edit-game .success-msg {
    color: #3eb489;
    font-size: 13px;
}
.edit-game .loading-msg {
    color: #fff;
}
</style>
