<!-- @format -->
<template>
    <div class="notes-view">
        <div class="notes-header">
            <h1 class="notes-title">My Notes</h1>
            <button class="add-btn" @click="openNoteModal">
                <span class="add-btn-icon">+</span>
                Add New Note
            </button>
        </div>
        <div v-if="notes && notes.length" class="notes-container">
            <div v-for="note in notes" :key="note.id">
                <character-matchup-note
                    v-if="note.type === 'Character Matchup'"
                    :note="note"
                    @edit:note="editNote($event)"
                    @delete:note="deleteNote($event)"
                />
                <character-note
                    v-if="note.type === 'Character'"
                    :note="note"
                    @edit:note="editNote($event)"
                    @delete:note="deleteNote($event)"
                />
                <player-note
                    v-if="note.type === 'Player'"
                    :note="note"
                    @edit:note="editNote($event)"
                    @delete:note="deleteNote($event)"
                />
                <game-note
                    v-if="note.type === 'Game'"
                    :note="note"
                    @edit:note="editNote($event)"
                    @delete:note="deleteNote($event)"
                />
            </div>
        </div>
        <div v-else-if="notes" class="notes-empty">
            <div class="notes-empty-icon">📝</div>
            <p>You don't have any notes yet.</p>
            <span>Tap “Add New Note” to capture your first matchup insight.</span>
        </div>
    </div>
</template>

<script>
import NotesService from '@/services/notes-service';
import CharacterMatchupNote from '@/components/note/character-matchup-note';
import CharacterNote from '@/components/note/character-note';
import PlayerNote from '@/components/note/player-note';
import GameNote from '@/components/note/game-note';

import { eventbus } from '@/main';

export default {
    name: 'Notes',

    components: {
        'character-matchup-note': CharacterMatchupNote,
        'character-note': CharacterNote,
        'player-note': PlayerNote,
        'game-note': GameNote,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            notes: null,
        };
    },

    watch: {},

    mounted() {
        this.queryNotes();
        eventbus.$on('note:update', this.queryNotes);
    },

    beforeDestroy() {
        eventbus.$off('note:update', this.queryNotes);
    },

    methods: {
        async queryNotes() {
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'AuthorId',
                        queryValue: this.account.id,
                    },
                ],
            };

            const response = await NotesService.queryNotes(queryParameter);
            this.notes = this.hydrateNotes(response.data.notes);
            this.isLoading = false;
        },

        hydrateNotes(notes) {
            return notes.map((note) => {
                return {
                    id: note._id,
                    type: note.Type,
                    target1: note.Target1,
                    target2: note.Target2,
                    content: note.Content,
                    authorId: note.AuthorId,
                    heading: note.Heading,
                    gameId: note.GameId,
                };
            });
        },

        openNoteModal() {
            var option = {
                name: 'note',
                value: 'note',
            };

            eventbus.$emit('open:widget', option);
        },

        editNote(id) {
            eventbus.$emit('open:widget', {
                name: 'note',
                value: 'note',
                noteId: id,
            });
        },

        async deleteNote(id) {
            await NotesService.deleteNote(id);
            eventbus.$emit('note:update');
        },
    },
};
</script>

<style>
.notes-view {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 200px;
    min-width: 600px;
}

.notes-view .notes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 18px;
    margin-bottom: 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.notes-view .notes-title {
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
}

.notes-view .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #3eb489 0%, #2e9c73 100%);
    color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 17px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(62, 180, 137, 0.35);
    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.notes-view .add-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
    box-shadow: 0 6px 18px rgba(62, 180, 137, 0.45);
}

.notes-view .add-btn:active {
    transform: translateY(0);
}

.notes-view .add-btn-icon {
    font-size: 22px;
    line-height: 1;
    font-weight: 700;
}

.notes-view .notes-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.notes-view .notes-empty {
    text-align: center;
    color: #9a9aa6;
    padding: 80px 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 14px;
}

.notes-view .notes-empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.notes-view .notes-empty p {
    color: #e8e8ea;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 6px;
}

.notes-view .notes-empty span {
    font-size: 14px;
}
</style>
