<!-- @format -->
<template>
    <div class="note-widget">
        <h1>{{ title }}</h1>
        <loading v-if="isLoading"></loading>
        <div v-else class="note-widget-container">
            <label>Type:</label>
            <multiselect
                v-model="note.selectedType"
                dark
                :options="types"
                :searchable="false"
                :show-labels="false"
                placeholder="Select a type"
            >
            </multiselect>

            <label>Game:</label>
            <game-search v-model="note.selectedGameId" @update:game="setSelectedGame($event)" />

            <div
                v-if="note.selectedType === 'Character' && note.selectedGameId"
                class="character-note"
            >
                <label>Character:</label>
                <character-search
                    v-model="note.selectedCharacterIds"
                    :gameId="note.selectedGameId"
                    @update:character="setSelectedCharacter($event)"
                />
            </div>

            <div v-if="note.selectedType === 'Player'" class="player-note">
                <label>Player:</label>
                <player-search
                    v-model="note.selectedPlayerId"
                    @update:player="setSelectedPlayer($event)"
                />
            </div>

            <div
                v-if="note.selectedType === 'Character Matchup' && note.selectedGameId"
                class="matchup-note"
            >
                <label>Character:</label>
                <character-search
                    v-model="note.selectedCharacterIds"
                    :gameId="note.selectedGameId"
                    @update:character="setSelectedCharacter($event)"
                />

                <label>Opposing Character:</label>
                <character-search
                    v-model="note.selectedOpposingCharacterIds"
                    :gameId="note.selectedGameId"
                    @update:character="setSelectedOpposingCharacter($event)"
                />
            </div>

            <div class="note-content">
                <label>Heading:</label>
                <div class="note-field-wrap">
                    <i class="fas fa-heading note-field-icon" aria-hidden="true"></i>
                    <v-text-field
                        v-model="note.heading"
                        class="note-heading-field"
                        dark
                        outlined
                        dense
                        hide-details="auto"
                        placeholder="Note heading"
                        required
                        autofocus
                    />
                </div>

                <label>Content:</label>
                <div class="note-editor-wrap">
                    <quill-editor ref="myQuillEditor" v-model="note.noteContent" dark />
                </div>
            </div>

            <v-btn v-if="!noteId" class="submit-btn" rounded @click="addNote()">Add Note</v-btn>
            <v-btn v-else class="submit-btn" rounded @click="updateNote()">Update Note</v-btn>
        </div>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import CharacterSearch from '@/components/character/character-search';
import PlayerSearch from '@/components/players/player-search';
import NotesService from '@/services/notes-service';
import Loading from '@/components/common/loading';
import { eventbus } from '@/main';

