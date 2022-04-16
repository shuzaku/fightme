<!-- @format -->
<template>
    <div class="new-note">
        <h1>Add Note</h1>
        <label>Type:</label>
        <multiselect
            v-model="selectedType"
            :options="types"
            :searchable="false"
            :show-labels="false"
            placeholder="Select a type"
        >
        </multiselect>

        <label>Game:</label>
        <game-search v-model="selectedGame.name" @update:game="setSelectedGame($event)" />

        <div v-if="selectedType === 'Character' && selectedGame.id" class="character-note">
            <label>Character:</label>
            <character-search
                v-model="selectedCharacter"
                :gameId="selectedGame.id"
                @update:character="setSelectedCharacter($event)"
            />
        </div>

        <div v-if="selectedType === 'Player'" class="player-note">
            <label>Player:</label>
            <player-search v-model="selectedCharacter" @update:player="setSelectedPlayer($event)" />
        </div>

        <div v-if="selectedType === 'Character Matchup' && selectedGame.id" class="matchup-note">
            <label>Character:</label>
            <character-search
                v-model="selectedCharacter"
                :gameId="selectedGame.id"
                @update:character="setSelectedCharacter($event)"
            />

            <label>Opposing Character:</label>
            <character-search
                v-model="selectedCharacter"
                :gameId="selectedGame.id"
                @update:character="setSelectedOpposingCharacter($event)"
            />
        </div>

        <div class="note-content">
            <label>Heading:</label>
            <input type="text" v-model="heading" />
            <label>Content:</label>
            <quill-editor ref="myQuillEditor" v-model="noteContent" :options="editorOption" />
        </div>

        <v-btn class="submit-btn" rounded @click="addNote()">Add Note</v-btn>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import CharacterSearch from '@/components/character/character-search';
import PlayerSearch from '@/components/players/player-search';
import NotesService from '@/services/notes-service';

export default {
    components: {
        'game-search': GameSearch,
        'character-search': CharacterSearch,
        'player-search': PlayerSearch,
    },

    name: 'NewNote',

    data() {
        return {
            types: ['Player', 'Character', 'Character Matchup', 'Game'],
            selectedType: null,
            selectedGame: {
                name: null,
                value: null,
            },
            selectedCharacter: {
                id: null,
                value: null,
            },
            selectedOpposingCharacter: {
                id: null,
                value: null,
            },
            selectedPlayer: {
                id: null,
                value: null,
            },
            noteContent: null,
            heading: '',
        };
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    methods: {
        setSelectedGame(game) {
            this.selectedGame = game;
        },

        setSelectedCharacter(character) {
            this.selectedCharacter = character;
        },

        setSelectedPlayer(player) {
            this.selectedPlayer = player;
        },

        setSelectedOpposingCharacter(character) {
            this.selectedOpposingCharacter = character;
        },

        async addNote() {
            var target1;
            var target2;

            switch (this.selectedType) {
                case 'Game':
                    target1 = this.selectedGame.id;
                    break;
                case 'Player':
                    target1 = this.selectedPlayer.id;
                    break;
                case 'Character':
                    target1 = this.selectedCharacter.id;
                    break;
                case 'Character Matchup':
                    target1 = this.selectedCharacter.id;
                    target2 = this.selectedOpposingCharacter.id;
                    break;
            }

            var response = await NotesService.addNote({
                Type: this.selectedType,
                Target1: target1,
                Target2: target2,
                Heading: this.heading,
                Content: this.noteContent,
                AuthorId: this.account.id,
                GameId: this.selectedGame.id,
            });

            if (!response.data.err) {
                this.$emit('closeModal');
            }
        },
    },
};
</script>
<style type="text/css">
.new-note .multiselect {
    margin: 5px 0 20px;
}
</style>
