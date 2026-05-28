<!-- @format -->
<template>
    <div class="match-logs-view">
        <div class="ml-header">
            <div class="ml-title-row">
                <h1>Match Log</h1>
                <button class="ml-add-btn" :disabled="!canEdit" @click="openAddForm">
                    + Log a Set
                </button>
            </div>
            <p class="ml-subtitle">
                Track your sets like a spreadsheet — game, character, opponent, score, video, and notes.
            </p>
        </div>

        <div v-if="!account || !account.id" class="ml-auth-empty">
            <h2>Sign in to start logging your matches</h2>
            <p>Your match log is private to your account.</p>
        </div>

        <template v-else>
            <!-- Filters / summary bar -->
            <div class="ml-toolbar">
                <div class="ml-filters">
                    <label>
                        Game
                        <select v-model="gameFilter">
                            <option value="">All games</option>
                            <option v-for="g in availableGames" :key="g" :value="g">{{ g }}</option>
                        </select>
                    </label>
                    <label>
                        Character
                        <select v-model="characterFilter">
                            <option value="">All</option>
                            <option v-for="c in availableCharacters" :key="c" :value="c">{{ c }}</option>
                        </select>
                    </label>
                    <label>
                        Result
                        <select v-model="resultFilter">
                            <option value="">All</option>
                            <option value="Won">Won</option>
                            <option value="Loss">Loss</option>
                            <option value="Draw">Draw</option>
                        </select>
                    </label>
                </div>

                <div class="ml-summary">
                    <div class="ml-stat">
                        <span class="ml-stat-num">{{ filteredLogs.length }}</span>
                        <span class="ml-stat-label">Sets</span>
                    </div>
                    <div class="ml-stat won">
                        <span class="ml-stat-num">{{ summary.wins }}</span>
                        <span class="ml-stat-label">Won</span>
                    </div>
                    <div class="ml-stat loss">
                        <span class="ml-stat-num">{{ summary.losses }}</span>
                        <span class="ml-stat-label">Loss</span>
                    </div>
                    <div class="ml-stat">
                        <span class="ml-stat-num">{{ summary.winRate }}%</span>
                        <span class="ml-stat-label">Win Rate</span>
                    </div>
                </div>
            </div>

            <!-- Add / Edit form -->
            <div v-if="formOpen" class="ml-form-card">
                <div class="ml-form-header">
                    <h3>{{ editingId ? 'Edit Set' : 'Log a Set' }}</h3>
                    <button class="ml-close" @click="closeForm">×</button>
                </div>

                <form class="ml-form-grid" @submit.prevent="submitForm">
                    <!-- Game search -->
                    <div class="ml-field">
                        <span>Game</span>
                        <game-search
                            v-model="form.GameId"
                            placeholder="Search game…"
                            @update:game="onGameSelected"
                        />
                    </div>

                    <!-- Date -->
                    <label class="ml-field">
                        <span>Date</span>
                        <input v-model="form.Date" type="date" required />
                    </label>

                    <!-- Your character — filtered by selected game -->
                    <div class="ml-field">
                        <span>Your Character</span>
                        <character-search
                            v-if="form.GameId"
                            :key="'user-' + form.GameId"
                            :gameId="form.GameId"
                            :value="form.UserCharacterIds"
                            :multiple="true"
                            place-holder="Search your character(s)…"
                            @update:character="onUserCharacterSelected"
                        />
                        <span v-else class="ml-search-hint">Select a game first</span>
                    </div>

                    <!-- Opponent character — same game -->
                    <div class="ml-field">
                        <span>Opponent Character</span>
                        <character-search
                            v-if="form.GameId"
                            :key="'opp-' + form.GameId"
                            :gameId="form.GameId"
                            :value="form.OpponentCharacterIds"
                            :multiple="true"
                            place-holder="Search opponent character(s)…"
                            @update:character="onOpponentCharacterSelected"
                        />
                        <span v-else class="ml-search-hint">Select a game first</span>
                    </div>

                    <!-- Wins -->
                    <label class="ml-field ml-field--small">
                        <span>Wins</span>
                        <input v-model.number="form.Wins" type="number" min="0" max="99" />
                    </label>

                    <!-- Losses -->
                    <label class="ml-field ml-field--small">
                        <span>Losses</span>
                        <input v-model.number="form.Losses" type="number" min="0" max="99" />
                    </label>

                    <!-- Result -->
                    <label class="ml-field ml-field--small">
                        <span>Result</span>
                        <select v-model="form.Result">
                            <option value="">Auto</option>
                            <option value="Won">Won</option>
                            <option value="Loss">Loss</option>
                            <option value="Draw">Draw</option>
                        </select>
                    </label>

                    <!-- Video panel toggle -->
                    <div class="ml-field ml-field--full ml-video-toggle-row">
                        <button
                            type="button"
                            class="ml-video-toggle-btn"
                            :class="{ active: videoPanel.open }"
                            @click="videoPanel.open = !videoPanel.open"
                        >
                            <span class="ml-video-toggle-icon">🎬</span>
                            {{ videoPanel.open ? 'Remove Video' : 'Add Video' }}
                        </button>
                        <span v-if="videoPanel.open && videoPanel.videoUrl" class="ml-video-set-hint">
                            ✓ Video added
                        </span>
                    </div>

                    <!-- Video sub-panel -->
                    <div v-if="videoPanel.open" class="ml-field ml-field--full ml-video-panel">
                        <div class="ml-video-panel-inner">
                            <label class="ml-video-field">
                                <span>YouTube URL</span>
                                <input
                                    v-model.trim="videoPanel.videoUrl"
                                    type="text"
                                    class="ml-video-input"
                                    placeholder="https://youtu.be/… or video ID"
                                />
                            </label>
                            <div class="ml-video-players">
                                <div class="ml-video-field">
                                    <span>Player 1 (you)</span>
                                    <player-search
                                        :key="'vp1-' + editingId"
                                        @update:player="videoPanel.player1 = $event"
                                    />
                                </div>
                                <div class="ml-video-field">
                                    <span>Player 2 (opponent)</span>
                                    <player-search
                                        :key="'vp2-' + editingId"
                                        @update:player="videoPanel.player2 = $event"
                                    />
                                </div>
                            </div>
                            <p class="ml-video-hint">
                                Both players are required to save the video to the Matches table.
                                Can't find a player? Type their name and press <kbd>Enter</kbd> to create them.
                            </p>
                        </div>
                    </div>

                    <!-- Notes -->
                    <label class="ml-field ml-field--full">
                        <span>Notes</span>
                        <textarea
                            v-model="form.Notes"
                            rows="3"
                            placeholder="What did you learn? Things to fix next session…"
                        />
                    </label>

                    <div class="ml-form-actions">
                        <button type="button" class="ml-btn ml-btn--ghost" @click="closeForm">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="ml-btn ml-btn--primary"
                            :disabled="saving || !formIsValid"
                        >
                            {{ saving ? 'Saving…' : editingId ? 'Update Set' : 'Save Set' }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- Table -->
            <div v-if="loading" class="ml-loading">Loading match log…</div>

            <div v-else-if="logs.length === 0" class="ml-empty">
                <h2>No sets logged yet</h2>
                <p>Click <strong>“+ Log a Set”</strong> to record your first match.</p>
            </div>

            <div v-else class="ml-table-wrapper">
                <table class="ml-table">
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>Date</th>
                            <th>Character</th>
                            <th>Opponent</th>
                            <th class="ml-num">W</th>
                            <th class="ml-num">L</th>
                            <th>Result</th>
                            <th>Video</th>
                            <th>Notes</th>
                            <th class="ml-actions-col" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="log in filteredLogs"
                            :key="log.id"
                            :class="['ml-row', resultClass(log)]"
                        >
                            <td><span class="ml-tag">{{ log.game }}</span></td>
                            <td class="ml-date-cell">{{ formatDate(log.date) }}</td>
                            <td>{{ log.userCharacter }}</td>
                            <td>{{ log.opponentCharacter }}</td>
                            <td class="ml-num">{{ log.wins }}</td>
                            <td class="ml-num">{{ log.losses }}</td>
                            <td>
                                <span :class="['ml-result-pill', resultClass(log)]">
                                    {{ log.result || '—' }}
                                </span>
                            </td>
                            <td class="ml-video-cell">
                                <a v-if="log.videoUrl" :href="youtubeUrl(log.videoUrl)" target="_blank" rel="noopener">
                                    Watch
                                </a>
                                <span v-else class="ml-video-placeholder">—</span>
                            </td>
                            <td class="ml-notes-cell" :title="log.notes">
                                {{ truncate(log.notes, 80) }}
                            </td>
                            <td class="ml-actions-col">
                                <button class="ml-icon-btn" title="Edit" @click="openEditForm(log)">
                                    ✎
                                </button>
                                <button
                                    class="ml-icon-btn ml-icon-btn--danger"
                                    title="Delete"
                                    @click="confirmDelete(log)"
                                >
                                    ×
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script>
import MatchLogsService from '@/services/match-logs-service';
import GameSearch from '@/components/games/game-search';
import CharacterSearch from '@/components/character/character-search';
import PlayerSearch from '@/components/players/player-search';
import moment from 'moment';

function todayIso() {
    return moment().format('YYYY-MM-DD');
}

function emptyForm() {
    return {
        // Displayed label stored in DB (abbreviation or title)
        Game: '',
        // MongoDB IDs used to drive the search components
        GameId: null,
        UserCharacterIds: [],
        OpponentCharacterIds: [],
        // Character names stored in DB (joined with " / " for multi-char)
        UserCharacter: '',
        OpponentCharacter: '',
        Date: todayIso(),
        Wins: 0,
        Losses: 0,
        Result: '',
        VideoUrl: '',
        Notes: '',
    };
}

export default {
    name: 'MatchLogs',

    components: {
        'game-search': GameSearch,
        'character-search': CharacterSearch,
        'player-search': PlayerSearch,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            logs: [],
            loading: false,
            saving: false,
            formOpen: false,
            editingId: null,
            form: emptyForm(),
            videoPanel: {
                open: false,
                videoUrl: '',
                player1: null,
                player2: null,
            },
            gameFilter: '',
            characterFilter: '',
            resultFilter: '',
        };
    },

    computed: {
        canEdit() {
            return !!(this.account && this.account.id);
        },

        formIsValid() {
            return !!(this.form.GameId && this.form.UserCharacter && this.form.OpponentCharacter);
        },

        canSaveMatch() {
            return !!(
                this.videoPanel.open &&
                this.videoPanel.videoUrl &&
                this.videoPanel.player1 &&
                this.videoPanel.player1.id &&
                this.videoPanel.player2 &&
                this.videoPanel.player2.id
            );
        },

        availableGames() {
            const set = new Set(this.logs.map((l) => l.game).filter(Boolean));
            return Array.from(set).sort();
        },

        availableCharacters() {
            const set = new Set(this.logs.map((l) => l.userCharacter).filter(Boolean));
            return Array.from(set).sort();
        },

        filteredLogs() {
            return this.logs.filter((l) => {
                if (this.gameFilter && l.game !== this.gameFilter) return false;
                if (this.characterFilter && l.userCharacter !== this.characterFilter) return false;
                if (this.resultFilter && l.result !== this.resultFilter) return false;
                return true;
            });
        },

        summary() {
            const wins = this.filteredLogs.filter((l) => l.result === 'Won').length;
            const losses = this.filteredLogs.filter((l) => l.result === 'Loss').length;
            const decided = wins + losses;
            const winRate = decided ? Math.round((wins / decided) * 100) : 0;
            return { wins, losses, winRate };
        },
    },

    watch: {
        account: {
            handler(value, old) {
                const newId = value && value.id;
                const oldId = old && old.id;
                if (newId && newId !== oldId) {
                    this.fetchLogs();
                }
            },
            immediate: true,
        },
    },

    methods: {
        // ── search component callbacks ────────────────────────────────────

        onGameSelected(game) {
            if (!game) {
                this.form.GameId = null;
                this.form.Game = '';
                this.form.UserCharacter = '';
                this.form.UserCharacterIds = [];
                this.form.OpponentCharacter = '';
                this.form.OpponentCharacterIds = [];
                return;
            }
            // Only reset characters when the game actually changes
            if (this.form.GameId !== game.id) {
                this.form.UserCharacter = '';
                this.form.UserCharacterIds = [];
                this.form.OpponentCharacter = '';
                this.form.OpponentCharacterIds = [];
            }
            this.form.GameId = game.id;
            // Prefer abbreviation (e.g. "SF6") for the stored label; fall back to title
            this.form.Game = game.abbreviation || game.title || '';
        },

        onUserCharacterSelected(characters) {
            // character-search with multiple:true emits an array
            const arr = Array.isArray(characters) ? characters : (characters ? [characters] : []);
            this.form.UserCharacterIds = arr.map((c) => c.id);
            this.form.UserCharacter = arr.map((c) => c.name).join(' / ');
        },

        onOpponentCharacterSelected(characters) {
            const arr = Array.isArray(characters) ? characters : (characters ? [characters] : []);
            this.form.OpponentCharacterIds = arr.map((c) => c.id);
            this.form.OpponentCharacter = arr.map((c) => c.name).join(' / ');
        },

        // ── data ─────────────────────────────────────────────────────────

        async fetchLogs() {
            if (!this.canEdit) return;
            this.loading = true;
            try {
                const response = await MatchLogsService.queryMatchLogs({
                    searchQuery: [
                        { queryName: 'AuthorId', queryValue: this.account.id },
                    ],
                });
                this.logs = (response.data.matchLogs || []).map(this.hydrateLog);
            } catch (err) {
                console.error('Failed to load match logs', err);
                this.logs = [];
            } finally {
                this.loading = false;
            }
        },

        hydrateLog(raw) {
            return {
                id: raw._id,
                game: raw.Game,
                date: raw.Date,
                userCharacter: raw.UserCharacter,
                opponentCharacter: raw.OpponentCharacter,
                wins: raw.Wins,
                losses: raw.Losses,
                result: raw.Result,
                videoUrl: raw.VideoUrl,
                notes: raw.Notes,
                authorId: raw.AuthorId,
                gameId: raw.GameId || null,
                matchId: raw.MatchId || null,
                userCharacterIds: raw.UserCharacterIds || [],
                opponentCharacterIds: raw.OpponentCharacterIds || [],
            };
        },

        // ── form lifecycle ────────────────────────────────────────────────

        openAddForm() {
            this.editingId = null;
            this.form = emptyForm();
            this.formOpen = true;
        },

        openEditForm(log) {
            this.editingId = log.id;
            this.form = {
                Game: log.game || '',
                GameId: log.gameId || null,
                UserCharacter: log.userCharacter || '',
                UserCharacterIds: log.userCharacterIds || [],
                OpponentCharacter: log.opponentCharacter || '',
                OpponentCharacterIds: log.opponentCharacterIds || [],
                Date: log.date ? moment(log.date).format('YYYY-MM-DD') : todayIso(),
                Wins: log.wins || 0,
                Losses: log.losses || 0,
                Result: log.result || '',
                VideoUrl: log.videoUrl || '',
                Notes: log.notes || '',
            };
            const storedVideo = log.videoUrl || '';
            this.videoPanel = {
                open: !!storedVideo,
                // Reconstruct a full URL so the input shows something recognisable.
                // Legacy records may already store the full URL; new ones store just the ID.
                videoUrl: storedVideo ? this.youtubeUrl(storedVideo) : '',
                player1: null,
                player2: null,
            };
            this.formOpen = true;
            this.$nextTick(() => {
                this.$el && this.$el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        },

        closeForm() {
            this.formOpen = false;
            this.editingId = null;
            this.form = emptyForm();
            this.videoPanel = { open: false, videoUrl: '', player1: null, player2: null };
        },

        async submitForm() {
            if (!this.canEdit || !this.formIsValid) return;
            this.saving = true;

            // Extract just the YouTube video ID (strips full URL noise).
            // Legacy records that already store an ID pass through unchanged.
            const rawVideoUrl = this.videoPanel.open ? this.videoPanel.videoUrl : '';
            const videoId = this.extractYoutubeId(rawVideoUrl);

            try {
                // ── 1. Save the Match record first (if video + both players present) ──
                // We need the Match._id before writing the log so the log can
                // reference it directly.
                let matchId = null;
                if (this.canSaveMatch) {
                    const matchPayload = {
                        GameId: this.form.GameId,
                        UserCharacterIds: this.form.UserCharacterIds,
                        OpponentCharacterIds: this.form.OpponentCharacterIds,
                        Player1Id: this.videoPanel.player1.id,
                        Player2Id: this.videoPanel.player2.id,
                        // Matches table expects a full URL
                        VideoUrl: videoId ? 'https://youtu.be/' + videoId : rawVideoUrl,
                        Result: this.form.Result || '',
                        SubmittedBy: this.account.id,
                    };
                    const matchRes = await MatchLogsService.createMatchFromLog(matchPayload);
                    matchId = matchRes.data && matchRes.data.matchId;
                }

                // ── 2. Save the MatchLog, referencing the Match if one was created ──
                const logPayload = {
                    ...this.form,
                    VideoUrl: videoId,
                    MatchId: matchId || null,
                    AuthorId: this.account.id,
                };

                if (this.editingId) {
                    await MatchLogsService.updateMatchLog({ id: this.editingId, ...logPayload });
                } else {
                    await MatchLogsService.addMatchLog(logPayload);
                }

                this.closeForm();
                await this.fetchLogs();
            } catch (err) {
                console.error('Failed to save match log', err);
                alert('Failed to save. Check the console for details.');
            } finally {
                this.saving = false;
            }
        },

        async confirmDelete(log) {
            const confirmed = window.confirm(
                `Delete this set vs ${log.opponentCharacter || 'opponent'}? This cannot be undone.`
            );
            if (!confirmed) return;
            try {
                await MatchLogsService.deleteMatchLog(log.id);
                this.logs = this.logs.filter((l) => l.id !== log.id);
            } catch (err) {
                console.error('Failed to delete match log', err);
                alert('Failed to delete match log.');
            }
        },

        // ── helpers ───────────────────────────────────────────────────────

        formatDate(value) {
            if (!value) return '—';
            const m = moment(value);
            return m.isValid() ? m.format('MMM D, YYYY') : String(value);
        },

        resultClass(log) {
            if (log.result === 'Won') return 'won';
            if (log.result === 'Loss') return 'loss';
            if (log.result === 'Draw') return 'draw';
            return '';
        },

        // Parse any YouTube URL format and return just the 11-char video ID.
        // If the value is already an ID (or unparseable), return it as-is.
        extractYoutubeId(url) {
            if (!url) return '';
            const trimmed = url.trim();
            if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
            const patterns = [
                /youtu\.be\/([a-zA-Z0-9_-]{11})/,
                /[?&]v=([a-zA-Z0-9_-]{11})/,
                /embed\/([a-zA-Z0-9_-]{11})/,
                /shorts\/([a-zA-Z0-9_-]{11})/,
            ];
            for (const re of patterns) {
                const m = trimmed.match(re);
                if (m) return m[1];
            }
            return trimmed;
        },

        // Build a watchable YouTube URL from a stored video ID.
        // Passes full URLs through unchanged for legacy records.
        youtubeUrl(value) {
            if (!value) return '';
            if (/^https?:\/\//i.test(value)) return value;
            return 'https://youtu.be/' + value;
        },

        truncate(value, max) {
            if (!value) return '';
            if (value.length <= max) return value;
            return value.slice(0, max - 1) + '…';
        },
    },
};
</script>

<style>
.match-logs-view {
    max-width: 1280px;
    margin: 0 auto;
    padding: 160px 24px 80px;
    color: #e7e9f0;
    font-family: 'Roboto';
}

.match-logs-view .ml-header h1 {
    font-size: 36px;
    color: #fff;
    margin: 0 0 4px;
}

.match-logs-view .ml-subtitle {
    color: #9ea3b6;
    margin: 0;
}

.match-logs-view .ml-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.match-logs-view .ml-add-btn {
    background: #3eb489;
    color: #fff;
    padding: 10px 20px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 0.1s ease, opacity 0.15s ease;
}

.match-logs-view .ml-add-btn:hover:not(:disabled) {
    transform: translateY(-1px);
}

.match-logs-view .ml-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.match-logs-view .ml-auth-empty,
.match-logs-view .ml-empty,
.match-logs-view .ml-loading {
    margin-top: 60px;
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    color: #c8cbd5;
}

.match-logs-view .ml-auth-empty h2,
.match-logs-view .ml-empty h2 {
    color: #fff;
    margin: 0 0 8px;
}

.match-logs-view .ml-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 24px 0 16px;
    flex-wrap: wrap;
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
    padding: 14px 18px;
    border-radius: 12px;
}

.match-logs-view .ml-filters {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    flex-wrap: wrap;
}

.match-logs-view .ml-filters label {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #9ea3b6;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    gap: 4px;
}

.match-logs-view .ml-filters select,
.match-logs-view .ml-form-grid input,
.match-logs-view .ml-form-grid select,
.match-logs-view .ml-form-grid textarea {
    background: #11141d;
    color: #fff;
    border: 1px solid #2a2f3e;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 14px;
    font-family: inherit;
    min-width: 140px;
}

.match-logs-view .ml-form-grid textarea {
    width: 100%;
    resize: vertical;
}

.match-logs-view .ml-summary {
    display: flex;
    gap: 12px;
}

.match-logs-view .ml-stat {
    text-align: center;
    padding: 6px 14px;
    border-radius: 8px;
    background: #11141d;
    min-width: 64px;
}

.match-logs-view .ml-stat.won {
    background: #173b2c;
}

.match-logs-view .ml-stat.loss {
    background: #3b1d1f;
}

.match-logs-view .ml-stat-num {
    display: block;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
}

.match-logs-view .ml-stat-label {
    display: block;
    font-size: 11px;
    color: #9ea3b6;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.match-logs-view .ml-form-card {
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.match-logs-view .ml-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.match-logs-view .ml-form-header h3 {
    color: #fff;
    margin: 0;
    font-size: 20px;
}

.match-logs-view .ml-close {
    background: transparent;
    color: #9ea3b6;
    border: none;
    font-size: 26px;
    line-height: 1;
    cursor: pointer;
    padding: 0 6px;
}

.match-logs-view .ml-form-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.match-logs-view .ml-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #9ea3b6;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    grid-column: span 2;
}

.match-logs-view .ml-field--small {
    grid-column: span 1;
}

.match-logs-view .ml-field--full {
    grid-column: 1 / -1;
}

.match-logs-view .ml-field span {
    font-weight: 500;
}

.match-logs-view .ml-form-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
}

.match-logs-view .ml-btn {
    padding: 10px 20px;
    border-radius: 24px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.match-logs-view .ml-btn--primary {
    background: #3eb489;
    color: #fff;
}

.match-logs-view .ml-btn--primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.match-logs-view .ml-btn--ghost {
    background: transparent;
    color: #c8cbd5;
    border: 1px solid #3a3f50;
}

.match-logs-view .ml-table-wrapper {
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
    border-radius: 12px;
    overflow: hidden;
    overflow-x: auto;
}

.match-logs-view .ml-table {
    width: 100%;
    border-collapse: collapse;
    color: #e7e9f0;
}

.match-logs-view .ml-table th,
.match-logs-view .ml-table td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid #232838;
    font-size: 14px;
    vertical-align: middle;
}

.match-logs-view .ml-table th {
    background: #161924;
    color: #9ea3b6;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    position: sticky;
    top: 0;
    z-index: 1;
}

.match-logs-view .ml-table tr.ml-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.match-logs-view .ml-table tr.ml-row.won {
    box-shadow: inset 4px 0 0 #3eb489;
}

.match-logs-view .ml-table tr.ml-row.loss {
    box-shadow: inset 4px 0 0 #d04a4a;
}

.match-logs-view .ml-table tr.ml-row.draw {
    box-shadow: inset 4px 0 0 #888;
}

.match-logs-view .ml-num {
    text-align: center;
    width: 40px;
}

.match-logs-view .ml-actions-col {
    text-align: right;
    width: 90px;
    white-space: nowrap;
}

.match-logs-view .ml-tag {
    display: inline-block;
    background: #2a2f3e;
    color: #c8cbd5;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
}

.match-logs-view .ml-result-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: #2a2f3e;
    color: #c8cbd5;
}

