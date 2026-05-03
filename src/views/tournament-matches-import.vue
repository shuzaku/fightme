<!-- @format -->
<template>
    <div class="tournament-matches-import">
        <div class="admin-header">
            <h1>Add tournament matches</h1>
            <p>
                Pick the game and tournament once, then add one or more VOD clips. Each row is one
                match in the
                <code>tournament-matches</code>
                collection. Use search for players and characters instead of pasting ids.
            </p>
        </div>

        <v-card class="session-card" dark outlined>
            <v-card-title class="subtitle-1">Event &amp; game</v-card-title>
            <v-card-text>
                <div class="field-grid">
                    <div class="field">
                        <label class="field-label">Tournament</label>
                        <tournament-search @update:tournament="onTournament($event)" />
                    </div>
                    <div class="field">
                        <label class="field-label">Game</label>
                        <game-search
                            v-model="gameId"
                            :filtered-game-ids="tournamentGameIds"
                            placeholder="Search game"
                            @update:game="onGame($event)"
                        />
                    </div>
                    <div class="field field-narrow">
                        <label class="field-label">Video platform</label>
                        <v-select
                            v-model="videoPlatform"
                            :items="platformOptions"
                            dense
                            outlined
                            hide-details
                        />
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <div v-for="(row, index) in matchRows" :key="row.uid" class="match-row">
            <v-card class="match-card" dark outlined>
                <v-card-title class="match-card-title">
                    <span>Match {{ index + 1 }}</span>
                    <v-spacer />
                    <v-btn v-if="matchRows.length > 1" icon small @click="removeRow(index)">
                        <v-icon small>mdi-delete-outline</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div class="video-fields">
                        <v-text-field
                            v-model="row.videoInput"
                            label="Video URL or id (YouTube)"
                            placeholder="e.g. dQw4w9WgXcQ or full watch URL"
                            outlined
                            dense
                            hide-details="auto"
                            class="video-input"
                            @input="onMatchVideoInput(index)"
                        />
                        <div class="time-pair">
                            <v-text-field
                                v-model="row.clipStart"
                                label="Clip start (optional)"
                                placeholder="0:18:06 or HH:MM:SS"
                                outlined
                                dense
                                hide-details="auto"
                            />
                            <v-text-field
                                v-model="row.clipEnd"
                                label="Clip end (optional)"
                                outlined
                                dense
                                hide-details="auto"
                                @input="onClipEndInput(index)"
                            />
                        </div>
                        <div class="notes-pair">
                            <v-text-field
                                v-model="row.notes"
                                label="Notes (optional)"
                                placeholder="e.g. Top 8"
                                outlined
                                dense
                                hide-details="auto"
                                @input="onMatchNotesFromMatch1(index, 'notes')"
                            />
                            <v-text-field
                                v-model="row.secondaryNotes"
                                label="Secondary notes (optional)"
                                placeholder="e.g. Winners Semi"
                                outlined
                                dense
                                hide-details="auto"
                                @input="onMatchNotesFromMatch1(index, 'secondaryNotes')"
                            />
                        </div>
                    </div>

                    <div v-if="!gameId" class="needs-game">
                        <v-alert type="info" dense outlined
                            >Select a game above to search characters.</v-alert
                        >
                    </div>
                    <add-match
                        v-else
                        :game-id="gameId"
                        :match="row.match"
                        @update:match="updateRowMatch($event, index)"
                    />
                </v-card-text>
            </v-card>
        </div>

        <div class="actions">
            <v-btn class="mr-2" outlined dark @click="addRow">Add another match</v-btn>
            <v-btn color="primary" :loading="submitting" :disabled="!canSubmit" @click="submitAll">
                Save {{ matchRows.length }} match(es)
            </v-btn>
        </div>

        <v-alert v-if="validationMessage" type="warning" dense outlined class="mt-4">{{
            validationMessage
        }}</v-alert>
        <v-alert v-if="submitError" type="error" class="mt-4" outlined>{{ submitError }}</v-alert>
        <v-alert v-if="submitSuccess" type="success" class="mt-4" outlined>{{
            submitSuccess
        }}</v-alert>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import TournamentSearch from '@/components/tournament/tournament-search.vue';
import AddMatch from '@/components/videos/add-match';
import TournamentMatchService from '@/services/tournament-match-service';

let uidSeq = 0;
function nextUid() {
    uidSeq += 1;
    return 'm-' + uidSeq;
}

