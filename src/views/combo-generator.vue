<!-- @format -->
<template>
    <div class="combo-generator">
        <div class="generator-container">
            <div class="form-header">
                <div class="header-icon">
                    <i class="fas fa-fire"></i>
                </div>
                <h1>Generate Combo</h1>
                <p class="form-subtitle">Create and share combos for your favorite character</p>
                <div class="allowed-games-notice">
                    <i class="fas fa-info-circle"></i>
                    <span
                        >Combos available for: 2XKO, Fatal Fury: COTW, GBVSR, GGST, SF6, and Tekken
                        8</span
                    >
                </div>
            </div>

            <div class="two-column-layout">
                <!-- Left Column: Form Sections -->
                <div class="form-column">
                    <!-- Game Selection (if character not pre-selected) -->
                    <div v-if="!characterFromRoute" class="form-section">
                        <div class="section-header">
                            <i class="fas fa-gamepad section-icon"></i>
                            <h2>Game</h2>
                        </div>
                        <div v-show="showErrorMessage && !selectedGameId" class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>Please select a game</span>
                        </div>
                        <div class="game-container">
                            <game-search
                                v-model="selectedGameId"
                                :filteredGameIds="allowedGameIds"
                                @update:game="setGame($event)"
                            />
                        </div>
                        <div v-if="selectedGame && !isAllowedGame" class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span
                                >Combos are only available for 2XKO, Fatal Fury: COTW, GBVSR, GGST,
                                SF6, and Tekken 8</span
                            >
                        </div>
                    </div>
                    <!-- Character Selection -->
                    <div class="form-section">
                        <div class="section-header">
                            <i class="fas fa-user-ninja section-icon"></i>
                            <h2>Character</h2>
                        </div>
                        <div v-show="showErrorMessage && !selectedCharacter" class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>Please select a character</span>
                        </div>
                        <div class="character-container">
                            <character-search
                                v-model="characterId"
                                :gameId="selectedGameId"
                                @update:character="setCharacter($event)"
                            />
                        </div>
                    </div>

                    <!-- Video Link Section -->
                    <div class="form-section">
                        <div class="section-header">
                            <i class="fas fa-video section-icon"></i>
                            <h2>Combo Video</h2>
                        </div>
                        <p class="section-hint">Paste a YouTube or Twitter video URL (optional)</p>
                        <div class="video-container">
                            <div class="input-wrapper">
                                <i class="fas fa-link input-icon"></i>
                                <v-text-field
                                    dark
                                    v-model="videoUrl"
                                    type="text"
                                    placeholder="YouTube or Twitter Video URL"
                                    outlined
                                    @input="processVideoUrl"
                                />
                            </div>

                            <div v-if="videoUrl && videoType === 'twitter'" class="video-preview">
                                <tweet :id="extractedVideoId" />
                            </div>
                        </div>
                    </div>

                    <!-- Combo Notation Section -->
                    <div class="form-section">
                        <div class="section-header">
                            <i class="fas fa-keyboard section-icon"></i>
                            <h2>Combo Notation</h2>
                        </div>
                        <p class="section-hint">
                            Enter the combo inputs using text or icon buttons
                        </p>
                        <combo-notation-input
                            v-model="comboInputs"
                            :gameId="selectedGameId"
                            :gameAbbreviation="selectedGame ? selectedGame.abbreviation : null"
                        />
                    </div>

                    <!-- Combo Stats -->
                    <div class="form-section">
                        <div class="section-header">
                            <i class="fas fa-chart-line section-icon"></i>
                            <h2>Combo Stats</h2>
                        </div>
                        <div class="stats-container">
                            <div class="stat-input">
                                <v-text-field
                                    dark
                                    v-model="comboDamage"
                                    type="number"
                                    placeholder="Damage"
                                    outlined
                                />
                            </div>
                            <div class="stat-input">
                                <v-text-field
                                    dark
                                    v-model="comboHits"
                                    type="number"
                                    placeholder="Hits"
                                    outlined
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="form-actions">
                        <v-btn
                            class="submit-btn"
                            rounded
                            large
                            block
                            @click="submitCombo()"
                            :disabled="!isValidated"
                            :loading="isSubmitting"
                        >
                            <span v-if="!isSubmitting">
                                <i class="fas fa-check"></i>
                                Submit Combo
                            </span>
                            <span v-else>Submitting...</span>
                        </v-btn>
                    </div>
                </div>

                <!-- Right Column: Preview Section -->
                <div class="preview-column">
                    <div v-if="showPreview" class="preview-section">
                        <div class="preview-container">
                            <!-- Character Background Image -->
                            <div class="preview-background" :style="characterBackgroundStyle"></div>

                            <!-- Character Name and Game Title -->
                            <div class="preview-header">
                                <div v-if="selectedGame && selectedGame.title" class="game-title">
                                    {{ selectedGame.title }}
                                </div>
                                <div
                                    v-if="selectedCharacter && selectedCharacter.name"
                                    class="character-name"
                                >
                                    {{ selectedCharacter.name }} Combo
                                </div>
                            </div>

                            <!-- Video Player -->
                            <div class="preview-video-container">
                                <div
                                    v-if="videoUrl && videoType === 'youtube'"
                                    class="preview-video-wrapper"
                                >
                                    <div class="preview-video">
                                        <youtube-media
                                            ref="previewYoutubeRef"
                                            :video-id="extractedVideoId"
                                            :player-width="previewVideoWidth"
                                            :player-height="previewVideoHeight"
                                            :mute="true"
                                            :playsinline="1"
                                        />
                                    </div>
                                </div>
                                <div
                                    v-else-if="videoUrl && videoType === 'twitter'"
                                    class="preview-video"
                                >
                                    <tweet :id="extractedVideoId" />
                                </div>
                                <div v-else class="preview-video-placeholder">
                                    <i class="fas fa-video"></i>
                                    <p>Video preview will appear here</p>
                                </div>
                            </div>

                            <!-- Input Notation Display -->
                            <div v-if="comboInputs" class="preview-inputs">
                                <div
                                    v-for="(row, rowIndex) in parsedInputRows"
                                    :key="rowIndex"
                                    class="input-row"
                                >
                                    <div
                                        v-for="(input, inputIndex) in row"
                                        :key="inputIndex"
                                        class="input-item"
                                        :class="{ 
                                            bracketed: input.bracketed,
                                            'input-even': getGlobalInputIndex(rowIndex, inputIndex) % 2 === 0,
                                            'input-odd': getGlobalInputIndex(rowIndex, inputIndex) % 2 === 1
                                        }"
                                    >
                                        <img
                                            v-if="getInputIcon(input.text)"
                                            :src="getInputIcon(input.text)"
                                            :alt="input.text"
                                            class="input-icon"
                                        />
                                        <span v-else class="input-text">{{ input.text }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Bottom Section: Stats and Branding -->
                            <div class="preview-bottom">
                                <!-- Branding -->
                                <div class="preview-branding">
                                    <div class="brand-icon">
                                        <i class="fas fa-gamepad"></i>
                                    </div>
                                    <span class="brand-text">Fighters-Edge.com</span>
                                </div>

                                <!-- Combo Stats Display -->
                                <div v-if="comboHits || comboDamage" class="preview-stats">
                                    <div v-if="comboHits" class="stat-item">
                                        <span class="stat-value">{{ comboHits }}</span>
                                        <span class="stat-label">Hits</span>
                                    </div>
                                    <div v-if="comboDamage" class="stat-item">
                                        <span class="stat-value">{{ comboDamage }}</span>
                                        <span class="stat-label">Dmg</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="preview-placeholder">
                        <div class="placeholder-content">
                            <i class="fas fa-eye"></i>
                            <p>Preview will appear here</p>
                            <span>Select a character and add combo details to see the preview</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search';
import GameSearch from '@/components/games/game-search';
import ComboNotationInput from '@/components/notation/combo-notation-input';
import CombosService from '@/services/combos-service';
import VideosService from '@/services/videos-service';
import CharactersService from '@/services/characters-service';
import GamesService from '@/services/games-service';
import { Tweet } from 'vue-tweet-embed';

// Import input icons for preview
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

// T8 icons
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

// Motion inputs
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
    name: 'ComboGenerator',

    components: {
        'character-search': CharacterSearch,
        'game-search': GameSearch,
        'combo-notation-input': ComboNotationInput,
        tweet: Tweet,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            characterId: [],
            selectedCharacter: null,
            selectedGame: null,
            selectedGameId: null,
            videoUrl: '',
            videoType: '',
            extractedVideoId: '',
            comboInputs: '',
            comboDamage: '',
            comboHits: '',
            showErrorMessage: false,
            isSubmitting: false,
            characterFromRoute: false,
            allowedGameAbbreviations: ['2xko', 'cotw', 'gbvsr', 'ggst', 'sf6', 't8'],
            allowedGameIds: [],
            games: [],
            // Icon mappings for preview
            arrowIcons: {
                1: arrow1,
                2: arrow2,
                3: arrow3,
                4: arrow4,
                6: arrow6,
                7: arrow7,
                8: arrow8,
                9: arrow9,
            },
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
                    1: t8_1,
                    2: t8_2,
                    3: t8_3,
                    4: t8_4,
                    12: t8_12,
                    13: t8_13,
                    14: t8_14,
                    23: t8_23,
                    24: t8_24,
                    34: t8_34,
                },
            },
            motionIcons: {
                qcf: qcf,
                qcb: qcb,
                dp: dp,
                421: motion421,
                360: motion360,
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
        isValidated() {
            return (
                this.selectedCharacter &&
                this.selectedGameId &&
                this.isAllowedGame &&
                this.comboInputs &&
                this.comboInputs.trim().length > 0
            );
        },

        isAllowedGame() {
            if (!this.selectedGame) return false;
            const abbreviation = (this.selectedGame.abbreviation || '').toLowerCase();
            return this.allowedGameAbbreviations.includes(abbreviation);
        },

        showPreview() {
            return this.selectedCharacter && (this.videoUrl || this.comboInputs);
        },

        characterBackgroundStyle() {
            if (!this.selectedCharacter || !this.selectedCharacter.imageUrl) {
                return { background: '#000' };
            }
            return {
                backgroundImage: `url(${this.selectedCharacter.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
            };
        },

        attackIcons() {
            if (!this.selectedGame || !this.selectedGame.abbreviation) {
                return {};
            }
            const abbrev = this.selectedGame.abbreviation.toLowerCase();
            return this.allGameIcons[abbrev] || {};
        },

        parsedInputRows() {
            if (!this.comboInputs) return [];

            // Parse inputs and group into rows (max 5 items per row based on image)
            const inputs = this.parseInputs(this.comboInputs);
            const rows = [];
            const itemsPerRow = 5;

            for (let i = 0; i < inputs.length; i += itemsPerRow) {
                rows.push(inputs.slice(i, i + itemsPerRow));
            }

            return rows;
        },

        previewVideoWidth() {
            // Calculate width to fit the right column (accounting for padding)
            // Column is roughly 50% of container (max 1400px), minus gap (30px) and padding (30px total)
            // Available width: ~655px, use 600px for video
            return 600;
        },

        previewVideoHeight() {
            // 16:9 aspect ratio
            return Math.round(this.previewVideoWidth * (9 / 16));
        },
    },

    watch: {
        '$route.params.characterId'() {
            this.loadCharacterFromRoute();
        },
    },

    async mounted() {
        // Load allowed games
        await this.loadAllowedGames();

        // Check if character is provided in route
        if (this.$route.params.characterId) {
            await this.loadCharacterFromRoute();
        }
    },

    methods: {
        async loadCharacterFromRoute() {
            const characterId = this.$route.params.characterId;
            if (characterId) {
                try {
                    const response = await CharactersService.getCharacter({ id: characterId });
                    const character = response.data;
                    this.selectedCharacter = {
                        id: character._id || characterId || null,
                        name: character.Name || 'Unknown Character',
                        imageUrl: character.ImageUrl || '',
                        avatarUrl: character.AvatarUrl || '',
                    };
                    this.characterId = [character._id];
                    this.selectedGameId = character.GameId;
                    this.characterFromRoute = true;

                    // Load game info to validate
                    if (character.GameId) {
                        const gameResponse = await GamesService.getGame({ id: character.GameId });
                        const game = gameResponse.data;
                        this.selectedGame = {
                            id: game._id,
                            title: game.Title,
                            abbreviation: game.Abbreviation,
                        };
                    }
                } catch (error) {
                    console.error('Error loading character:', error);
                }
            }
        },

        async setCharacter(character) {
            // Handle both array and single object formats
            let characterObj = null;

            if (Array.isArray(character) && character.length > 0) {
                characterObj = character[0];
            } else if (character && typeof character === 'object' && character.id) {
                characterObj = character;
            }

            if (characterObj && characterObj.id) {
                this.characterId = [characterObj.id];

                // Set initial character data from the object to prevent undefined
                this.selectedCharacter = {
                    id: characterObj.id,
                    name: characterObj.name || 'Unknown Character',
                    imageUrl: characterObj.imageUrl || '',
                    avatarUrl: characterObj.imageUrl || '',
                };

                // Load character's game to validate and get full data
                try {
                    const charResponse = await CharactersService.getCharacter({
                        id: characterObj.id,
                    });
                    const charData = charResponse.data;

                    // Update selectedCharacter with full data including ImageUrl
                    if (charData) {
                        this.selectedCharacter = {
                            id: charData._id || characterObj.id || null,
                            name: (
                                charData.Name ||
                                characterObj.name ||
                                'Unknown Character'
                            ).trim(),
                            imageUrl: (
                                charData.ImageUrl ||
                                charData.AvatarUrl ||
                                characterObj.imageUrl ||
                                ''
                            ).trim(),
                            avatarUrl: (charData.AvatarUrl || characterObj.imageUrl || '').trim(),
                        };
                    }

                    if (charData && charData.GameId) {
                        const gameResponse = await GamesService.getGame({
                            id: charData.GameId,
                        });
                        const game = gameResponse.data;
                        if (game) {
                            this.selectedGame = {
                                id: game._id || null,
                                title: game.Title || '',
                                abbreviation: game.Abbreviation || '',
                            };
                            this.selectedGameId = game._id;

                            // Validate game is allowed
                            if (!this.isAllowedGame) {
                                this.showErrorMessage = true;
                                alert(
                                    'Combos are only available for 2XKO, Fatal Fury: COTW, GBVSR, GGST, SF6, and Tekken 8. Please select a character from one of these games.'
                                );
                                this.selectedCharacter = null;
                                this.characterId = [];
                                this.selectedGame = null;
                                this.selectedGameId = null;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error validating character game:', error);
                    // Keep the character data from the object even if API call fails
                }
            } else {
                this.selectedCharacter = null;
                this.characterId = [];
            }
        },

        setGame(game) {
            if (game) {
                this.selectedGame = game;
                this.selectedGameId = game.id;

                // Validate game is allowed
                if (!this.isAllowedGame) {
                    this.showErrorMessage = true;
                }
            } else {
                this.selectedGame = null;
                this.selectedGameId = null;
            }
        },

        async loadAllowedGames() {
            try {
                const response = await GamesService.fetchGames();
                this.games = response.data.games.map((game) => {
                    return {
                        id: game._id,
                        title: game.Title,
                        logoUrl: game.LogoUrl,
                        abbreviation: game.Abbreviation,
                    };
                });

                // Filter to only allowed games
                this.allowedGameIds = this.games
                    .filter((game) => {
                        const abbreviation = (game.abbreviation || '').toLowerCase();
                        return this.allowedGameAbbreviations.includes(abbreviation);
                    })
                    .map((game) => game.id);
            } catch (error) {
                console.error('Error loading games:', error);
            }
        },

        processVideoUrl() {
            if (!this.videoUrl) {
                this.videoType = '';
                this.extractedVideoId = '';
                return;
            }

            if (this.videoUrl.includes('youtube.com') || this.videoUrl.includes('youtu.be')) {
                this.videoType = 'youtube';
                if (this.videoUrl.includes('ab_channel')) {
                    this.extractedVideoId = this.videoUrl.substring(
                        this.videoUrl.indexOf('v=') + 2,
                        this.videoUrl.indexOf('&ab_channel')
                    );
                } else if (this.videoUrl.includes('youtu.be/')) {
                    this.extractedVideoId = this.videoUrl.substring(
                        this.videoUrl.indexOf('youtu.be/') + 9
                    );
                } else {
                    this.extractedVideoId = this.videoUrl.substring(
                        this.videoUrl.indexOf('v=') + 2
                    );
                }
            } else if (this.videoUrl.includes('x.com') || this.videoUrl.includes('twitter.com')) {
                this.videoType = 'twitter';
                this.extractedVideoId = this.videoUrl.substring(
                    this.videoUrl.indexOf('/status/') + 8
                );
            } else {
                this.videoType = '';
                this.extractedVideoId = '';
            }
        },

        async submitCombo() {
            if (!this.isValidated) {
                this.showErrorMessage = true;
                if (!this.isAllowedGame && this.selectedGame) {
                    alert(
                        'Combos are only available for 2XKO, Fatal Fury: COTW, GBVSR, GGST, SF6, and Tekken 8'
                    );
                }
                return;
            }

            // Double-check game is allowed before submitting
            if (!this.isAllowedGame) {
                this.showErrorMessage = true;
                alert(
                    'Combos are only available for 2XKO, Fatal Fury: COTW, GBVSR, GGST, SF6, and Tekken 8'
                );
                this.isSubmitting = false;
                return;
            }

            this.isSubmitting = true;
            this.showErrorMessage = false;

            try {
                const comboData = {
                    CharacterId: Array.isArray(this.characterId)
                        ? this.characterId
                        : [this.characterId],
                    Inputs: this.comboInputs,
                    Damage: this.comboDamage || null,
                    Hits: this.comboHits || null,
                };

                // If video URL is provided, create a video with the combo
                if (this.videoUrl && this.extractedVideoId) {
                    await VideosService.validateVideo({
                        Url: this.extractedVideoId,
                        GameId: this.selectedGameId,
                        Combos: [
                            {
                                CharacterId: comboData.CharacterId,
                                Inputs: comboData.Inputs,
                                Damage: comboData.Damage,
                                Hits: comboData.Hits,
                                StartTime: '',
                                EndTime: '',
                                Note: '',
                            },
                        ],
                        VideoUrl: this.extractedVideoId,
                        SubmittedBy: this.account ? this.account.id : null,
                        UpdatedBy: this.account ? this.account.id : null,
                        ContentType: 'Combo',
                        VideoType: this.videoType,
                        Tags: [],
                        StartTime: '',
                        EndTime: '',
                    });
                } else {
                    // Just create the combo without video
                    await CombosService.addCombo(comboData);
                }

                // Success - redirect or show message
                this.$router.push({
                    name: 'Character Combos',
                    params: { characterId: this.characterId[0] },
                });
            } catch (error) {
                console.error('Error submitting combo:', error);
                this.showErrorMessage = true;
                alert('Failed to submit combo. Please try again.');
            } finally {
                this.isSubmitting = false;
            }
        },

        parseInputs(inputString) {
            if (!inputString) return [];

            // Only split on ">" characters, preserve everything else including spaces
            const inputs = [];
            let currentBracketed = false;
            let currentText = '';

            for (let i = 0; i < inputString.length; i++) {
                const char = inputString[i];

                if (char === '[') {
                    currentBracketed = true;
                    currentText += char;
                } else if (char === ']') {
                    currentBracketed = false;
                    currentText += char;
                } else if (char === '>') {
                    // Only ">" creates a new input
                    if (currentText.trim()) {
                        inputs.push({
                            text: currentText.trim(),
                            bracketed: currentBracketed,
                        });
                        currentText = '';
                        currentBracketed = false;
                    }
                    // Skip the ">" character itself
                } else {
                    // Keep everything else (spaces, other characters) as part of the current input
                    currentText += char;
                }
            }

            // Add remaining text as the last input
            if (currentText.trim()) {
                inputs.push({
                    text: currentText.trim(),
                    bracketed: currentBracketed,
                });
            }

            return inputs;
        },

        addParsedInputs(text, bracketed, inputs) {
            // Split by common separators if they exist within the text
            const parts = text.split(/([><+\-])/).filter((p) => p && p.trim());

            for (const part of parts) {
                const trimmed = part.trim();
                if (
                    trimmed &&
                    trimmed !== '>' &&
                    trimmed !== '<' &&
                    trimmed !== '+' &&
                    trimmed !== '-'
                ) {
                    inputs.push({
                        text: trimmed,
                        bracketed: bracketed,
                    });
                }
            }
        },

        getInputIcon(notation) {
            if (!notation) return null;

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
                236: 'qcf',
                214: 'qcb',
                623: 'dp',
                41236: '421',
                63214: '421',
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

        getGlobalInputIndex(rowIndex, inputIndex) {
            // Calculate global index across all rows
            let globalIndex = 0;
            for (let i = 0; i < rowIndex; i++) {
                if (this.parsedInputRows[i]) {
                    globalIndex += this.parsedInputRows[i].length;
                }
            }
            return globalIndex + inputIndex;
        },
    },
};
</script>

<style type="text/css" scoped>
.combo-generator {
    padding: 40px 20px;
    min-height: calc(100vh - 100px);
    display: flex;
    justify-content: center;
}

.generator-container {
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    max-width: 1400px;
    color: #fff;
}

.two-column-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
}

.form-column {
    display: flex;
    flex-direction: column;
}

.preview-column {
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    max-width: 100%;
}

.preview-placeholder {
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.placeholder-content {
    color: rgba(255, 255, 255, 0.4);
}

.placeholder-content i {
    font-size: 64px;
    margin-bottom: 20px;
    display: block;
    color: rgba(255, 255, 255, 0.2);
}

.placeholder-content p {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: rgba(255, 255, 255, 0.5);
}

.placeholder-content span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.3);
}

.form-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-icon {
    font-size: 48px;
    color: #3eb489;
    margin-bottom: 16px;
}

.form-header h1 {
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Roboto', sans-serif;
}

.form-subtitle {
    color: #ffffff90;
    font-size: 14px;
    margin: 0;
    font-weight: 400;
}

.allowed-games-notice {
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba(62, 180, 137, 0.1);
    border: 1px solid rgba(62, 180, 137, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #3eb489;
    font-size: 13px;
}

.allowed-games-notice i {
    font-size: 14px;
}

.form-section {
    margin-bottom: 35px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-icon {
    font-size: 20px;
    color: #3eb489;
}

.section-header h2 {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

.section-hint {
    color: #ffffff70;
    font-size: 13px;
    margin: -10px 0 16px 0;
    font-style: italic;
}

.error-message {
    background: rgba(255, 59, 48, 0.15);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ff6b6b;
    font-size: 14px;
}

.error-message i {
    font-size: 16px;
    flex-shrink: 0;
}

.character-container,
.game-container {
    margin-bottom: 0;
}

.video-container {
    margin-top: 16px;
}

.input-wrapper {
    position: relative;
    margin-bottom: 16px;
}

.input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.video-container >>> .v-text-field--outlined .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    padding-left: 45px !important;
}

.video-container >>> .v-text-field--outlined .v-input__slot input {
    color: #fff !important;
}

.video-preview {
    margin-top: 20px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.stats-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
}

.stat-input >>> .v-text-field--outlined .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
}

.stat-input >>> .v-text-field--outlined .v-input__slot input {
    color: #fff !important;
}

.form-actions {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.submit-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3);
    transition: all 0.3s ease;
    height: 50px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.submit-btn i {
    margin-right: 8px;
}

/* Preview Section */
.preview-section {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
}

.preview-container {
    position: relative;
    background: #000;
    border-radius: 16px;
    overflow: hidden;
    min-height: 600px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    width: 100%;
    max-width: 100%;
    padding-top: 200px;
}

.preview-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    opacity: 0.6;
    background-size: cover;
    background-position: center top;
}

.preview-background::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.5) 40%,
        rgba(0, 0, 0, 0.8) 70%,
        rgba(0, 0, 0, 0.95) 100%
    );
}

.preview-header {
    position: relative;
    z-index: 2;
    padding: 25px 35px 15px;
    text-align: right;
}

.game-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.character-name {
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.9);
    letter-spacing: 0.5px;
}

.preview-video-container {
    position: relative;
    z-index: 2;
    padding: 0 25px 25px;
    display: flex;
    justify-content: center;
    width: 100%;
    overflow: hidden;
}

.preview-video-wrapper {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
}

.preview-video {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(0, 0, 0, 0.5);
    background: #000;
    position: relative;
    contain: layout style paint;
    border: 2px solid rgba(0, 0, 0, 0.6);
}

.preview-video-wrapper >>> iframe,
.preview-video-wrapper >>> object,
.preview-video-wrapper >>> embed,
.preview-video >>> iframe,
.preview-video >>> object,
.preview-video >>> embed {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    position: relative !important;
    display: block !important;
}

.preview-video-wrapper >>> div,
.preview-video >>> div {
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
    position: relative !important;
}

.preview-video-wrapper >>> div iframe,
.preview-video >>> div iframe {
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
}

.preview-video-placeholder {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16 / 9;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 auto;
}

.preview-video-placeholder i {
    font-size: 48px;
    margin-bottom: 16px;
}

.preview-video-placeholder p {
    font-size: 14px;
    margin: 0;
}

.preview-inputs {
    position: relative;
    z-index: 2;
    padding: 15px 30px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
}

.input-item {
    position: relative;
    background: rgba(128, 128, 128, 0.3);
    border: 1px solid rgba(128, 128, 128, 0.4);
    border-radius: 6px;
    padding: 6px 30px 6px 20px;
    min-width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    clip-path: polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%);
    margin-left: -15px;
}

.input-item.input-even {
    background: rgba(100, 150, 200, 0.3);
    border-color: rgba(100, 150, 200, 0.5);
}

.input-item.input-odd {
    background: rgba(200, 120, 150, 0.3);
    border-color: rgba(200, 120, 150, 0.5);
}

.input-item:first {
    margin-left: 0;
}

.input-item.bracketed {
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    background: rgba(128, 128, 128, 0.5) !important;
    position: relative;
}

.input-item.bracketed.input-even {
    background: rgba(100, 150, 200, 0.5) !important;
    border-color: rgba(255, 255, 255, 0.8) !important;
}

.input-item.bracketed.input-odd {
    background: rgba(200, 120, 150, 0.5) !important;
    border-color: rgba(255, 255, 255, 0.8) !important;
}

.input-item.bracketed::before {
    content: '[';
    position: absolute;
    left: -8px;
    color: #fff;
    font-weight: bold;
    font-size: 16px;
}

.input-item.bracketed::after {
    content: ']';
    position: absolute;
    right: -8px;
    color: #fff;
    font-weight: bold;
    font-size: 16px;
}

.input-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.input-text {
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.preview-bottom {
    position: relative;
    z-index: 2;
    padding: 15px 30px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.preview-stats {
    display: flex;
    gap: 20px;
    align-items: flex-end;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 2px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.preview-branding {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
}

.brand-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    position: relative;
}

.brand-icon::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.brand-icon i {
    font-size: 12px;
    position: relative;
    z-index: 1;
    color: rgba(255, 255, 255, 0.9);
}

.brand-text {
    font-weight: 500;
}

/* Mobile responsive */
@media (max-width: 1200px) {
    .two-column-layout {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .preview-column {
        position: static;
        max-height: none;
    }
}

@media (max-width: 600px) {
    .combo-generator {
        padding: 20px 10px;
    }

    .generator-container {
        padding: 25px 20px;
        border-radius: 16px;
        max-width: 100%;
    }

    .form-header h1 {
        font-size: 28px;
    }

    .header-icon {
        font-size: 40px;
    }

    .form-section {
        padding: 20px 16px;
    }

    .stats-container {
        grid-template-columns: 1fr;
    }

    .preview-container {
        min-height: 500px;
    }

    .preview-header {
        padding: 20px 20px 15px;
    }

    .game-title {
        font-size: 14px;
    }

    .character-name {
        font-size: 24px;
    }

    .preview-video-container {
        padding: 0 20px 20px;
    }

    .preview-inputs {
        padding: 0 20px 15px;
    }

    .input-row {
        gap: 6px;
    }

    .input-item {
        min-width: 40px;
        height: 40px;
        padding: 6px 10px;
    }

    .input-icon {
        width: 24px;
        height: 24px;
    }

    .input-text {
        font-size: 12px;
    }

    .preview-stats {
        padding: 0 20px 15px;
        gap: 16px;
    }

    .stat-value {
        font-size: 20px;
    }

    .preview-branding {
        padding: 15px 20px;
    }
}
</style>
