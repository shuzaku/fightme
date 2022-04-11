<!-- @format -->
<template>
    <div class="character-moves">
        <loading v-if="isLoading"></loading>
        <div v-else class="move-container">
            <div class="move-box" :style="boxStyle" @click="toggleMoveList()">
                <div class="heading">
                    <h2>MoveList</h2>
                </div>
            </div>
            <table v-if="showMoveList">
                <tr>
                    <th>Name</th>
                    <th>Command</th>
                    <th>Damage</th>
                    <th>Guard</th>
                    <th>Startup</th>
                    <th>Active</th>
                    <th>Recovery</th>
                    <th>On Block</th>
                    <th>Invuln</th>
                </tr>
                <tr v-for="move in moves" :key="move.id">
                    <td>{{ move.name }}</td>
                    <td>{{ move.command }}</td>
                    <td>{{ move.damage }}</td>
                    <td>{{ move.guard }}</td>
                    <td>{{ move.startUp }}</td>
                    <td>{{ move.active }}</td>
                    <td>{{ move.recovery }}</td>
                    <td>{{ move.onBlock }}</td>
                    <td>{{ move.invulnerability }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import MovesService from '@/services/moves-service';
import Loading from '@/components/common/loading';

export default {
    name: 'CharacterMoves',
    components: {
        loading: Loading,
    },
    props: {
        characterId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            isLoading: false,
            moves: null,
            showMoveList: false,
        };
    },

    computed: {},

    watch: {},

    created() {
        this.getMoves();
    },

    methods: {
        async getMoves() {
            this.isLoading = true;
            const response = await MovesService.getCharacterMoves({
                id: this.characterId,
            });

            this.moves = this.hydrateMoves(response.data.moves);
            this.isLoading = false;
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
                    recoveryaa: move.Recovery,
                    startUp: move.StartUp,
                    active: move.Active,
                    invulnerability: move.Invulnerability,
                };
            });
        },

        toggleMoveList() {
            this.showMoveList = !this.showMoveList;
        },
    },
};
</script>

<style type="text/css">
.character-moves {
    color: #fff;
}

.character-moves table tr:nth-child(odd) {
    background: #4447e2;
}

.character-moves table td {
    border: none;
    padding: 5px;
}

.character-moves .move-box {
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
    background: #4447e2;
}
</style>
