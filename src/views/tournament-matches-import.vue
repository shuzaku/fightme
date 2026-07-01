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

        <v-card class="bulk-card" dark outlined>
            <v-card-title class="subtitle-1">Bulk import from list</v-card-title>
            <v-card-text>
                <p class="bulk-help">
                    Paste one match per line. This fills the match rows below with clip times,
                    players, and optional characters. Missing players and characters are created
                    automatically. For 2XKO tag teams, separate partners with
                    <code>//</code>. Characters use <code>/</code> or <code>,</code> inside
                    parentheses.
                </p>
                <p class="bulk-format">
                    <code>29:11 froggymustdie (blanka) v nuckledu (mai)</code>
                    <br />
                    <code>00:30:25 Ghirlanda (Kunimitsu) vs. Kirakira (Jun)</code>
                </p>
                <v-textarea
                    v-model="bulkImportText"
                    label="Match list"
                    placeholder="Paste timestamps and matchups here…"
                    outlined
                    dense
                    rows="10"
                    hide-details="auto"
                    class="bulk-textarea"
                />
                <v-btn
                    color="secondary"
                    class="mt-2"
                    :loading="bulkImporting"
                    :disabled="!bulkImportText.trim() || !gameId"
                    @click="applyBulkImport"
                >
                    Fill match rows from list
                </v-btn>
                <p v-if="!gameId" class="bulk-game-hint">Select a game above before filling rows.</p>
                <v-alert v-if="bulkImportMessage" type="info" dense outlined class="mt-3">{{
                    bulkImportMessage
                }}</v-alert>
                <v-alert v-if="bulkImportWarnings.length" type="warning" dense outlined class="mt-3">
                    <div v-for="(w, i) in bulkImportWarnings" :key="i">{{ w }}</div>
                </v-alert>
            </v-card-text>
        </v-card>

        <div v-for="(row, index) in matchRows" :key="row.uid" class="match-row">
            <v-card class="match-card" dark outlined>
                <v-card-title class="match-card-title">
                    <span>
                        Match {{ index + 1 }}
                        <span v-if="rowMatchupLabel(row)" class="match-parsed-label">
                            — {{ rowMatchupLabel(row) }}
                        </span>
                    </span>
                    <v-spacer />
                    <a
                        v-if="rowPreviewUrl(row)"
                        href="#"
                        class="match-preview-link"
                        @click.stop.prevent="openPreviewWindow(row)"
                    >
                        <v-icon small class="mr-1">mdi-open-in-new</v-icon>
                        Verify{{ row.clipStart ? ' at ' + row.clipStart : '' }}
                    </a>
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
import PlayersService from '@/services/players-service';
import CharactersService from '@/services/characters-service';
import { loadPlayers, setPlayersCache } from '@/services/players-cache';
import { loadCharacters, setCharactersCache } from '@/services/characters-cache';
import {
    parseBulkMatchLines,
    findPlayerByName,
    findCharacterByName,
    buildYoutubeWatchUrl,
} from '@/utils/tournament-bulk-match-parse';

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

function buildTeamSlotPlayers(resolvedPlayers, defaultStartSlot) {
    return resolvedPlayers.map((player, index) => ({
        id: player.id || null,
        name: player.name || null,
        characterIds: player.characterIds || [],
        slot: player.slot != null ? player.slot : defaultStartSlot + index,
        characterCount: 1,
    }));
}