function emptyMatchState() {
    return {
        team1Players: [
            {
                id: null,
                characterIds: [],
                slot: 1,
                characterCount: 1,
            },
        ],
        team2Players: [
            {
                id: null,
                characterIds: [],
                slot: 2,
                characterCount: 1,
            },
        ],
        winningPlayers: null,
        losingPlayers: null,
    };
}

function emptyRow() {
    return {
        uid: nextUid(),
        videoInput: '',
        clipStart: '',
        clipEnd: '',
        notes: '',
        secondaryNotes: '',
        match: emptyMatchState(),
    };
}

function extractVideoId(raw) {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (!s) return '';
    if (s.includes('youtu.be/')) {
        return s.split('youtu.be/')[1].split(/[?&#]/)[0];
    }
    if (s.includes('youtube.com') || s.includes('youtube-nocookie.com')) {
        const vMatch = s.match(/[?&]v=([^&]+)/);
        if (vMatch) return vMatch[1];
        const embedMatch = s.match(/\/embed\/([^?&#]+)/);
        if (embedMatch) return embedMatch[1];
    }
    if (s.includes('v=')) {
        let id = s.substring(s.indexOf('v=') + 2);
        const amp = id.indexOf('&');
        if (amp !== -1) id = id.substring(0, amp);
        return id;
    }
    return s;
}

export default {
    name: 'TournamentMatchesImport',

    components: {
        'game-search': GameSearch,
        'tournament-search': TournamentSearch,
        'add-match': AddMatch,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            tournamentId: '',
            gameId: '',
            selectedTournament: null,
            videoPlatform: 'Youtube',
            platformOptions: ['Youtube', 'Twitch', 'Twitter'],
            matchRows: [emptyRow()],
            submitting: false,
            validationMessage: '',
            submitError: null,
            submitSuccess: null,
        };
    },

    computed: {
        tournamentGameIds() {
            if (
                !this.selectedTournament ||
                !this.selectedTournament.games ||
                !this.selectedTournament.games.length
            ) {
                return null;
            }
            var ids = this.selectedTournament.games
                .map(function (g) {
                    if (!g || g.id == null) return null;
                    return g.id.toString ? g.id.toString() : String(g.id);
                })
                .filter(Boolean);
            return ids.length ? ids : null;
        },

        canSubmit() {
            return !!(this.tournamentId && this.gameId && this.matchRows.length);
        },
    },

    methods: {
        onTournament(t) {
            this.selectedTournament = t || null;
            this.tournamentId = t && t.id ? t.id : '';
        },

        onGame(g) {
            this.gameId = g && g.id ? g.id : '';
        },

        addRow() {
            var r0 = this.matchRows[0];
            var v0 = (r0 && r0.videoInput) || '';
            var prev = this.matchRows[this.matchRows.length - 1];
            var newRow = emptyRow();
            newRow.videoInput = v0;
            if (r0) {
                newRow.notes = r0.notes || '';
                newRow.secondaryNotes = r0.secondaryNotes || '';
            }
            if (prev && (prev.clipEnd || '').trim()) {
                newRow.clipStart = (prev.clipEnd || '').trim();
            }
            this.matchRows.push(newRow);
        },

        onMatchNotesFromMatch1(index, field) {
            if (index !== 0) return;
            var v = this.matchRows[0][field];
            for (var i = 1; i < this.matchRows.length; i++) {
                this.$set(this.matchRows[i], field, v);
            }
        },

        onClipEndInput(index) {
            var next = index + 1;
            if (next >= this.matchRows.length) return;
            var endVal = (this.matchRows[index].clipEnd || '').trim();
            this.$set(this.matchRows[next], 'clipStart', endVal);
        },

        onMatchVideoInput(index) {
            if (index !== 0) return;
            var v = this.matchRows[0].videoInput;
            for (var i = 1; i < this.matchRows.length; i++) {
                this.$set(this.matchRows[i], 'videoInput', v);
            }
        },

        removeRow(index) {
            if (this.matchRows.length <= 1) return;
            this.matchRows.splice(index, 1);
        },

        updateRowMatch(match, index) {
            this.matchRows[index].match = match;
        },

        buildApiMatch(row) {
            const m = row.match;
            const team1 = (m.team1Players || []).map((p, i) => ({
                Id: p.id,
                Slot: p.slot != null ? parseInt(p.slot, 10) : i + 1,
                CharacterIds: (p.characterIds || []).map((cid) =>
                    typeof cid === 'object' && cid.id ? cid.id : cid
                ),
            }));
            const team2 = (m.team2Players || []).map((p, i) => ({
                Id: p.id,
                Slot: p.slot != null ? parseInt(p.slot, 10) : i + 2,
                CharacterIds: (p.characterIds || []).map((cid) =>
                    typeof cid === 'object' && cid.id ? cid.id : cid
                ),
            }));

            const payload = {
                TournamentId: this.tournamentId,
                GameId: this.gameId,
                VideoUrl: extractVideoId(row.videoInput),
                Team1Players: team1,
                Team2Players: team2,
                ClipStart: (row.clipStart || '').trim(),
                ClipEnd: (row.clipEnd || '').trim(),
                VideoPlatform: this.videoPlatform || 'Youtube',
            };
            const notes = (row.notes || '').trim();
            const sec = (row.secondaryNotes || '').trim();
            if (notes) payload.Notes = notes;
            if (sec) payload.SecondaryNotes = sec;
            return payload;
        },

        validateRow(row, index) {
            const videoId = extractVideoId(row.videoInput);
            if (!videoId) return 'Match ' + (index + 1) + ': add a video URL or id.';

            const m = row.match;
            const t1 = m.team1Players || [];
            const t2 = m.team2Players || [];
            if (!t1.length || !t2.length)
                return 'Match ' + (index + 1) + ': both teams need players.';

            for (let i = 0; i < t1.length; i++) {
                if (!t1[i].id)
                    return 'Match ' + (index + 1) + ': team 1 player ' + (i + 1) + ' is missing.';
            }
            for (let i = 0; i < t2.length; i++) {
                if (!t2[i].id)
                    return 'Match ' + (index + 1) + ': team 2 player ' + (i + 1) + ' is missing.';
            }

            return '';
        },

        async submitAll() {
            this.validationMessage = '';
            this.submitError = null;
            this.submitSuccess = null;

            if (!this.tournamentId) {
                this.validationMessage = 'Select a tournament.';
                return;
            }
            if (!this.gameId) {
                this.validationMessage = 'Select a game.';
                return;
            }

            for (let i = 0; i < this.matchRows.length; i++) {
                const err = this.validateRow(this.matchRows[i], i);
                if (err) {
                    this.validationMessage = err;
                    return;
                }
            }

            const matches = this.matchRows.map((r) => this.buildApiMatch(r));

            this.submitting = true;
            try {
                const res = await TournamentMatchService.bulkInsertTournamentMatches(matches);
                const n =
                    res.data && res.data.insertedCount != null
                        ? res.data.insertedCount
                        : matches.length;
                this.submitSuccess = 'Saved ' + n + ' tournament match(es).';
                this.matchRows = [emptyRow()];
            } catch (err) {
                const msg =
                    (err.response && err.response.data && err.response.data.error) ||
                    err.message ||
                    'Save failed';
                this.submitError = msg;
            } finally {
                this.submitting = false;
            }
        },
    },
};
</script>

<style scoped>
.tournament-matches-import {
    max-width: 1000px;
    margin: 0 auto;
    padding: 200px 24px 48px;
    color: #fff;
}

.admin-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
}

.admin-header p {
    opacity: 0.85;
    line-height: 1.5;
}

.admin-header code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.1em 0.35em;
    border-radius: 4px;
}

.session-card {
    margin-top: 24px;
    background: rgba(0, 0, 0, 0.35) !important;
}

.field-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-end;
}

.field {
    flex: 1 1 240px;
    min-width: 200px;
}

.field-narrow {
    flex: 0 0 180px;
}

.field-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.7;
    margin-bottom: 6px;
}

.match-row {
    margin-top: 20px;
}

.match-card {
    background: rgba(0, 0, 0, 0.3) !important;
}

.match-card-title {
    font-size: 1rem !important;
    padding-bottom: 8px !important;
}

.video-fields {
    margin-bottom: 20px;
}

.video-input {
    margin-bottom: 12px;
}

.time-pair,
.notes-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

@media (max-width: 600px) {
    .time-pair,
    .notes-pair {
        grid-template-columns: 1fr;
    }
}

.needs-game {
    margin-bottom: 16px;
}

.actions {
    margin-top: 28px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

/* add-match is styled for light backgrounds elsewhere — keep text readable */
.match-card >>> .add-match {
    color: rgba(255, 255, 255, 0.92);
}

.match-card >>> .add-match .versus {
    color: rgba(255, 255, 255, 0.85);
}

.match-card >>> .add-match h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
}
</style>