.match-logs-view .ml-result-pill.won {
    background: rgba(62, 180, 137, 0.15);
    color: #4dd9a8;
}

.match-logs-view .ml-result-pill.loss {
    background: rgba(208, 74, 74, 0.15);
    color: #ef6e6e;
}

.match-logs-view .ml-result-pill.draw {
    background: rgba(160, 160, 160, 0.15);
    color: #cdd1dc;
}

.match-logs-view .ml-video-cell a {
    color: #6aa9ff;
    text-decoration: none;
    font-weight: 600;
}

.match-logs-view .ml-video-cell a:hover {
    text-decoration: underline;
}

.match-logs-view .ml-video-placeholder {
    color: #6c7184;
    font-style: italic;
    font-size: 13px;
}

.match-logs-view .ml-notes-cell {
    max-width: 280px;
    color: #c8cbd5;
}

.match-logs-view .ml-icon-btn {
    background: transparent;
    color: #9ea3b6;
    border: 1px solid #2a2f3e;
    border-radius: 6px;
    width: 30px;
    height: 30px;
    line-height: 1;
    cursor: pointer;
    margin-left: 4px;
    padding: 0;
    font-size: 14px;
}

.match-logs-view .ml-icon-btn:hover {
    color: #fff;
    border-color: #3a3f50;
}

