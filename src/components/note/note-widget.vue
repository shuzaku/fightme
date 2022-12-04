<!-- @format -->
<template>
    <div class="note-widget">
        <h1>{{ title }}</h1>
        <loading v-if="isLoading"></loading>
        <div v-else class="note-widget-container">
            <label>Type:</label>
            <multiselect
                v-model="note.selectedType"
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
                <input v-model="note.heading" type="text" />
                <label>Content:</label>
                <quill-editor ref="myQuillEditor" v-model="note.noteContent" />
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
    components: {
        'game-search': GameSearch,
        'character-search': CharacterSearch,
        'player-search': PlayerSearch,
        loading: Loading,
    },

    name: 'NewNote',

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
.note-widget.multiselect {
    margin: 5px 0 20px;
}

.note-widget .note-content {
    margin-bottom: 20px;
}
</style>
