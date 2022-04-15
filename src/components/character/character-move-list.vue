<!-- @format -->
<template>
    <div class="character-move-list">
        <multiselect
            v-if="moves"
            v-model="selectedMove"
            :options="moves"
            :multiple="false"
            :close-on-select="true"
            :clear-on-select="true"
            :preserve-search="true"
            :taggable="false"
            label="name"
            :placeholder="'Select Move'"
            @input="setMoves($event)"
        >
            <template slot="singleLabel" slot-scope="props">
                <span class="option__name">{{ props.option.name }}</span>
            </template>
            <template slot="option" slot-scope="props">
                <div class="option__desc">
                    <span class="option__name">{{ props.option.name }}</span>
                </div>
            </template>
        </multiselect>

        <table v-if="selectedMove">
            <tr>
                <td class="label">Name</td>
                <td class="value">{{ selectedMove.name }}</td>
            </tr>
            <tr>
                <td class="label">Command</td>
                <td class="value">{{ selectedMove.command }}</td>
            </tr>
            <tr>
                <td class="label">Damage</td>
                <td class="value">{{ selectedMove.damage }}</td>
            </tr>
            <tr>
                <td class="label">Guard</td>
                <td class="value">{{ selectedMove.guard }}</td>
            </tr>
            <tr>
                <td class="label">Startup</td>
                <td class="value">{{ selectedMove.startUp }}</td>
            </tr>
            <tr>
                <td class="label">Active</td>
                <td class="value">{{ selectedMove.active }}</td>
            </tr>
            <tr>
                <td class="label">Recovery</td>
                <td class="value">{{ selectedMove.recovery }}</td>
            </tr>
            <tr>
                <td class="label">On Block</td>
                <td class="value">{{ selectedMove.onBlock }}</td>
            </tr>
            <tr>
                <td class="label">Invuln</td>
                <td class="value">{{ selectedMove.invulnerability }}</td>
            </tr>
        </table>
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
            selectedMove: null,
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
        setMoves() {
            this.$emit('update:move', this.selectedMoves);
        },

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
}

.character-move-list table .value {
    text-align: center;
}
</style>
