<!-- @format -->
<template>
    <div class="character-note">
        <div v-if="!isLoading" class="note-container">
            <div class="title-row" :class="{ open: showContent }" @click="toggleContent()">
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

    name: 'CharacterNotes',
    components: {},

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
            if (!window.confirm('Delete this note? This cannot be undone.')) return;
            this.$emit('delete:note', this.note.id);
        },
    },
};
</script>
<style type="text/css">
.character-note .note-container {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.character-note .note-container:hover {
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
    transform: translateY(-1px);
}

.character-note .title-row {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #4447e2 0%, #6a3fe0 100%);
    width: 100%;
    padding: 12px 16px;
    position: relative;
    cursor: pointer;
    transition: filter 0.2s ease;
}

.character-note .title-row:hover {
    filter: brightness(1.08);
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
    margin-right: 14px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.character-note h3 {
    color: #fff;
    margin: 0;
    flex: 1;
    font-weight: 600;
    letter-spacing: 0.3px;
}

.character-note .title-row .v-icon {
    color: #fff;
    margin-left: 12px;
    flex-shrink: 0;
    transition: transform 0.25s ease;
}

.character-note .title-row.open .v-icon {
    transform: rotate(180deg);
}

.character-note .note-content {
    background: #1c1c24;
    color: #e8e8ea;
    padding: 46px 22px 22px;
    position: relative;
    line-height: 1.6;
    border-top: 2px solid rgba(62, 180, 137, 0.5);
}

.character-note .edit-btn-container .v-icon,
.character-note .delete-btn-container .v-icon {
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

.character-note .edit-btn-container .v-icon {
    right: 52px;
}

.character-note .delete-btn-container .v-icon {
    right: 12px;
}

.character-note .edit-btn-container .v-icon:hover {
    background: rgba(68, 71, 226, 0.65);
}

.character-note .delete-btn-container .v-icon:hover {
    background: rgba(226, 68, 68, 0.65);
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
