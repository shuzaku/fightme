<!-- @format -->
<template>
    <div ref="videoList" class="tournament-match-video-card">
        <div class="match-card card">
            <div
                :id="video.matchId"
                v-waypoint="{
                    active: true,
                    callback: onWaypoint,
                    options: intersectionOptions,
                }"
                class="video-container"
            >
                <youtube-media
                    v-if="video.videoType === 'Youtube'"
                    ref="youtubeRef"
                    :video-id="video.videoUrl"
                    :player-width="556"
                    :player-height="313"
                    :player-vars="{
                        rel: 0,
                        start: video.match.startTime,
                        end: video.match.endTime,
                    }"
                    :mute="true"
                    :playsinline="1"
                    @ready="ready"
                />
                <app-twitch-player
                    v-if="video.videoType === 'Twitch'"
                    :video="video"
                    :isPlaying="isPlaying"
                />
            </div>
            <div class="card-label">Match</div>

            <!-- ── READ VIEW ─────────────────────────────────────────── -->
            <div v-if="!isEditing" class="aside">
                <div class="info">
                    <div class="top">
                        <div class="game">
                            <div class="game-title" @click="queryGame(video.game.id)">
                                <p>
                                    <span>
                                        <div class="img-container">
                                            <img :src="video.game.logoUrl" />
                                        </div>
                                        {{ video.game.title }}</span
                                    >
                                </p>
                            </div>
                        </div>
                        <div class="players">
                            <div class="team1">
                                <div
                                    v-for="team1Player in video.match.team1Players"
                                    :key="team1Player.id"
                                    class="player"
                                >
                                    <div
                                        class="heavy-weight player-name"
                                        @click="queryPlayer(team1Player.id)"
                                    >
                                        <p>{{ team1Player.name }}</p>
                                    </div>
                                    <div class="characters">
                                        <div
                                            v-for="(character, index) in team1Player.characters"
                                            :key="index"
                                            class="character"
                                        >
                                            <div
                                                class="character-name"
                                                @click="queryCharacter(character.id)"
                                            >
                                                <p>
                                                    <span>
                                                        <div class="img-container">
                                                            <img :src="character.imageUrl" />
                                                        </div>
                                                        {{ character.name }}</span
                                                    >
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="team2">
                                <div
                                    v-for="team2Player in video.match.team2Players"
                                    :key="team2Player.id"
                                    class="player"
                                >
                                    <div
                                        class="heavy-weight player-name"
                                        @click="queryPlayer(team2Player.id)"
                                    >
                                        <p>{{ team2Player.name }}</p>
                                    </div>
                                    <div class="characters">
                                        <div
                                            v-for="(character, index) in team2Player.characters"
                                            :key="index"
                                            class="character"
                                        >
                                            <div
                                                class="character-name"
                                                @click="queryCharacter(character.id)"
                                            >
                                                <p>
                                                    <span>
                                                        <div class="img-container">
                                                            <img :src="character.imageUrl" />
                                                        </div>
                                                        {{ character.name }}</span
                                                    >
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tournament-section">
                        <div class="tournament-title">
                            <img class="tournament-image" :src="video.tournament.logoUrl" />
                            <div class="tournament-info">
                                <p>{{ video.tournament.name }}</p>
                                <p class="notes">{{ video.match.notes }}</p>
                                <p class="notes">{{ video.match.secondaryNotes }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="admin-controls">
                    <v-btn
                        v-if="isAdmin"
                        class="edit-button"
                        title="Edit tournament match"
                        :loading="editLoading"
                        @click.stop="openEdit"
                    >
                        <v-icon light>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                        class="view-match-button"
                        :disabled="!canOpenMatchPage"
                        title="Open tournament match page"
                        @click.stop="goToMatchPage"
                    >
                        <v-icon light> mdi-open-in-new </v-icon>
                    </v-btn>
                </div>
            </div>

            <!-- ── EDIT VIEW ──────────────────────────────────────────── -->
            <div v-else class="aside aside--edit">
                <div class="edit-scroll">
                    <div class="field-grid">
                        <div class="field">
                            <label class="field-label">Tournament</label>
                            <tournament-search
                                :key="'tedit-' + video.matchId"
                                :initial-tournament-id="editTournamentId"
                                @update:tournament="onEditTournament($event)"
                            />
                        </div>
                        <div class="field">
                            <label class="field-label">Game</label>
                            <game-search
                                :value="editGameId"
                                :filtered-game-ids="editTournamentGameIds"
                                placeholder="Search game"
                                @update:game="onEditGame($event)"
                            />
                        </div>
                        <div class="field field-narrow">
                            <label class="field-label">Platform</label>
                            <v-select
                                v-model="editVideoPlatform"
                                :items="platformOptions"
                                dense
                                outlined
                                hide-details
                            />
                        </div>
                    </div>

                    <v-text-field
                        v-model="editVideoInput"
                        label="Video URL or id"
                        outlined
                        dense
                        hide-details="auto"
                        class="video-input mt-2"
                    />

                    <div class="time-pair mt-2">
                        <v-text-field
                            v-model="editClipStart"
                            label="Clip start"
                            placeholder="HH:MM:SS"
                            outlined
                            dense
                            hide-details="auto"
                        />
                        <v-text-field
                            v-model="editClipEnd"
                            label="Clip end"
                            outlined
                            dense
                            hide-details="auto"
                        />
                    </div>

                    <div class="notes-pair mt-2">
                        <v-text-field
                            v-model="editNotes"
                            label="Notes"
                            outlined
                            dense
                            hide-details="auto"
                        />
                        <v-text-field
                            v-model="editSecondaryNotes"
                            label="Secondary notes"
                            outlined
                            dense
                            hide-details="auto"
                        />
                    </div>

                    <div v-if="!editGameId" class="needs-game mt-2">
                        <v-alert type="info" dense outlined>Select a game to edit players.</v-alert>
                    </div>
                    <add-match
                        v-else
                        class="mt-2"
                        :game-id="editGameId"
                        :match="editMatch"
                        @update:match="editMatch = $event"
                    />

                    <v-alert v-if="editError" type="error" dense outlined class="mt-2">{{
                        editError
                    }}</v-alert>
                </div>

                <div class="admin-controls admin-controls--edit">
                    <v-btn text dark small :disabled="editSaving" @click="cancelEdit">Cancel</v-btn>
                    <v-btn
                        color="primary"
                        small
                        :loading="editSaving"
                        :disabled="!canSaveEdit"
                        @click="saveEdit"
                    >
                        Save
                    </v-btn>
                </div>
            </div>
        </div>

        <!-- ── ANALYSIS STATS ────────────────────────────────────────────── -->
        <div v-if="analysis && (analysisSummary || analysisTimestamps.length)" class="match-analysis-details">
            <div class="nav">
                <div
                    :class="[currentNav === 'general' ? 'active' : '']"
                    class="navItem"
                    @click="setNav('general')"
                >
                    General
                </div>
                <div
                    :class="[currentNav === 'player1' ? 'active' : '']"
                    class="navItem"
                    @click="setNav('player1')"
                >
                    Player 1
                </div>
                <div
                    :class="[currentNav === 'player2' ? 'active' : '']"
                    class="navItem"
                    @click="setNav('player2')"
                >
                    Player 2
                </div>
                <div
                    :class="[currentNav === 'stats' ? 'active' : '']"
                    class="navItem"
                    @click="setNav('stats')"
                >
                    Stats
                </div>
            </div>

            <div v-if="currentNav === 'player1'" class="player1">
                <template v-for="cat in analysisCategories">
                    <div
                        v-if="p1Timestamps(cat.key).length > 0"
                        :key="'p1-' + cat.key"
                        class="trigger"
                    >
                        <h4 @click="toggleCategory('p1-' + cat.key)">
                            <span class="category-icon">{{ collapsedCategories['p1-' + cat.key] ? '▶' : '▼' }}</span>
                            {{ cat.label }}
                            <span class="count-badge">{{ p1Timestamps(cat.key).length }}</span>
                        </h4>
                        <div v-show="!collapsedCategories['p1-' + cat.key]" class="label">
                            <div v-for="(ts, i) in p1Timestamps(cat.key)" :key="i">
                                <a @click="seekToTimeStamp(ts.s)">{{ ts.formattedTime }}</a>
                            </div>
                        </div>
                    </div>
                </template>
                <p v-if="player1Timestamps.length === 0" class="no-data">No Player 1 detections found.</p>
            </div>

            <div v-if="currentNav === 'player2'" class="player2">
                <template v-for="cat in analysisCategories">
                    <div
                        v-if="p2Timestamps(cat.key).length > 0"
                        :key="'p2-' + cat.key"
                        class="trigger"
                    >
                        <h4 @click="toggleCategory('p2-' + cat.key)">
                            <span class="category-icon">{{ collapsedCategories['p2-' + cat.key] ? '▶' : '▼' }}</span>
                            {{ cat.label }}
                            <span class="count-badge">{{ p2Timestamps(cat.key).length }}</span>
                        </h4>
                        <div v-show="!collapsedCategories['p2-' + cat.key]" class="label">
                            <div v-for="(ts, i) in p2Timestamps(cat.key)" :key="i">
                                <a @click="seekToTimeStamp(ts.s)">{{ ts.formattedTime }}</a>
                            </div>
                        </div>
                    </div>
                </template>
                <p v-if="player2Timestamps.length === 0" class="no-data">No Player 2 detections found.</p>
            </div>

            <div v-if="currentNav === 'stats'" class="stats">
                <div v-if="analysisSummary" class="analysis-summary">
                    <div class="summary-item">
                        <span class="summary-label">Duration</span>
                        <span class="summary-value">{{ analysisSummary.video_duration_timestamp }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Events</span>
                        <span class="summary-value">{{ analysisSummary.total_events }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Events / Min</span>
                        <span class="summary-value">{{ analysisSummary.events_per_minute }}</span>
                    </div>
                </div>
                <table>
                    <tr>
                        <th></th>
                        <th>P1</th>
                        <th>P2</th>
                    </tr>
                    <tr v-for="cat in analysisCategories" :key="cat.key">
                        <td>{{ cat.label }}</td>
                        <td class="value">{{ p1Timestamps(cat.key).length }}</td>
                        <td class="value">{{ p2Timestamps(cat.key).length }}</td>
                    </tr>
                </table>
            </div>

            <div v-if="currentNav === 'general'" class="general-info">
                <p>Select Player 1, Player 2, or Stats to view detailed analysis.</p>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import AppTwitchPlayer from '@/components/media-player/app-twitch-player.vue';
import TournamentMatchService from '@/services/tournament-match-service';
import GameSearch from '@/components/games/game-search';
import TournamentSearch from '@/components/tournament/tournament-search.vue';
import AddMatch from '@/components/videos/add-match';

const GAME_CATEGORIES = {
    '606d42021ddff92064798667': [
        { key: 'counter', label: 'Counter' },
        { key: 'burst', label: 'Burst' },
        { key: 'punish', label: 'Punish' },
    ],
    default: [
        { key: 'counter', label: 'Counter' },
        { key: 'punish_counter', label: 'Punish Counter' },
        { key: 'reversal', label: 'Reversal' },
        { key: 'hard_knockdown', label: 'Hard Knockdown' },
        { key: 'throw_escape', label: 'Throw Escape' },
        { key: 'just', label: 'Just' },
    ],
};

function emptyMatchState() {
    return {
        team1Players: [{ id: null, characterIds: [], slot: 1, characterCount: 1 }],
        team2Players: [{ id: null, characterIds: [], slot: 2, characterCount: 1 }],
        winningPlayers: null,
        losingPlayers: null,
    };
}

function extractVideoId(raw) {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (!s) return '';
    if (s.includes('youtu.be/')) return s.split('youtu.be/')[1].split(/[?&#]/)[0];
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
    inheritAttrs: false,
    name: 'TournamentMatchVideoCard',
    components: {
        'app-twitch-player': AppTwitchPlayer,
        'game-search': GameSearch,
        'tournament-search': TournamentSearch,
        'add-match': AddMatch,
    },

    props: {
        video: {
            type: Object,
            default: null,
        },
        isFirst: {
            type: Boolean,
            default: false,
        },
        account: {
            type: Object,
            default: null,
        },
        rawMatch: {
            type: Object,
            default: null,
        },
        analysis: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            videoCurrentTime: 0,
            isLoading: true,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
            player: null,
            collections: null,
            showCollections: false,
            isPlaying: false,
            isEditing: false,
            editLoading: false,
            editSaving: false,
            editError: null,
            editTournamentId: '',
            editGameId: '',
            editSelectedTournament: null,
            editVideoInput: '',
            editClipStart: '',
            editClipEnd: '',
            editNotes: '',
            editSecondaryNotes: '',
            editVideoPlatform: 'Youtube',
            editMatch: emptyMatchState(),
            platformOptions: ['Youtube', 'Twitch', 'Twitter'],
            currentNav: 'general',
            collapsedCategories: {},
        };
    },

    computed: {
        isAdmin() {
            return !!(this.account && this.account.role === 'admin');
        },
        canOpenMatchPage() {
            return !!(this.video && this.video.matchId);
        },
        editTournamentGameIds() {
            if (
                !this.editSelectedTournament ||
                !this.editSelectedTournament.games ||
                !this.editSelectedTournament.games.length
            ) {
                return null;
            }
            return this.editSelectedTournament.games
                .map((g) => (g && g.id != null ? String(g.id) : null))
                .filter(Boolean);
        },
        canSaveEdit() {
            return !!(this.editTournamentId && this.editGameId && !this.editSaving);
        },
        analysisTimestamps() {
            return this.analysis && this.analysis.timestamps ? this.analysis.timestamps : [];
        },
        analysisSummary() {
            return this.analysis ? this.analysis.summary : null;
        },
        player1Timestamps() {
            return this.analysisTimestamps.filter((t) => t.player === 1);
        },
        player2Timestamps() {
            return this.analysisTimestamps.filter((t) => t.player === 2);
        },
        analysisCategories() {
            var gameId = this.video && this.video.game && String(this.video.game.id);
            return GAME_CATEGORIES[gameId] || GAME_CATEGORIES.default;
        },
    },

    watch: {
        isPlaying() {
            if (this.video.videoType === 'uploaded') {
                if (this.isPlaying === true) {
                    this.$refs.videoRef.play();
                } else {
                    this.$refs.videoRef.pause();
                }
            } else if (this.video.videoType.toLowerCase() === 'youtube' && this.player) {
                if (this.isPlaying === true) {
                    this.player.playVideo();
                } else {
                    this.player.pauseVideo();
                }
            }

            if (this.value === true && this.video.match.startTime) {
                this.setTimer();
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > parseInt(this.video.match.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.match.startTime);
            }
        },
    },

    created() {
        this.isPlaying = this.video.isPlaying;
    },

    methods: {
        /* ── edit ─────────────────────────────────────────── */

        async openEdit() {
            var raw = this.rawMatch;
            if (!raw) {
                if (!this.video || !this.video.matchId) return;
                this.editLoading = true;
                try {
                    const response = await TournamentMatchService.getTournamentMatchById(
                        String(this.video.matchId)
                    );
                    const list = response.data && response.data.matches;
                    if (!list || !list.length) return;
                    raw = list[0];
                } catch (e) {
                    console.error('openEdit: failed to fetch raw match', e);
                    return;
                } finally {
                    this.editLoading = false;
                }
            }
            this.editError = null;
            this.editVideoInput = raw.VideoUrl || '';
            this.editClipStart = raw.ClipStart || '';
            this.editClipEnd = raw.ClipEnd || '';
            this.editNotes = raw.Notes || '';
            this.editSecondaryNotes = raw.SecondaryNotes || '';
            this.editVideoPlatform = raw.VideoPlatform || 'Youtube';
            this.editTournamentId = raw.TournamentId ? String(raw.TournamentId) : '';
            this.editGameId = raw.GameId ? String(raw.GameId) : '';
            var t0 = raw.Tournament && raw.Tournament[0];
            this.editSelectedTournament = t0
                ? {
                      id: t0._id,
                      name: t0.Name,
                      games: (t0.Games || [])
                          .map((gid) => {
                              var id = gid != null && gid.toString ? gid.toString() : String(gid || '');
                              return id ? { id, title: '' } : null;
                          })
                          .filter(Boolean),
                  }
                : null;
            this.editMatch = this.mapRawToEditMatch(raw);
            this.isEditing = true;
        },

        cancelEdit() {
            this.isEditing = false;
            this.editError = null;
        },

        onEditTournament(t) {
            this.editSelectedTournament = t || null;
            this.editTournamentId = t && t.id ? String(t.id) : '';
        },

        onEditGame(g) {
            this.editGameId = g && g.id ? String(g.id) : '';
        },

        mapRawToEditMatch(raw) {
            function mapTeam(players, defaultSlotBase) {
                if (!players || !players.length) {
                    return [{ id: null, characterIds: [], slot: defaultSlotBase, characterCount: 1 }];
                }
                return players.map((p, i) => ({
                    id: p.Id != null ? (p.Id.toString ? p.Id.toString() : String(p.Id)) : null,
                    name: null,
                    characterIds: (p.CharacterIds || []).map((c) =>
                        c != null && c.toString ? c.toString() : String(c)
                    ),
                    slot: p.Slot != null ? parseInt(p.Slot, 10) : defaultSlotBase + i,
                    characterCount: (p.CharacterIds || []).length || 1,
                }));
            }
            return {
                team1Players: mapTeam(raw.Team1Players, 1),
                team2Players: mapTeam(raw.Team2Players, 2),
                winningPlayers: null,
                losingPlayers: null,
            };
        },

        validateEdit() {
            if (!extractVideoId(this.editVideoInput)) return 'Add a video URL or id.';
            var m = this.editMatch;
            var t1 = m.team1Players || [];
            var t2 = m.team2Players || [];
            if (!t1.length || !t2.length) return 'Both teams need players.';
            for (var i = 0; i < t1.length; i++) {
                if (!t1[i].id) return 'Team 1 player ' + (i + 1) + ' is missing.';
            }
            for (var j = 0; j < t2.length; j++) {
                if (!t2[j].id) return 'Team 2 player ' + (j + 1) + ' is missing.';
            }
            if (!this.editTournamentId) return 'Select a tournament.';
            if (!this.editGameId) return 'Select a game.';
            return '';
        },

        buildUpdatePayload() {
            var m = this.editMatch;
            return {
                TournamentId: this.editTournamentId,
                GameId: this.editGameId,
                VideoUrl: extractVideoId(this.editVideoInput),
                Team1Players: (m.team1Players || []).map((p, i) => ({
                    Id: p.id,
                    Slot: p.slot != null ? parseInt(p.slot, 10) : i + 1,
                    CharacterIds: (p.characterIds || []).map((cid) =>
                        typeof cid === 'object' && cid.id ? cid.id : cid
                    ),
                })),
                Team2Players: (m.team2Players || []).map((p, i) => ({
                    Id: p.id,
                    Slot: p.slot != null ? parseInt(p.slot, 10) : i + 2,
                    CharacterIds: (p.characterIds || []).map((cid) =>
                        typeof cid === 'object' && cid.id ? cid.id : cid
                    ),
                })),
                ClipStart: (this.editClipStart || '').trim(),
                ClipEnd: (this.editClipEnd || '').trim(),
                VideoPlatform: this.editVideoPlatform || 'Youtube',
                Notes: (this.editNotes || '').trim(),
                SecondaryNotes: (this.editSecondaryNotes || '').trim(),
            };
        },

        async saveEdit() {
            this.editError = null;
            var err = this.validateEdit();
            if (err) {
                this.editError = err;
                return;
            }
            this.editSaving = true;
            try {
                await TournamentMatchService.updateTournamentMatch(
                    String(this.video.matchId),
                    this.buildUpdatePayload()
                );
                this.isEditing = false;
                this.$emit('match-updated');
            } catch (e) {
                this.editError =
                    (e.response && e.response.data && e.response.data.error) ||
                    e.message ||
                    'Save failed';
            } finally {
                this.editSaving = false;
            }
        },

        /* ── playback ──────────────────────────────────────── */

        seekToTimestamp(seconds) {
            if (this.$refs.youtubeRef && this.$refs.youtubeRef.player) {
                this.$refs.youtubeRef.player.seekTo(seconds);
            }
        },

        getVideoPlayer() {
            if (
                this.video &&
                (this.video.videoType === 'Youtube' ||
                    (this.video.videoType &&
                        String(this.video.videoType).toLowerCase() === 'youtube'))
            ) {
                if (this.$refs.youtubeRef && this.$refs.youtubeRef.player) {
                    return this.$refs.youtubeRef.player;
                }
            }
            return this.player || null;
        },

        getCurrentTimestamp() {
            var p = this.getVideoPlayer();
            if (p && typeof p.getCurrentTime === 'function') {
                return Math.floor(p.getCurrentTime());
            }
            return null;
        },

        setNav(item) {
            this.currentNav = item;
        },

        toggleCategory(id) {
            this.$set(this.collapsedCategories, id, !this.collapsedCategories[id]);
        },

        p1Timestamps(label) {
            return this.player1Timestamps.filter((t) => t.label === label);
        },

        p2Timestamps(label) {
            return this.player2Timestamps.filter((t) => t.label === label);
        },

        seekToTimeStamp(seconds) {
            var p = this.getVideoPlayer();
            if (p && typeof p.seekTo === 'function') {
                p.seekTo(seconds);
            }
            var videoContainer = this.$el && this.$el.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },

        playVideo() {
            if (this.video.videoType === 'uploaded') {
                if (this.isPlaying) this.$refs.videoRef.play();
            } else if (this.video.videoType === 'youtube') {
                if (this.isPlaying) this.player.playVideo();
            }
        },

        ready(event) {
            this.player = event.target;
            if (this.isPlaying || this.isFirst) {
                this.player.playVideo();
                if (this.isPlaying && this.video.startTime) {
                    this.setTimer();
                }
            }
            this.$nextTick(() => {
                this.$emit('player-ready', this.getVideoPlayer());
            });
        },

        /* ── navigation ────────────────────────────────────── */

        queryPlayer(playerId) {
            this.$router.push(`/player/${playerId}`);
        },

        queryCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        },

        queryGame(gameId) {
            this.$router.push(`/game/${gameId}`);
        },

        goToMatchPage() {
            if (!this.video || !this.canOpenMatchPage) return;
            var id = this.video.matchId;
            if (id && typeof id === 'object') {
                id = id.$oid || id.toString();
            }
            this.$router.push({
                name: 'TournamentMatch',
                params: { id: String(id) },
            });
        },

        /* ── timer ─────────────────────────────────────────── */

        setTimer() {
            this.$nextTick(function () {
                window.setInterval(() => {
                    this.getTimeStamp();
                }, 1000);
            });
        },

        getTimeStamp() {
            this.videoCurrentTime = this.$refs.youtubeRef.player.getCurrentTime();
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            if (objectId) {
                if (going === this.$waypointMap.GOING_IN && direction) {
                    this.isPlaying = true;
                }
                if (going === this.$waypointMap.GOING_OUT && direction) {
                    this.isPlaying = false;
                }
            }
        },
    },
};
</script>

<style>
.tournament-match-video-card .match-card {
    margin: 60px 0;
    display: flex;
    /* background-image: linear-gradient(#515b89, #171b33); */
    background: #242832;
    border: 5px solid #242832;
    border-radius: 15px;
    margin-bottom: 30px;
    position: relative;
    cursor: pointer;
    width: 100%;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.tournament-match-video-card .match-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 25%;
    width: 100%;
}

.tournament-match-video-card .match-card .aside .info {
    flex: 1;
    min-height: 0;
}

.tournament-match-video-card .match-card .versus {
    font-size: 25px;
    color: #3eb489;
    text-transform: uppercase;
}

.tournament-match-video-card .match-card .card-label {
    position: absolute;
    width: 70px;
    border-radius: 30px;
    top: -15px;
    left: 50%;
    margin-left: -35px;
    background: #db8c10;
    text-align: center;
    padding: 5px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
}

.tournament-match-video-card .match-card .card-label {
    background: #3c73a8;
}

.tournament-match-video-card .match-card video {
    width: 100%;
}

.tournament-match-video-card .match-card .character-name span,
.tournament-match-video-card .match-card .game-title span {
    padding: 3px 20px;
    color: #242832;
    font-size: 20px;
    background: #3eb489;
    font-size: 14px;
    border-radius: 15px;
    display: inline-block;
    position: relative;
    padding-left: 40px;
    overflow: hidden;
}

.tournament-match-video-card .match-card .game-title span {
    padding: 3px 20px;
}

.tournament-match-video-card .match-card .team2 .character-name span {
    color: #fff;
    background: #4447e2;
}

.tournament-match-video-card .match-card .player-name {
    color: #fff;
    font-size: 20px;
    background: #131419;
    display: inline-block;
    padding: 2px 20px;
    border-radius: 15px;
    position: absolute;
    top: -15px;
    left: 10px;
}

.tournament-match-video-card .match-card .player-name p {
    font-weight: 400;
    font-size: 18px;
}

.tournament-match-video-card .match-card .character-name {
    padding-top: 0px;
    font-size: 13px;
}

.tournament-match-video-card .match-card .character-name p {
    font-size: 14px;
    color: #242832;
    font-weight: 300;
    margin-top: 3px;
}

.tournament-match-video-card .match-card .character {
    padding: 5px;
}

.tournament-match-video-card .match-card .game {
    margin-bottom: 20px;
    text-align: right;
}

.tournament-match-video-card .match-card .game .img-container img,
.tournament-match-video-card .match-card .character .img-container img {
    width: 30px;
}

.tournament-match-video-card .match-card .game .img-container,
.tournament-match-video-card .match-card .character .img-container {
    position: absolute;
    left: 0;
    top: 0;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    height: 30px;
    display: flex;
    align-items: center;
}

.tournament-match-video-card .match-card .video-ghost {
    height: 313px;
    width: 556px;
}

.tournament-match-video-card .match-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
}

.tournament-match-video-card .match-card.card .edit-btn-container {
    padding: 10px;
}

.tournament-match-video-card .match-card.card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #4447e2 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.tournament-match-video-card .match-card .video-container {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    position: relative;
    padding-bottom: 42.25%;
    height: 0;
    overflow: hidden;
    min-width: 75%;
}

.video-container iframe,
.video-container object,
.video-container embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.tournament-match-video-card .match-card .character-2 {
    top: 40px;
}

.tournament-match-video-card .match-card .character-3 {
    top: 120px;
}

.tournament-match-video-card .match-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

#app .tournament-match-video-card .match-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .tournament-match-video-card .match-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .tournament-match-video-card .match-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.tournament-match-video-card .match-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

.tournament-match-video-card .match-card .player {
    border: 1px dashed #3eb489;
    position: relative;
    padding-top: 10px;
    margin-bottom: 40px;
}

.tournament-match-video-card .match-card .team2 .player {
    border: 1px dashed #4447e2;
}

.tournament-match-video-card .match-card .characters {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
}

.tournament-match-video-card .match-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 0 0;
    margin-top: auto;
}

