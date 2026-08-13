<!-- @format -->
<template>
    <div class="combos-container">
        <div v-for="(combo, index) in combos" :key="index" class="combo">
            <div class="combo-title" @click="expandComboMenu(index)">
                <h3>Combo {{ index + 1 }}</h3>
            </div>
            <div v-show="combo.isExpanded" class="combo-container">
                <div v-if="showErrorMessage" class="error-container">
                    <p class="error-msg">Please finish this combo before adding a new one.</p>
                </div>
                <div class="character-container">
                    <character-search
                        v-model="combo.characterId"
                        :gameId="gameId"
                        @update:character="setComboCharacter($event, combo)"
                    />
                </div>
                <div class="inputs-container">
                    <combo-notation-input
                        v-model="combo.inputs"
                        :gameId="gameId"
                        :gameAbbreviation="gameAbbreviation"
                    />
                </div>
                <div class="combo-stats">
                    <div class="startTime input-container">
                        <v-text-field v-model="combo.startTime" dark placeholder="Start Time" />
                    </div>
                    <div class="endTime input-container">
                        <v-text-field v-model="combo.endTime" dark placeholder="End Time" />
                    </div>
                    <div class="damage input-container">
                        <v-text-field
                            v-model="combo.damage"
                            dark
                            class="damage"
                            type="Number"
                            placeholder="Damage"
                        />
                    </div>
                    <div class="hits input-container">
                        <v-text-field
                            v-model="combo.hits"
                            dark
                            class="hits"
                            placeholder="Hits"
                            type="Number"
                        />
                    </div>
                </div>

                <v-btn class="add-combo-btn" rounded @click="addCombo(index)">Add More Combo</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search';
import ComboNotationInput from '@/components/notation/combo-notation-input';
import GamesService from '@/services/games-service';

export default {
    name: 'MatchVideoSettings',

    components: {
        'character-search': CharacterSearch,
        'combo-notation-input': ComboNotationInput,
    },

    props: {
        gameId: {
            type: String,
            default: null,
        },

        videoUrl: {
            type: String,
            default: null,
        },

        combos: {
            type: Array,
            default: null,
        },
    },

    data() {
        return {
            showErrorMessage: null,
            // Looked up whenever gameId changes so the notation builder can
            // show the right per-game attack buttons (SF6, GGST, 2XKO, ...).
            // Covers manual game selection as well as forms that arrive
            // pre-filled or in edit mode, where gameId is set without the
            // game-search dropdown ever emitting `update:game`.
            gameAbbreviation: null,
        };
    },

    computed: {},

    watch: {
        gameId: {
            immediate: true,
            handler(newGameId) {
                this.loadGameAbbreviation(newGameId);
            },
        },
    },

    mounted() {},

    methods: {
        async loadGameAbbreviation(gameId) {
            if (!gameId) {
                this.gameAbbreviation = null;
                return;
            }
            try {
                const response = await GamesService.getGame({ id: gameId });
                this.gameAbbreviation = response.data ? response.data.Abbreviation : null;
            } catch (error) {
                console.error('Error loading game for combo notation:', error);
                this.gameAbbreviation = null;
            }
        },

        expandComboMenu(index) {
            this.combos.forEach((combo) => (combo.isExpanded = false));
            this.combos[index].isExpanded = true;
        },

        setComboCharacter(character, target) {
            target.characterId = [];
            target.characterId.push(character.id);
        },

        addCombo(index) {
            this.combos[index].isExpanded = false;
            this.combos.push({
                id: '',
                characterId: '',
                damage: '',
                hits: '',
                inputs: '',
                startTime: '',
                endTime: '',
                isExpanded: true,
                tags: [],
            });
        },
    },
};
</script>

<style type="text/css"></style>