.match-logs-view .ml-icon-btn--danger:hover {
    color: #ef6e6e;
    border-color: #d04a4a;
}

.match-logs-view .ml-search-hint {
    color: #6c7184;
    font-size: 13px;
    font-style: italic;
    padding: 10px 0 2px;
}

/* ── Video panel ──────────────────────────────────────────────── */

.match-logs-view .ml-video-toggle-row {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding-top: 4px;
}

.match-logs-view .ml-video-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #11141d;
    color: #c8cbd5;
    border: 1px dashed #3a3f50;
    border-radius: 8px;
    padding: 9px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
}

.match-logs-view .ml-video-toggle-btn:hover,
.match-logs-view .ml-video-toggle-btn.active {
    border-color: #3eb489;
    color: #3eb489;
}

.match-logs-view .ml-video-toggle-icon {
    font-size: 16px;
    line-height: 1;
}

.match-logs-view .ml-video-set-hint {
    font-size: 13px;
    color: #3eb489;
    font-weight: 600;
}

.match-logs-view .ml-video-panel {
    flex-direction: column;
    gap: 0;
}

.match-logs-view .ml-video-panel-inner {
    background: #11141d;
    border: 1px solid #2a2f3e;
    border-radius: 10px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.match-logs-view .ml-video-input {
    width: 100%;
    box-sizing: border-box;
}

.match-logs-view .ml-video-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: #9ea3b6;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
    flex: 1;
}