#app .tournament-match-video-card .match-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .tournament-match-video-card .match-card .admin-controls button.view-match-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .tournament-match-video-card .match-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .tournament-match-video-card .match-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.tournament-match-video-card .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    color: #fff;
}

.tournament-match-video-card .tournament-section .tournament-title {
    display: flex;
    align-items: center;
}

.tournament-match-video-card .notes {
    font-weight: 400;
    color: #4447e2;
}

.tournament-match-video-card .tournament-image {
    width: 75px;
    margin-right: 16px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card {
    flex-direction: column;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .players {
    display: flex;
    width: 100%;
    flex-direction: column;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .players .player {
    margin-bottom: 0;
    max-width: 100%;
    width: 100%;
    margin-bottom: 20px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .player-name {
    top: -9px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .characters {
    padding: 0 5px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .character-name span {
    padding: 3px 20px 3px 40px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .game {
    margin-bottom: 0px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .admin-controls button {
    height: 10px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .player-name p {
    font-size: 12px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .video-container {
    padding-bottom: 56.25%;
}

.tournament-match-video-card .match-card .aside--edit {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tournament-match-video-card .match-card .aside--edit .edit-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    color: #fff;
}

.tournament-match-video-card .match-card .aside--edit .field-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
    margin-bottom: 8px;
}

.tournament-match-video-card .match-card .aside--edit .field {
    flex: 1 1 160px;
    min-width: 140px;
}

.tournament-match-video-card .match-card .aside--edit .field-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.65;
    margin-bottom: 4px;
}

.tournament-match-video-card .match-card .aside--edit .time-pair,
.tournament-match-video-card .match-card .aside--edit .notes-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.tournament-match-video-card .match-card .aside--edit .needs-game {
    margin-bottom: 8px;
}

.tournament-match-video-card .match-card .admin-controls--edit {
    justify-content: flex-end;
    padding: 8px 10px;
    gap: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tournament-match-video-card .match-card .aside--edit >>> .add-match {
    color: rgba(255, 255, 255, 0.92);
}

.tournament-match-video-card .match-card .aside--edit >>> .add-match h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
}

@media (max-width: 600px) {
    .tournament-match-video-card .match-card .aside--edit .time-pair,
    .tournament-match-video-card .match-card .aside--edit .notes-pair {
        grid-template-columns: 1fr;
    }
}

.tournament-match-video-card .match-analysis-details {
    background: #1f1d2b;
    border-radius: 0 0 15px 15px;
    padding: 0 16px 16px;
    color: rgba(255, 255, 255, 0.87);
}

.tournament-match-video-card .match-analysis-details .nav {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    margin-bottom: 12px;
}

.tournament-match-video-card .match-analysis-details .navItem {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.85rem;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.tournament-match-video-card .match-analysis-details .navItem.active,
.tournament-match-video-card .match-analysis-details .navItem:hover {
    opacity: 1;
    border-bottom: 2px solid #515b89;
    margin-bottom: -1px;
}

.tournament-match-video-card .match-analysis-details .trigger {
    margin-bottom: 8px;
}

.tournament-match-video-card .match-analysis-details .trigger h4 {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 4px;
}

.tournament-match-video-card .match-analysis-details .category-icon {
    font-size: 0.65rem;
    opacity: 0.7;
}

.tournament-match-video-card .match-analysis-details .count-badge {
    background: #515b89;
    border-radius: 10px;
    padding: 1px 7px;
    font-size: 0.75rem;
    color: #fff;
}

.tournament-match-video-card .match-analysis-details .label {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 0 10px 20px;
}

.tournament-match-video-card .match-analysis-details .label a {
    cursor: pointer;
    background: #2e2c4a;
    border: 1px solid rgba(139, 156, 247, 0.35);
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: #c5cbff;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
}

.tournament-match-video-card .match-analysis-details .label a:hover {
    background: #3d3b6a;
    border-color: rgba(139, 156, 247, 0.7);
    color: #fff;
}

.tournament-match-video-card .match-analysis-details .analysis-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 14px;
    flex-wrap: wrap;
}

.tournament-match-video-card .match-analysis-details .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #2a2840;
    border-radius: 8px;
    padding: 8px 14px;
    min-width: 90px;
}

.tournament-match-video-card .match-analysis-details .summary-label {
    font-size: 0.7rem;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
}

.tournament-match-video-card .match-analysis-details .summary-value {
    font-size: 1rem;
    font-weight: 600;
}

.tournament-match-video-card .match-analysis-details table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.tournament-match-video-card .match-analysis-details table th,
.tournament-match-video-card .match-analysis-details table td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tournament-match-video-card .match-analysis-details table th {
    opacity: 0.5;
    font-size: 0.75rem;
    text-transform: uppercase;
}

.tournament-match-video-card .match-analysis-details table .value {
    font-weight: 600;
    color: #8b9cf7;
}

.tournament-match-video-card .match-analysis-details .general-info p {
    opacity: 0.5;
    font-size: 0.85rem;
    padding: 12px 0;
}

.tournament-match-video-card .match-analysis-details .no-data {
    opacity: 0.5;
    font-size: 0.85rem;
    padding: 8px 0;
}
</style>
