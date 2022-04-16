<!-- @format -->
<template>
    <div class="notes-view">
        <button class="add-btn" @click="openNoteModal">Add New Note</button>
        <div class="notes-container">
            <div v-for="note in notes" :key="note.id">
                <character-matchup-note :note="note" v-if="note.type === 'Character Matchup'" />
                <character-note :note="note" v-if="note.type === 'Character'" />
                <player-note :note="note" v-if="note.type === 'Player'" />
                <game-note :note="note" v-if="note.type === 'Game'" />
            </div>
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
    },
};
</script>

<style>
.notes-view {
    padding-top: 50px;
    min-width: 600px;
}

.notes-view .add-btn {
    background: #3eb489;
    color: #fff;
    padding: 5px 15px;
    border-radius: 5px;
    font-size: 20px;
}

.notes-view .notes-container {
    margin-top: 40px;
}

.notes-view .character-matchup-note,
.notes-view .character-note,
.notes-view .player-note,
.notes-view .game-note {
    margin-bottom: 10px;
}
</style>
