<!-- @format -->
<template>
    <div class="game-note">
        <div v-if="!isLoading" class="note-container">
            <div class="title-row" :class="{ open: showContent }" @click="toggleContent()">
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
import GamesService from '@/services/games-service';

export default {

    name: 'GameNotes',
    components: {},

    props: {
        note: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
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
            this.getGame();
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
            if (!window.confirm('Delete this note? This cannot be undone.')) return;
            this.$emit('delete:note', this.note.id);
        },
    },
};
</script>
<style type="text/css">
.game-note .note-container {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.game-note .note-container:hover {
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
    transform: translateY(-1px);
}

.game-note .title-row {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #4447e2 0%, #6a3fe0 100%);
    width: 100%;
    padding: 12px 16px;
    position: relative;
    cursor: pointer;
    transition: filter 0.2s ease;
}

.game-note .title-row:hover {
    filter: brightness(1.08);
}

.game-note .game-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-size: contain;
    background-color: #e8e8e8;
    background-repeat: no-repeat;
    background-position: 50%;
    margin: 0 14px 0 0;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.game-note h3 {
    color: #fff;
    margin: 0;
    flex: 1;
    font-weight: 600;
    letter-spacing: 0.3px;
}

.game-note .title-row .v-icon {
    color: #fff;
    margin-left: 12px;
    flex-shrink: 0;
    transition: transform 0.25s ease;
}

.game-note .title-row.open .v-icon {
    transform: rotate(180deg);
}

.game-note .note-content {
    background: #1c1c24;
    color: #e8e8ea;
    padding: 46px 22px 22px;
    position: relative;
    line-height: 1.6;
    border-top: 2px solid rgba(62, 180, 137, 0.5);
}

.game-note .edit-btn-container .v-icon,
.game-note .delete-btn-container .v-icon {
    position: absolute;
    top: 10px;
    height: 34px;
    width: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    cursor: pointer;
    transition: background 0.2s ease;
}

.game-note .edit-btn-container .v-icon {
    right: 52px;
}

.game-note .delete-btn-container .v-icon {
    right: 12px;
}

.game-note .edit-btn-container .v-icon:hover {
    background: rgba(68, 71, 226, 0.65);
}

.game-note .delete-btn-container .v-icon:hover {
    background: rgba(226, 68, 68, 0.65);
}

.game-note ul {
    margin-left: 20px;
}

.game-note li {
    margin-bottom: 5px;
}

.game-note .ql-indent-1 {
    margin-left: 20px;
}

.game-note .mdi-pencil::before,
.game-note .mdi-trash-can::before {
    color: #fff;
}
</style>