export default {

    name: 'NewNote',
    components: {
        'game-search': GameSearch,
        'character-search': CharacterSearch,
        'player-search': PlayerSearch,
        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },

        noteId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            types: ['Player', 'Character', 'Character Matchup', 'Game'],
            note: {
                selectedType: null,
                selectedGameId: null,
                selectedCharacterIds: [],
                selectedOpposingCharacterIds: [],
                selectedPlayerId: null,
                noteContent: null,
                heading: '',
            },
            target1: null,
            target2: null,
            isLoading: false,
        };
    },

    computed: {
        title() {
            if (this.noteId) {
                return 'Edit Note';
            } else {
                return 'New Note';
            }
        },
    },

    mounted() {
        if (this.noteId) {
            this.getNote();
        }
    },

    methods: {
        async getNote() {
            this.isLoading = true;
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'Id',
                        queryValue: this.noteId,
                    },
                ],
            };

            const response = await NotesService.queryNotes(queryParameter);
            this.hydrateNotes(response.data.notes[0]);
            this.isLoading = false;
        },

        hydrateNotes(note) {
            this.note.selectedType = note.Type;
            this.note.noteContent = note.Content;
            this.note.selectedGameId = note.GameId;
            this.note.heading = note.Heading;

            if (note.Type === 'Player') {
                this.note.selectedPlayerId = note.Target1;
            } else if (note.Type === 'Character') {
                this.note.selectedCharacterIds.push(note.Target1);
            } else if (note.Type === 'Character Matchup') {
                this.note.selectedCharacterIds.push(note.Target1);
                this.note.selectedOpposingCharacterIds.push(note.Target2);
            }
        },

        setSelectedGame(game) {
            this.note.selectedGameId = game.id;
        },

        setSelectedCharacter(character) {
            this.note.selectedCharacterIds = [];
            this.note.selectedCharacterIds.push(character.id);
        },

        setSelectedPlayer(player) {
            this.note.selectedPlayerId = player.id;
        },

        setSelectedOpposingCharacter(character) {
            this.note.selectedOpposingCharacterIds = [];
            this.note.selectedOpposingCharacterIds.push(character.id);
        },

        generateNoteResponse() {
            switch (this.note.selectedType) {
                case 'Game':
                    this.target1 = this.note.selectedGameId;
                    break;
                case 'Player':
                    this.target1 = this.note.selectedPlayerId;
                    break;
                case 'Character':
                    this.target1 = this.note.selectedCharacterIds[0];
                    break;
                case 'Character Matchup':
                    this.target1 = this.note.selectedCharacterIds[0];
                    this.target2 = this.note.selectedOpposingCharacterIds[0];
                    break;
            }
        },

        async addNote() {
            this.generateNoteResponse();

            var response = await NotesService.addNote({
                Type: this.note.selectedType,
                Target1: this.target1,
                Target2: this.target2,
                Heading: this.note.heading,
                Content: this.note.noteContent,
                AuthorId: this.account.id,
                GameId: this.note.selectedGameId,
            });

            if (!response.data.err) {
                this.$emit('closeModal');
                eventbus.$emit('note:update');
            }
        },

        async updateNote() {
            this.generateNoteResponse();

            await NotesService.updateNote({
                id: this.noteId,
                Type: this.note.selectedType,
                Target1: this.target1,
                Target2: this.target2,
                Heading: this.note.heading,
                Content: this.note.noteContent,
                AuthorId: this.account.id,
                GameId: this.note.selectedGameId,
            });

            this.$emit('closeModal');
            eventbus.$emit('note:update');
        },
    },
};
</script>
<style type="text/css">
.note-widget {
    color: #fff;
    max-width: 560px;
}

.note-widget h1 {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid rgba(62, 180, 137, 0.5);
    letter-spacing: 0.5px;
}

.note-widget label {
    display: block;
    margin: 14px 0 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #c5cad8;
}

.note-widget .multiselect {
    margin: 5px 0 20px;
}

.note-widget .character-note,
.note-widget .player-note,
.note-widget .matchup-note {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 4px 16px 16px;
    margin-bottom: 8px;
}

.note-widget .note-content {
    margin-bottom: 24px;
}

.note-widget .note-field-wrap {
    position: relative;
    margin-bottom: 16px;
}

.note-widget .note-field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.65);
    font-size: 15px;
    z-index: 2;
    pointer-events: none;
}

.note-widget .note-heading-field {
    padding-top: 0;
    margin-top: 0;
}

.note-widget .note-heading-field .v-input__control {
    min-height: 48px;
}

