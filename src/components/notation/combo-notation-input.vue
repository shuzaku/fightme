<!-- @format -->
<template>
    <div class="combo-notation-input">
        <div class="notation-header">
            <h3>Combo Notation</h3>
            <div class="input-mode-toggle">
                <v-btn
                    small
                    :class="{ active: inputMode === 'text' }"
                    @click="inputMode = 'text'"
                >
                    <i class="fas fa-keyboard"></i> Text
                </v-btn>
                <v-btn
                    small
                    :class="{ active: inputMode === 'icons' }"
                    @click="inputMode = 'icons'"
                >
                    <i class="fas fa-gamepad"></i> Icons
                </v-btn>
            </div>
        </div>

        <!-- Text Input Mode -->
        <div v-if="inputMode === 'text'" class="text-input-container">
            <v-textarea
                dark
                v-model="notationText"
                placeholder="Enter combo notation (e.g., 2M > 5H > 236S)"
                rows="3"
                @input="updateNotation"
            />
        </div>

        <!-- Icon Input Mode -->
        <div v-if="inputMode === 'icons'" class="icon-input-container">
            <div class="notation-display">
                <div class="current-notation">
                    <span v-if="notationArray.length === 0" class="placeholder"
                        >Click buttons to build combo</span
                    >
                    <div 
                        v-for="(item, index) in notationArray" 
                        :key="index" 
                        class="notation-item"
                        :class="{ 'link-separator': item === '>' }"
                    >
                        <img
                            v-if="getNotationIcon(item)"
                            :src="getNotationIcon(item)"
                            :alt="item"
                            class="notation-icon"
                        />
                        <span class="notation-text">{{ item }}</span>
                        <v-icon small @click="removeNotationItem(index)" class="remove-btn"
                            >mdi-close</v-icon
                        >
                    </div>
                </div>
            </div>

            <!-- Quick Add Link Button -->
            <div class="quick-link-button-container">
                <button
                    class="quick-link-btn"
                    @click="addNotation('>')"
                    title="Add Link (New Input)"
                >
                    <i class="fas fa-arrow-right"></i>
                    <span>Add Link</span>
                </button>
            </div>

            <div class="notation-buttons">
                <!-- Movement Buttons -->
                <div class="button-group">
                    <h4>Movement</h4>
                    <div class="movement-grid">
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('7')"
                            title="Up-Back"
                        >
                            <img v-if="arrowIcons['7']" :src="arrowIcons['7']" alt="7" />
                            <span v-else>7</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('8')"
                            title="Up"
                        >
                            <img v-if="arrowIcons['8']" :src="arrowIcons['8']" alt="8" />
                            <span v-else>8</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('9')"
                            title="Up-Forward"
                        >
                            <img v-if="arrowIcons['9']" :src="arrowIcons['9']" alt="9" />
                            <span v-else>9</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('4')"
                            title="Back"
                        >
                            <img v-if="arrowIcons['4']" :src="arrowIcons['4']" alt="4" />
                            <span v-else>4</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('5')"
                            title="Neutral"
                        >
                            <span class="neutral-dot">•</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('6')"
                            title="Forward"
                        >
                            <img v-if="arrowIcons['6']" :src="arrowIcons['6']" alt="6" />
                            <span v-else>6</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('1')"
                            title="Down-Back"
                        >
                            <img v-if="arrowIcons['1']" :src="arrowIcons['1']" alt="1" />
                            <span v-else>1</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('2')"
                            title="Down"
                        >
                            <img v-if="arrowIcons['2']" :src="arrowIcons['2']" alt="2" />
                            <span v-else>2</span>
                        </button>
                        <button
                            class="notation-btn icon-btn"
                            @click="addNotation('3')"
                            title="Down-Forward"
                        >
                            <img v-if="arrowIcons['3']" :src="arrowIcons['3']" alt="3" />
                            <span v-else>3</span>
                        </button>
                    </div>
                </div>

                <!-- Attack Buttons -->
                <div class="button-group">
                    <h4>Attacks</h4>
                    <div v-if="availableAttacks.length === 0" class="no-game-selected">
                        <p>Select a game to see attack buttons</p>
                    </div>
                    <div v-else class="attack-buttons">
                        <button
                            v-for="attack in availableAttacks"
                            :key="attack.key"
                            class="notation-btn attack icon-btn"
                            @click="addNotation(attack.notation)"
                            :title="attack.label"
                        >
                            <img
                                v-if="attackIcons[attack.key]"
                                :src="attackIcons[attack.key]"
                                :alt="attack.label"
                            />
                            <span class="button-label">{{ attack.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Motion Inputs -->
                <div class="button-group">
                    <h4>Motions</h4>
                    <div class="motion-buttons">
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('qcf')"
                            title="Quarter Circle Forward"
                        >
                            <img
                                v-if="motionIcons.qcf"
                                :src="motionIcons.qcf"
                                alt="qcf"
                            />
                            <span v-else>qcf</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('qcb')"
                            title="Quarter Circle Back"
                        >
                            <img
                                v-if="motionIcons.qcb"
                                :src="motionIcons.qcb"
                                alt="qcb"
                            />
                            <span v-else>qcb</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('dp')"
                            title="Dragon Punch"
                        >
                            <img
                                v-if="motionIcons.dp"
                                :src="motionIcons.dp"
                                alt="dp"
                            />
                            <span v-else>dp</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('421')"
                            title="Half Circle"
                        >
                            <img
                                v-if="motionIcons['421']"
                                :src="motionIcons['421']"
                                alt="421"
                            />
                            <span v-else>421</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('360')"
                            title="360"
                        >
                            <img
                                v-if="motionIcons['360']"
                                :src="motionIcons['360']"
                                alt="360"
                            />
                            <span v-else>360</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('r360')"
                            title="Reverse 360"
                        >
                            <img
                                v-if="motionIcons.r360"
                                :src="motionIcons.r360"
                                alt="r360"
                            />
                            <span v-else>r360</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('180f')"
                            title="180 Forward"
                        >
                            <img
                                v-if="motionIcons['180f']"
                                :src="motionIcons['180f']"
                                alt="180f"
                            />
                            <span v-else>180f</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('180b')"
                            title="180 Back"
                        >
                            <img
                                v-if="motionIcons['180b']"
                                :src="motionIcons['180b']"
                                alt="180b"
                            />
                            <span v-else>180b</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('hold back')"
                            title="Hold Back"
                        >
                            <img
                                v-if="motionIcons['hold back']"
                                :src="motionIcons['hold back']"
                                alt="hold back"
                            />
                            <span v-else>hold back</span>
                        </button>
                        <button
                            class="notation-btn motion icon-btn"
                            @click="addNotation('hold down')"
                            title="Hold Down"
                        >
                            <img
                                v-if="motionIcons['hold down']"
                                :src="motionIcons['hold down']"
                                alt="hold down"
                            />
                            <span v-else>hold down</span>
                        </button>
                    </div>
                </div>

                <!-- Special Inputs -->
                <div class="button-group">
                    <h4>Special</h4>
                    <div class="special-buttons">
                        <button
                            class="notation-btn special"
                            @click="addNotation('CH')"
                            title="Counter Hit"
                        >
                            CH
                        </button>
                        <button
                            class="notation-btn special"
                            @click="addNotation('c.')"
                            title="Crouching"
                        >
                            c.
                        </button>
                        <button
                            class="notation-btn special"
                            @click="addNotation('j.')"
                            title="Jumping"
                        >
                            j.
                        </button>
                        <button
                            class="notation-btn special"
                            @click="addNotation('+')"
                            title="Plus"
                        >
                            +
                        </button>
                        <button
                            class="notation-btn special"
                            @click="addNotation('>')"
                            title="Link"
                        >
                            &gt;
                        </button>
                        <button
                            class="notation-btn special"
                            @click="addNotation('j.c')"
                            title="Jump Cancel"
                        >
                            j.c
                        </button>
                        <button
                            class="notation-btn special icon-btn"
                            @click="addNotation('dash')"
                            title="Dash"
                        >
                            <img
                                v-if="specialIcons.dash"
                                :src="specialIcons.dash"
                                alt="dash"
                            />
                            <span v-else>dash</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Import all icons at the top level for webpack bundling
import arrow1 from '@/assets/icons/inputs/arrows/1.png';
import arrow2 from '@/assets/icons/inputs/arrows/2.png';
import arrow3 from '@/assets/icons/inputs/arrows/3.png';
import arrow4 from '@/assets/icons/inputs/arrows/4.png';
import arrow6 from '@/assets/icons/inputs/arrows/6.png';
import arrow7 from '@/assets/icons/inputs/arrows/7.png';
import arrow8 from '@/assets/icons/inputs/arrows/8.png';
import arrow9 from '@/assets/icons/inputs/arrows/9.png';

// SF6 icons
import sf6Lp from '@/assets/icons/inputs/sf6/lp.png';
import sf6Mp from '@/assets/icons/inputs/sf6/mp.png';
import sf6Hp from '@/assets/icons/inputs/sf6/hp.png';
import sf6Lk from '@/assets/icons/inputs/sf6/lk.png';
import sf6Mk from '@/assets/icons/inputs/sf6/mk.png';
import sf6Hk from '@/assets/icons/inputs/sf6/hk.png';

// GGST icons
import ggstP from '@/assets/icons/inputs/ggst/P.png';
import ggstK from '@/assets/icons/inputs/ggst/K.png';
import ggstS from '@/assets/icons/inputs/ggst/S.png';
import ggstHS from '@/assets/icons/inputs/ggst/HS.png';
import ggstD from '@/assets/icons/inputs/ggst/D.png';

// 2XKO icons
import xko2H from '@/assets/icons/inputs/2xko/H.png';
import xko2L from '@/assets/icons/inputs/2xko/L.png';
import xko2M from '@/assets/icons/inputs/2xko/M.png';
import xko2S1 from '@/assets/icons/inputs/2xko/S1.png';
import xko2S2 from '@/assets/icons/inputs/2xko/s2.png';
import xko2T from '@/assets/icons/inputs/2xko/T.png';

// COTW icons
import cotwA from '@/assets/icons/inputs/cotw/a.png';
import cotwB from '@/assets/icons/inputs/cotw/b.png';
import cotwBr from '@/assets/icons/inputs/cotw/br.png';
import cotwC from '@/assets/icons/inputs/cotw/c.png';
import cotwD from '@/assets/icons/inputs/cotw/d.png';
import cotwFe from '@/assets/icons/inputs/cotw/fe.png';
import cotwRev from '@/assets/icons/inputs/cotw/rev.png';

// GBVSR icons
import gbvsrH from '@/assets/icons/inputs/gbvsr/H.png';
import gbvsrL from '@/assets/icons/inputs/gbvsr/L.png';
import gbvsrM from '@/assets/icons/inputs/gbvsr/M.png';
import gbvsrU from '@/assets/icons/inputs/gbvsr/U.png';

// T8 icons (Tekken 8) - All available button combinations
import t8_1 from '@/assets/icons/inputs/t8/1.png';
import t8_2 from '@/assets/icons/inputs/t8/2.png';
import t8_3 from '@/assets/icons/inputs/t8/3.png';
import t8_4 from '@/assets/icons/inputs/t8/4.png';
import t8_12 from '@/assets/icons/inputs/t8/12.png';
import t8_13 from '@/assets/icons/inputs/t8/13.png';
import t8_14 from '@/assets/icons/inputs/t8/14.png';
import t8_23 from '@/assets/icons/inputs/t8/23.png';
import t8_24 from '@/assets/icons/inputs/t8/24.png';
import t8_34 from '@/assets/icons/inputs/t8/34.png';

// Motion inputs - using all available directional icons
import qcf from '@/assets/icons/inputs/directional/qcf.png';
import qcb from '@/assets/icons/inputs/directional/qcb.png';
import dp from '@/assets/icons/inputs/directional/dp.png';
import motion421 from '@/assets/icons/inputs/directional/421.png';
import motion360 from '@/assets/icons/inputs/directional/360.png';
import r360 from '@/assets/icons/inputs/directional/r360.png';
import motion180f from '@/assets/icons/inputs/directional/180f.png';
import motion180b from '@/assets/icons/inputs/directional/180b.png';
import holdBack from '@/assets/icons/inputs/directional/hold back.png';
import holdDownIcon from '@/assets/icons/inputs/directional/hold down.png';

// Special inputs
import dashIcon from '@/assets/icons/inputs/ggst/dash.png';

export default {
    name: 'ComboNotationInput',

    props: {
        value: {
            type: String,
            default: '',
        },
        gameId: {
            type: String,
            default: null,
        },
        gameAbbreviation: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            inputMode: 'text',
            notationText: '',
            notationArray: [],
            // Icon mappings using imported images
            arrowIcons: {
                '1': arrow1,
                '2': arrow2,
                '3': arrow3,
                '4': arrow4,
                '6': arrow6,
                '7': arrow7,
                '8': arrow8,
                '9': arrow9,
            },
            // All game-specific icon sets
            allGameIcons: {
                sf6: {
                    lp: sf6Lp,
                    mp: sf6Mp,
                    hp: sf6Hp,
                    lk: sf6Lk,
                    mk: sf6Mk,
                    hk: sf6Hk,
                },
                ggst: {
                    P: ggstP,
                    K: ggstK,
                    S: ggstS,
                    HS: ggstHS,
                    D: ggstD,
                },
                '2xko': {
                    H: xko2H,
                    L: xko2L,
                    M: xko2M,
                    S1: xko2S1,
                    S2: xko2S2,
                    T: xko2T,
                },
                cotw: {
                    a: cotwA,
                    b: cotwB,
                    br: cotwBr,
                    c: cotwC,
                    d: cotwD,
                    fe: cotwFe,
                    rev: cotwRev,
                },
                gbvsr: {
                    H: gbvsrH,
                    L: gbvsrL,
                    M: gbvsrM,
                    U: gbvsrU,
                },
                t8: {
                    '1': t8_1,
                    '2': t8_2,
                    '3': t8_3,
                    '4': t8_4,
                    '12': t8_12,
                    '13': t8_13,
                    '14': t8_14,
                    '23': t8_23,
                    '24': t8_24,
                    '34': t8_34,
                },
            },
            motionIcons: {
                qcf: qcf,
                qcb: qcb,
                dp: dp,
                '421': motion421,
                '360': motion360,
                r360: r360,
                '180f': motion180f,
                '180b': motion180b,
                'hold back': holdBack,
                'hold down': holdDownIcon,
            },
            specialIcons: {
                dash: dashIcon,
            },
        };
    },

    computed: {
        // Get current game's attack icons based on abbreviation
        attackIcons() {
            if (!this.gameAbbreviation) {
                // Default to SF6 if no game selected
                return this.allGameIcons.sf6;
            }
            const abbrev = this.gameAbbreviation.toLowerCase();
            return this.allGameIcons[abbrev] || this.allGameIcons.sf6;
        },

        // Get available attack buttons for current game
        availableAttacks() {
            if (!this.gameAbbreviation) {
                return [];
            }
            const abbrev = this.gameAbbreviation.toLowerCase();
            
            // Map each game to its button set
            const gameButtonMap = {
                sf6: [
                    { key: 'lp', label: 'LP', notation: 'LP' },
                    { key: 'mp', label: 'MP', notation: 'MP' },
                    { key: 'hp', label: 'HP', notation: 'HP' },
                    { key: 'lk', label: 'LK', notation: 'LK' },
                    { key: 'mk', label: 'MK', notation: 'MK' },
                    { key: 'hk', label: 'HK', notation: 'HK' },
                ],
                ggst: [
                    { key: 'P', label: 'P', notation: 'P' },
                    { key: 'K', label: 'K', notation: 'K' },
                    { key: 'S', label: 'S', notation: 'S' },
                    { key: 'HS', label: 'HS', notation: 'HS' },
                    { key: 'D', label: 'D', notation: 'D' },
                ],
                '2xko': [
                    { key: 'H', label: 'H', notation: 'H' },
                    { key: 'L', label: 'L', notation: 'L' },
                    { key: 'M', label: 'M', notation: 'M' },
                    { key: 'S1', label: 'S1', notation: 'S1' },
                    { key: 'S2', label: 'S2', notation: 'S2' },
                    { key: 'T', label: 'T', notation: 'T' },
                ],
                cotw: [
                    { key: 'a', label: 'A', notation: 'A' },
                    { key: 'b', label: 'B', notation: 'B' },
                    { key: 'br', label: 'BR', notation: 'BR' },
                    { key: 'c', label: 'C', notation: 'C' },
                    { key: 'd', label: 'D', notation: 'D' },
                    { key: 'fe', label: 'FE', notation: 'FE' },
                    { key: 'rev', label: 'REV', notation: 'REV' },
                ],
                gbvsr: [
                    { key: 'H', label: 'H', notation: 'H' },
                    { key: 'L', label: 'L', notation: 'L' },
                    { key: 'M', label: 'M', notation: 'M' },
                    { key: 'U', label: 'U', notation: 'U' },
                ],
                t8: [
                    { key: '1', label: '1', notation: '1' },
                    { key: '2', label: '2', notation: '2' },
                    { key: '3', label: '3', notation: '3' },
                    { key: '4', label: '4', notation: '4' },
                    { key: '12', label: '12', notation: '12' },
                    { key: '13', label: '13', notation: '13' },
                    { key: '14', label: '14', notation: '14' },
                    { key: '23', label: '23', notation: '23' },
                    { key: '24', label: '24', notation: '24' },
                    { key: '34', label: '34', notation: '34' },
                ],
            };

            return gameButtonMap[abbrev] || gameButtonMap.sf6;
        },
    },

    watch: {
        value(newVal) {
            const currentString = this.inputMode === 'text' 
                ? this.notationText 
                : this.notationArray.join(' ');
            if (newVal !== currentString) {
                this.notationText = newVal;
                if (newVal) {
                    this.notationArray = newVal.split(' ').filter((item) => item.length > 0);
                } else {
                    this.notationArray = [];
                }
            }
        },
    },

    mounted() {
        if (this.value) {
            this.notationText = this.value;
            this.notationArray = this.value.split(' ').filter((item) => item.length > 0);
        }
    },

    methods: {
        getNotationIcon(notation) {
            // Check if it's a directional input (1-9)
            if (/^[1-9]$/.test(notation)) {
                return this.arrowIcons[notation] || null;
            }

            // Check if it's a motion input
            if (this.motionIcons && this.motionIcons[notation]) {
                return this.motionIcons[notation];
            }
            
            // Also check for numeric notation equivalents
            const motionInputs = {
                '236': 'qcf',
                '214': 'qcb',
                '623': 'dp',
                '41236': '421',
                '63214': '421',
            };
            if (motionInputs[notation] && this.motionIcons[motionInputs[notation]]) {
                return this.motionIcons[motionInputs[notation]];
            }

            // Check if it's a special input
            if (notation === 'dash' && this.specialIcons.dash) {
                return this.specialIcons.dash;
            }

            // Check if it's an attack button - use current game's icons
            if (this.attackIcons && this.attackIcons[notation]) {
                return this.attackIcons[notation];
            }
            
            // Try case-insensitive match
            const upperNotation = notation.toUpperCase();
            if (this.attackIcons && this.attackIcons[upperNotation]) {
                return this.attackIcons[upperNotation];
            }
            
            // Try lowercase match
            const lowerNotation = notation.toLowerCase();
            if (this.attackIcons && this.attackIcons[lowerNotation]) {
                return this.attackIcons[lowerNotation];
            }

            return null;
        },

        addNotation(notation) {
            this.notationArray.push(notation);
            this.updateNotation();
        },

        removeNotationItem(index) {
            this.notationArray.splice(index, 1);
            this.updateNotation();
        },

        updateNotation() {
            let notationString = '';
            if (this.inputMode === 'text') {
                notationString = this.notationText;
            } else {
                notationString = this.notationArray.join(' ');
            }
            this.$emit('input', notationString);
        },
    },
};
</script>

<style type="text/css" scoped>
.combo-notation-input {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.notation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notation-header h3 {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.input-mode-toggle {
    display: flex;
    gap: 8px;
}

.input-mode-toggle .v-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #ffffff90 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    min-width: 80px;
}

.input-mode-toggle .v-btn.active {
    background: #3eb489 !important;
    color: #fff !important;
    border-color: #3eb489 !important;
}

.text-input-container {
    margin-top: 16px;
}

.text-input-container >>> .v-textarea .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
}

.text-input-container >>> .v-textarea textarea {
    color: #fff !important;
}

.icon-input-container {
    margin-top: 16px;
}

.notation-display {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
    min-height: 60px;
    margin-bottom: 12px;
}

.quick-link-button-container {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
}

.quick-link-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    border: 1px solid #3eb489;
    border-radius: 8px;
    padding: 10px 20px;
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(62, 180, 137, 0.3);
}