function rowFromParsedMatch({
    clipStart,
    clipEnd,
    team1Players,
    team2Players,
    videoInput,
    notes,
    secondaryNotes,
}) {
    const row = emptyRow();
    row.videoInput = videoInput || '';
    row.clipStart = clipStart || '';
    row.clipEnd = clipEnd || '';
    row.notes = notes || '';
    row.secondaryNotes = secondaryNotes || '';
    row.match.team1Players = buildTeamSlotPlayers(team1Players || [], 1);
    row.match.team2Players = buildTeamSlotPlayers(team2Players || [], 2);
    return row;
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
            bulkImportText: '',
            bulkImporting: false,
            bulkImportMessage: '',
            bulkImportWarnings: [],
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

        rowMatchupLabel(row) {
            const formatTeam = (players) => {
                if (!players || !players.length) return '';
                return players
                    .map((p) => p.name)
                    .filter(Boolean)
                    .join(' / ');
            };
            const t1 = formatTeam(row.match && row.match.team1Players);
            const t2 = formatTeam(row.match && row.match.team2Players);
            if (!t1 || !t2) return '';
            return t1 + ' vs ' + t2;
        },

        rowPreviewUrl(row) {
            const videoId = extractVideoId(row.videoInput);
            if (!videoId) return null;
            return buildYoutubeWatchUrl(videoId, row.clipStart);
        },

        openPreviewWindow(row) {
            const url = this.rowPreviewUrl(row);
            if (!url) return;
            const features = [
                'popup=yes',
                'width=1280',
                'height=720',
                'resizable=yes',
                'scrollbars=yes',
                'noopener=yes',
                'noreferrer=yes',
            ].join(',');
            const win = window.open(url, 'matchPreview_' + row.uid, features);
            if (win) {
                win.opener = null;
            }
        },

        async refreshGameCharacters(characters) {
            const list = await loadCharacters(this.gameId, true);
            characters.splice(
                0,
                characters.length,
                ...list.map((c) => ({ id: c.id, name: c.name, Name: c.name }))
            );
        },

        async resolvePlayerId(name, players, warnings, matchLabel) {
            const found = findPlayerByName(players, name);
            if (found) return found.id;

            try {
                const resp = await PlayersService.addPlayer({ Name: name.trim() });
                const id = resp.data.playerId;
                players.push({ id, playerName: name.trim(), Name: name.trim() });
                return id;
            } catch (err) {
                warnings.push(matchLabel + ': could not create player "' + name + '"');
                return null;
            }
        },

        async resolveCharacterIds(names, characters, warnings, matchLabel, sideLabel) {
            const ids = [];
            for (const name of names) {
                let found = findCharacterByName(characters, name);
                if (found) {
                    ids.push(found.id);
                    continue;
                }

                try {
                    await CharactersService.addCharacter({
                        Name: name.trim(),
                        GameId: this.gameId,
                    });
                    await this.refreshGameCharacters(characters);
                    found = findCharacterByName(characters, name);
                    if (found) {
                        ids.push(found.id);
                    } else {
                        warnings.push(
                            matchLabel +
                                ' ' +
                                sideLabel +
                                ': created character "' +
                                name +
                                '" but could not resolve id'
                        );
                    }
                } catch (err) {
                    warnings.push(
                        matchLabel + ' ' + sideLabel + ': could not create character "' + name + '"'
                    );
                }
            }
            return ids;
        },

        async resolveTeamPlayers(teamPlayers, players, characters, warnings, matchLabel, sideLabel) {
            const resolved = [];
            for (let i = 0; i < teamPlayers.length; i++) {
                const entry = teamPlayers[i];
                const playerLabel = sideLabel + ' player ' + (i + 1);
                const id = await this.resolvePlayerId(
                    entry.playerName,
                    players,
                    warnings,
                    matchLabel + ' ' + playerLabel
                );
                const characterIds = entry.characterNames.length
                    ? await this.resolveCharacterIds(
                          entry.characterNames,
                          characters,
                          warnings,
                          matchLabel,
                          playerLabel
                      )
                    : [];
                resolved.push({
                    id,
                    name: entry.playerName,
                    characterIds,
                });
            }
            return resolved;
        },

        async applyBulkImport() {
            this.bulkImportMessage = '';
            this.bulkImportWarnings = [];
            this.validationMessage = '';

            if (!this.gameId) {
                this.bulkImportWarnings.push('Select a game before filling match rows.');
                return;
            }

            const { matches, errors } = parseBulkMatchLines(this.bulkImportText);
            if (errors.length) {
                this.bulkImportWarnings = errors;
                return;
            }
            if (!matches.length) {
                this.bulkImportMessage = 'No matches found in the pasted text.';
                return;
            }

            const template = this.matchRows[0] || emptyRow();
            const videoInput = template.videoInput || '';
            const notes = template.notes || '';
            const secondaryNotes = template.secondaryNotes || '';

            this.bulkImporting = true;
            try {
                const [playersList, charactersList] = await Promise.all([
                    loadPlayers(),
                    loadCharacters(this.gameId),
                ]);

                const players = playersList.map((p) => ({
                    id: p.id,
                    playerName: p.playerName,
                    Name: p.playerName,
                }));
                const characters = charactersList.map((c) => ({
                    id: c.id,
                    name: c.name,
                    Name: c.name,
                }));
                const warnings = [];
                const rows = [];

                for (let i = 0; i < matches.length; i++) {
                    const m = matches[i];
                    const label = 'Match ' + (i + 1);

                    const team1Players = await this.resolveTeamPlayers(
                        m.team1Players,
                        players,
                        characters,
                        warnings,
                        label,
                        'team 1'
                    );
                    const team2Players = await this.resolveTeamPlayers(
                        m.team2Players,
                        players,
                        characters,
                        warnings,
                        label,
                        'team 2'
                    );

                    rows.push(
                        rowFromParsedMatch({
                            clipStart: m.clipStart,
                            clipEnd: m.clipEnd,
                            team1Players,
                            team2Players,
                            videoInput,
                            notes,
                            secondaryNotes,
                        })
                    );
                }

                setPlayersCache(players);
                setCharactersCache(this.gameId, characters);
                this.matchRows = rows;
                this.bulkImportWarnings = warnings;
                this.bulkImportMessage =
                    'Added ' +
                    rows.length +
                    ' match row(s). Review any warnings, then save when ready.';
            } catch (err) {
                this.bulkImportWarnings = [
                    (err.response && err.response.data && err.response.data.error) ||
                        err.message ||
                        'Could not fill match rows',
                ];
            } finally {
                this.bulkImporting = false;
            }
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

.bulk-card {
    margin-top: 20px;
    background: rgba(0, 0, 0, 0.35) !important;
}

.bulk-help {
    opacity: 0.85;
    line-height: 1.5;
    margin-bottom: 8px;
}

.bulk-format {
    margin-bottom: 12px;
    font-size: 0.85rem;
    opacity: 0.9;
}

.bulk-format code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.1em 0.35em;
    border-radius: 4px;
}

.bulk-textarea {
    margin-top: 8px;
}

.bulk-game-hint {
    margin-top: 8px;
    font-size: 0.85rem;
    opacity: 0.75;
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

.match-parsed-label {
    font-weight: normal;
    opacity: 0.75;
    font-size: 0.9em;
}

.match-preview-link {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
    color: #8ab4f8;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
}

.match-preview-link:hover {
    text-decoration: underline;
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
