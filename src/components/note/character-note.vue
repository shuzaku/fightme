<!-- @format -->
<template>
    <div class="character-note">
        <div class="note-container" v-if="!isLoading">
            <div class="title-row" @click="toggleContent()">
                <div
                    class="character-bubble"
                    :style="{ backgroundImage: `url('${character.imageUrl}')` }"
                />
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
import CharactersService from '@/services/characters-service';

export default {
    components: {},

    name: 'CharacterNotes',

    props: {
        note: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            character: {
                imageUrl: null,
            },
            opposingCharacter: null,
            isLoading: false,
            showContent: false,
        };
    },

    mounted() {
        this.getCharacter();
    },

    methods: {
        async getCharacter() {
            this.isLoading = true;

            const response = await CharactersService.getCharacter({
                id: this.note.target1,
            });
            var character = response.data.characters[0];
            this.character = {
                id: character._id,
                name: character.Name,
                imageUrl: character.AvatarUrl,
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
.character-note .title-row {
    display: flex;
    align-items: center;
    background: #4447e2;
    width: 100%;
    border-radius: 5px;
    padding: 8px 10px;
    position: relative;
}

.character-note .character-bubble {
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

.character-note h3 {
    color: #fff;
    margin-left: 90px;
}

.character-note .v-icon {
    position: absolute;
    right: 20px;
}

.character-note .note-content .v-icon {
    position: absolute;
    right: -40px;
}

.character-note .delete-btn-container .v-icon {
    position: absolute;
    right: -40px;
    top: 60px;
}

.character-note .note-content {
    background: #1c1c24;
    color: #fff;
    padding: 20px;
    position: relative;
}

.character-note ul {
    margin-left: 20px;
}

.character-note li {
    margin-bottom: 5px;
}

.character-note .ql-indent-1 {
    margin-left: 20px;
}

.character-note .mdi-pencil::before,
.character-note .mdi-trash-can::before {
    color: #fff;
}
</style>