.quick-link-btn:hover {
    background: linear-gradient(135deg, #4ec99a 0%, #3d9a7a 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(62, 180, 137, 0.4);
}

.quick-link-btn:active {
    transform: translateY(0);
}

.quick-link-btn i {
    font-size: 16px;
}

.current-notation {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.placeholder {
    color: #ffffff60;
    font-style: italic;
}

.notation-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(62, 180, 137, 0.2);
    border: 1px solid #3eb489;
    border-radius: 6px;
    padding: 6px 12px;
    color: #fff;
}

.notation-item.link-separator {
    background: rgba(255, 193, 7, 0.2);
    border-color: #ffc107;
    font-weight: 700;
    font-size: 16px;
    padding: 6px 16px;
}

.notation-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    display: block;
}

.notation-icon[src=""],
.notation-icon:not([src]) {
    display: none;
}

.notation-text {
    font-weight: 500;
}

.remove-btn {
    cursor: pointer;
    color: #ffffff90;
    transition: color 0.2s;
}

.remove-btn:hover {
    color: #ff6b6b;
}

.notation-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.button-group h4 {
    color: #ffffff90;
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.movement-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-width: 180px;
}

.attack-buttons,
.special-buttons,
.motion-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.notation-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notation-btn.icon-btn {
    padding: 8px;
    min-width: 50px;
    min-height: 50px;
}

