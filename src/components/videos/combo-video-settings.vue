<!-- @format -->
<template>
    <div class="combos-container">
        <youtube-media
            :video-id="videoUrl"
            :player-width="400"
            :player-height="225"
            :player-vars="{ rel: 0 }"
        />
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
                    <v-textarea v-model="inputs" placeholder="Combo Inputs" />
                </div>
                <div class="combo-stats">
                    <div class="startTime input-container">
                        <v-text-field
                            v-model="combo.startTime"
                            type="Number"
                            placeholder="Start Time"
                        />
                    </div>
                    <div class="endTime input-container">
                        <v-text-field
                            v-model="combo.endTime"
                            type="Number"
                            placeholder="End Time"
                        />
                    </div>
                    <div class="damage input-container">
                        <v-text-field
                            v-model="combo.damage"
                            class="damage"
                            type="Number"
                            placeholder="Damage"
                        />
                    </div>
                    <div class="hits input-container">
                        <v-text-field
                            v-model="combo.hits"
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
    },

    data() {
        return {
            combos: [
                {
                    id: '',
                    characterId: '',
                    damage: '',
                    hits: '',
                    inputs: '',
                    startTime: '',
                    endTime: '',
                    note: '',
                    isExpanded: true,
                },
            ],
        };
    },

    computed: {},

    watch: {
        combos() {
            this.$emit('update:combo', this.match);
        },
    },

    mounted() {},

    methods: {
        expandComboMenu(index) {
            this.combos.forEach((combo) => (combo.isExpanded = false));
            this.combos[index].isExpanded = true;
        },

        setComboCharacter(characterId, target) {
            target.characterId = characterId;
        },

        addCombo(index) {
            if (!this.combos[index].inputs) {
                this.showErrorMessage = true;
            } else {
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
            }
        },
    },
};
</script>

<style type="text/css"></style>
