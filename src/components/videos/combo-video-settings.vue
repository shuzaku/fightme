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
                    <v-textarea v-model="combo.inputs" dark placeholder="Combo Inputs" />
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

export default {
    name: 'MatchVideoSettings',

    components: {
        'character-search': CharacterSearch,
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
        };
    },

    computed: {},

    mounted() {},

    methods: {
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