.notation-btn.icon-btn img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    display: block;
}

.notation-btn.icon-btn img[src=""],
.notation-btn.icon-btn img:not([src]) {
    display: none;
}

.notation-btn.icon-btn .button-label {
    font-size: 10px;
    margin-top: 2px;
    font-weight: 600;
}

.notation-btn.icon-btn {
    flex-direction: column;
    gap: 4px;
}

.neutral-dot {
    font-size: 20px;
    color: #ffffff90;
}

.notation-btn:hover {
    background: rgba(62, 180, 137, 0.2);
    border-color: #3eb489;
    transform: translateY(-2px);
}

.notation-btn:active {
    transform: translateY(0);
}

.notation-btn.attack {
    background: rgba(255, 107, 107, 0.1);
    border-color: rgba(255, 107, 107, 0.3);
}

.notation-btn.attack:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: #ff6b6b;
}

.notation-btn.motion {
    background: rgba(255, 193, 7, 0.1);
    border-color: rgba(255, 193, 7, 0.3);
}

.notation-btn.motion:hover {
    background: rgba(255, 193, 7, 0.2);
    border-color: #ffc107;
}

.notation-btn.special {
    background: rgba(107, 107, 255, 0.1);
    border-color: rgba(107, 107, 255, 0.3);
}

.notation-btn.special:hover {
    background: rgba(107, 107, 255, 0.2);
    border-color: #6b6bff;
}

.no-game-selected {
    padding: 20px;
    text-align: center;
    color: #ffffff60;
    font-style: italic;
}
</style>