.match-logs-view .ml-video-players {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.match-logs-view .ml-video-hint {
    font-size: 12px;
    color: #6c7184;
    margin: 0;
    line-height: 1.5;
}

.match-logs-view .ml-video-hint kbd {
    background: #2a2f3e;
    color: #c8cbd5;
    border-radius: 4px;
    padding: 1px 5px;
    font-family: monospace;
    font-size: 11px;
}

@media (max-width: 600px) {
    .match-logs-view .ml-video-players {
        grid-template-columns: 1fr;
    }
}

/* Make game-search / character-search fit the dark form theme */
.match-logs-view .game-search .multiselect__tags,
.match-logs-view .character-search .multiselect__tags {
    background: #11141d;
    border: 1px solid #2a2f3e;
    border-radius: 6px;
}

.match-logs-view .game-search .multiselect__input,
.match-logs-view .game-search .multiselect__single,
.match-logs-view .game-search .multiselect__placeholder,
.match-logs-view .character-search .multiselect__input,
.match-logs-view .character-search .multiselect__single,
.match-logs-view .character-search .multiselect__placeholder {
    background: #11141d;
    color: #e7e9f0;
}

.match-logs-view .game-search .multiselect__content-wrapper,
.match-logs-view .character-search .multiselect__content-wrapper {
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
}

.match-logs-view .game-search .multiselect__option,
.match-logs-view .character-search .multiselect__option {
    background: #1c1f2a;
    color: #e7e9f0;
}

.match-logs-view .game-search .multiselect__option--highlight,
.match-logs-view .character-search .multiselect__option--highlight {
    background: #3eb489;
    color: #fff;
}

.match-logs-view .ml-video-panel .players-search .multiselect__tags {
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
    border-radius: 6px;
}

.match-logs-view .ml-video-panel .players-search .multiselect__input,
.match-logs-view .ml-video-panel .players-search .multiselect__single,
.match-logs-view .ml-video-panel .players-search .multiselect__placeholder {
    background: #1c1f2a;
    color: #e7e9f0;
}

.match-logs-view .ml-video-panel .players-search .multiselect__content-wrapper {
    background: #1c1f2a;
    border: 1px solid #2a2f3e;
}

.match-logs-view .ml-video-panel .players-search .multiselect__option {
    background: #1c1f2a;
    color: #e7e9f0;
}

.match-logs-view .ml-video-panel .players-search .multiselect__option--highlight {
    background: #3eb489;
    color: #fff;
}

@media (max-width: 768px) {
    .match-logs-view {
        padding: 120px 12px 60px;
    }

    .match-logs-view .ml-form-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .match-logs-view .ml-field,
    .match-logs-view .ml-field--small {
        grid-column: span 1;
    }

    .match-logs-view .ml-summary {
        width: 100%;
        justify-content: space-between;
    }

    .match-logs-view .ml-table th,
    .match-logs-view .ml-table td {
        padding: 10px 8px;
        font-size: 13px;
    }

    .match-logs-view .ml-notes-cell {
        max-width: 180px;
    }
}
</style>