.note-widget .note-heading-field .v-input__slot {
    background: #3a4154 !important;
    border-radius: 12px !important;
    min-height: 48px !important;
    padding-left: 40px !important;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.note-widget .note-heading-field fieldset {
    border: 1px solid rgba(255, 255, 255, 0.28) !important;
    border-radius: 12px !important;
}

.note-widget .note-heading-field.v-input--is-focused fieldset {
    border-color: #3eb489 !important;
    border-width: 2px !important;
}

.note-widget .note-heading-field.v-input--is-focused .v-input__slot {
    background: #404862 !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.2);
}

.note-widget .note-heading-field input {
    color: #fff !important;
    font-size: 15px;
    font-weight: 500;
    caret-color: #3eb489;
}

.note-widget .note-heading-field input::placeholder {
    color: rgba(255, 255, 255, 0.55) !important;
}

.note-widget .note-editor-wrap {
    margin-top: 4px;
    border-radius: 12px;
    overflow: visible;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.note-widget .note-editor-wrap .ql-toolbar {
    background: #3a4154 !important;
    border: 1px solid rgba(255, 255, 255, 0.28) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
    border-radius: 12px 12px 0 0 !important;
    padding: 10px 12px 10px 16px !important;
}

.note-widget .note-editor-wrap .ql-container {
    background: #3a4154 !important;
    border: 1px solid rgba(255, 255, 255, 0.28) !important;
    border-top: none !important;
    border-radius: 0 0 12px 12px !important;
    min-height: 200px !important;
    font-size: 15px;
}

.note-widget .note-editor-wrap .ql-editor {
    background: #3a4154 !important;
    color: #fff !important;
    min-height: 180px !important;
    line-height: 1.6;
    padding: 14px 16px !important;
    caret-color: #3eb489;
}

.note-widget .note-editor-wrap .ql-editor.ql-blank::before {
    color: rgba(255, 255, 255, 0.55) !important;
    font-style: normal;
    left: 16px;
}

.note-widget .note-editor-wrap .ql-snow .ql-editor pre.ql-syntax {
    background-color: #2a2f3d;
    color: #f0f0f0;
    border-radius: 8px;
}

.note-widget .note-editor-wrap .ql-toolbar .ql-stroke {
    stroke: #fff !important;
}

.note-widget .note-editor-wrap .ql-toolbar .ql-fill {
    fill: #fff !important;
}

.note-widget .note-editor-wrap .ql-toolbar .ql-picker {
    color: #fff !important;
}

.note-widget .note-editor-wrap .ql-toolbar .ql-picker-label {
    border-color: rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
}

.note-widget .note-editor-wrap .ql-toolbar .ql-picker-label::before {
    color: #fff !important;
}

/* Size / header dropdown menus */
.note-widget .note-editor-wrap .ql-snow .ql-picker-options {
    background-color: #2f3544 !important;
    border: 1px solid rgba(255, 255, 255, 0.28) !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45) !important;
    padding: 6px 10px 6px 6px !important;
    z-index: 20;
}

.note-widget .note-editor-wrap .ql-snow .ql-picker-item {
    color: #e8ecf4 !important;
    padding-left: 12px !important;
}

.note-widget .note-editor-wrap .ql-snow .ql-picker-item::before {
    color: #e8ecf4 !important;
}

.note-widget .note-editor-wrap .ql-snow .ql-picker-item:hover,
.note-widget .note-editor-wrap .ql-snow .ql-picker-item.ql-selected {
    background-color: rgba(62, 180, 137, 0.22) !important;
    color: #fff !important;
}

.note-widget .note-editor-wrap .ql-snow .ql-picker-item:hover::before,
.note-widget .note-editor-wrap .ql-snow .ql-picker-item.ql-selected::before {
    color: #fff !important;
}

.note-widget .note-editor-wrap .ql-toolbar button:hover .ql-stroke,
.note-widget .note-editor-wrap .ql-toolbar .ql-picker-label:hover .ql-stroke {
    stroke: #3eb489 !important;
}

.note-widget .note-editor-wrap .ql-toolbar button:hover .ql-fill {
    fill: #3eb489 !important;
}

.note-widget .note-editor-wrap .ql-toolbar button.ql-active .ql-stroke {
    stroke: #3eb489 !important;
}

.note-widget .note-editor-wrap .ql-toolbar button.ql-active .ql-fill {
    fill: #3eb489 !important;
}

.note-widget .submit-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2e9c73 100%) !important;
    color: #fff !important;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 14px rgba(62, 180, 137, 0.4);
    transition: transform 0.15s ease, filter 0.2s ease;
}

.note-widget .submit-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
}
</style>
