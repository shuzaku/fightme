<!-- @format -->
<template>
    <div class="character-move-list">
        <multiselect
            v-if="moves"
            v-model="selectedMoves"
            :options="moves"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            track-by="name"
            label="name"
            :placeholder="'Select Move'"
        >
        </multiselect>
        <div v-if="selectedMoves" class="table-container">
            <table v-for="move in selectedMoves" :key="move.id">
                <tr>
                    <td class="label">Name</td>
                    <td class="value">{{ move.name }}</td>
                </tr>
                <tr>
                    <td class="label">Command</td>
                    <td class="value">{{ move.command }}</td>
                </tr>
                <tr>
                    <td class="label">Damage</td>
                    <td class="value">{{ move.damage }}</td>
                </tr>
                <tr>
                    <td class="label">Guard</td>
                    <td class="value">{{ move.guard }}</td>
                </tr>
                <tr>
                    <td class="label">Startup</td>
                    <td class="value">{{ move.startUp }}</td>
                </tr>
                <tr>
                    <td class="label">Active</td>
                    <td class="value">{{ move.active }}</td>
                </tr>
                <tr>
                    <td class="label">Recovery</td>
                    <td class="value">{{ move.recovery }}</td>
                </tr>
                <tr>
                    <td class="label">On Block</td>
                    <td class="value">{{ move.onBlock }}</td>
                </tr>
                <tr>
                    <td class="label">Invulnability</td>
                    <td class="value">{{ move.invulnerability }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import MovesService from '@/services/moves-service';

export default {
    name: 'CharacterMoveList',
    props: {
        characterId: {
            type: String,
            default: null,
        },
        value: {
            type: Array,
            default: null,
        },
    },

    data() {
        return {
            moves: [],
            selectedMoves: null,
        };
    },

    watch: {
        gameId() {
            this.getMoves();
        },
    },

    mounted() {
        this.getMoves();
    },

    methods: {
        async getMoves() {
            this.isLoading = true;
            const response = await MovesService.getCharacterMoves({
                id: this.characterId,
            });

            this.moves = this.hydrateMoves(response.data.moves);
        },

        hydrateMoves(response) {
            return response.map((move) => {
                return {
                    id: move._id,
                    name: move.MoveName,
                    previousCommand: move.PreviousCommand,
                    command: move.Command,
                    damage: move.Damage,
                    guard: move.Guard,
                    onBlock: move.OnBlock,
                    recovery: move.Recovery,
                    startUp: move.StartUp,
                    active: move.Active,
                    invulnerability: move.Invulnerability,
                };
            });
        },
    },
};
</script>
<style type="text/css">
.character-move-list table {
    margin-top: 10px;
}

.character-move-list table td {
    text-align: left;
    border: 1px solid #000;
    padding: 2px 10px;
    height: 24px;
    text-transform: lowercase;
}

.character-move-list table .label {
    font-weight: 600;
    text-transform: capitalize;
}

.character-move-list table .value {
    text-align: center;
    width: 180px;
}

.character-move-list .multiselect__option::after {
    display: none;
}
</style>
