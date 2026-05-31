<!-- @format -->
<template>
    <div class="montage-step">
        <div class="players-container">
            <h3>Players</h3>
            <player-search @update:player="addPlayerToMontage($event)" />
            <div v-if="montage.players.length" class="montage-tags">
                <span
                    v-for="playerId in montage.players"
                    :key="playerId"
                    class="montage-tag"
                >
                    {{ playerLabel(playerId) }}
                    <button type="button" class="montage-tag-remove" @click="removePlayer(playerId)">
                        ×
                    </button>
                </span>
            </div>
        </div>
        <div class="character-container">
            <h3>Characters</h3>
            <character-search
                :gameId="gameId"
                :multiple="true"
                :value="montageCharacterIds"
                placeHolder="Search characters in this montage"
                @update:character="setMontageCharacters($event)"
            />
        </div>
    </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search';
import PlayerSearch from '@/components/players/player-search';

export default {
    name: 'MontageVideoSettings',

    components: {
        'character-search': CharacterSearch,
        'player-search': PlayerSearch,
    },

    props: {
        gameId: {
            type: String,
            default: null,
        },
        montage: {
            type: Object,
            default: () => ({
                type: null,
                players: [],
                characters: [],
            }),
        },
    },

    data() {
        return {
            playerNames: {},
        };
    },

    computed: {
        montageCharacterIds() {
            return (this.montage.characters || []).map((c) => c.id).filter(Boolean);
        },
    },

    methods: {
        emitUpdate() {
            this.$emit('update:montage', {
                type: this.montage.type,
                players: [...this.montage.players],
                characters: [...this.montage.characters],
            });
        },

        addPlayerToMontage(player) {
            if (!player || !player.id) return;
            this.playerNames[player.id] = player.playerName || player.name || 'Player';
            if (!this.montage.players.includes(player.id)) {
                this.montage.players.push(player.id);
            }
            this.emitUpdate();
        },

        removePlayer(playerId) {
            this.montage.players = this.montage.players.filter((id) => id !== playerId);
            this.emitUpdate();
        },

        setMontageCharacters(characters) {
            const list = Array.isArray(characters) ? characters : characters ? [characters] : [];
            this.montage.characters = list
                .filter((c) => c && c.id)
                .map((c) => ({ id: c.id, name: c.name }));
            this.emitUpdate();
        },

        playerLabel(playerId) {
            return this.playerNames[playerId] || 'Player';
        },
    },
};
</script>

<style type="text/css">
.montage-step h3 {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 10px;
}

.montage-step .montage-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.montage-step .montage-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(62, 180, 137, 0.2);
    color: #fff;
    font-size: 12px;
}

.montage-step .montage-tag-remove {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
}
</style>
