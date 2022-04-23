<!-- @format -->
<template>
    <div class="player-note">
        <div class="note-container" v-if="!isLoading">
            <div class="title-row" @click="toggleContent()">
                <div
                    class="character-bubble"
                    :style="{ backgroundImage: `url('${player.imageUrl}')` }"
                />
                <div class="game-bubble" :style="{ backgroundImage: `url('${game.logo}')` }" />
                <h3>{{ note.heading }}</h3>
                <v-icon> mdi-chevron-down </v-icon>
            </div>
            <div v-if="showContent" class="note-content">
                <div class="edit-btn-container">
                    <v-icon class="edit-btn" @click="editNote()"> mdi-pencil </v-icon>
                </div>
                <div class="delete-btn-container">
                    <v-icon class="delete-btn" @click="deleteNote()"> mdi-trash-can </v-icon>
                </div>
                <div v-html="note.content"></div>
            </div>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import GamesService from '@/services/games-service';

export default {
    components: {},

    name: 'PlayerNotes',

    props: {
        note: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            player: {
                imageUrl: null,
            },
            game: {
                logo: null,
            },
            isLoading: false,
            showContent: false,
        };
    },

    mounted() {
        this.getData();
    },

    methods: {
        getData() {
            this.isLoading = true;
            this.getPlayer();
            this.getGame();
            this.isLoading = false;
        },

        async getPlayer() {
            this.isLoading = true;

            const response = await PlayersService.getPlayer({
                id: this.note.target1,
            });

            var player = response.data;
            this.player = {
                id: player._id,
                name: player.Name,
                imageUrl:
                    player.PlayerImg ||
                    'https://res.cloudinary.com/shuzchef/image/upload/v1650092773/uxysz47wggljhqp7dcbg.jpg',
            };
            this.isLoading = false;
        },

        async getGame() {
            this.isLoading = true;

            const response = await GamesService.getGame({
                id: this.note.gameId,
            });

            var game = response.data;
            this.game = {
                id: game._id,
                name: game.Title,
                logo: game.LogoUrl || null,
            };
            this.isLoading = false;
        },

        toggleContent() {
            this.showContent = !this.showContent;
        },

        editNote() {
            this.$emit('edit:note', this.note.id);
        },

        deleteNote() {
            this.$emit('delete:note', this.note.id);
        },
    },
};
</script>
<style type="text/css">
.player-note .title-row {
    display: flex;
    align-items: center;
    background: #4447e2;
    width: 100%;
    border-radius: 5px;
    padding: 8px 10px;
    position: relative;
}

.player-note .character-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-size: cover;
    background-position: top center;
    background-color: #e8e8e8;
    margin-right: 10px;
}

.player-note .game-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-size: contain;
    background-position: top center;
    background-color: #e8e8e8;
    background-repeat: no-repeat;
    background-position: 50%;
    margin: 0;
    margin-right: 10px;
}

.player-note h3 {
    color: #fff;
    margin-left: 30px;
}

.player-note .v-icon {
    position: absolute;
    right: 20px;
}

.player-note .note-content .v-icon {
    position: absolute;
    right: -40px;
}

.player-note .delete-btn-container .v-icon {
    position: absolute;
    right: -40px;
    top: 60px;
}

.player-note .note-content {
    background: #1c1c24;
    color: #fff;
    padding: 20px;
    position: relative;
}

.player-note ul {
    margin-left: 20px;
}

.player-note li {
    margin-bottom: 5px;
}

.player-note .ql-indent-1 {
    margin-left: 20px;
}

.player-note .mdi-pencil::before,
.player-note .mdi-trash-can::before {
    color: #fff;
}
</style>
