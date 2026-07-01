<!-- @format -->
<template>
    <div class="tnav" :class="{ loading: isLoading }">
        <!-- ── Hero ──────────────────────────────────────────────────────── -->
        <div class="tnav-hero">
            <div class="tnav-identity">
                <img v-if="tournament.logoUrl" :src="tournament.logoUrl" class="tnav-logo" alt="" />
                <div class="tnav-title-block">
                    <h1 class="tnav-name">{{ tournament.name }}</h1>
                    <div class="tnav-meta">
                        <span v-if="tournament.eventDate" class="tnav-meta-item">
                            <v-icon small class="tnav-meta-icon">mdi-calendar-range</v-icon>
                            {{ tournament.eventDate }}
                        </span>
                        <span v-if="tournament.location" class="tnav-meta-item">
                            <v-icon small class="tnav-meta-icon">mdi-map-marker</v-icon>
                            {{ tournament.location }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="tnav-actions">
                <router-link
                    v-if="isAdmin"
                    :to="{ name: 'EditTournament', params: { id: tournamentId } }"
                    class="tnav-edit-btn"
                    title="Edit tournament details"
                >
                    <v-icon small>mdi-pencil</v-icon>
                    <span>Edit</span>
                </router-link>
                <a
                    v-if="tournament.bracketUrl"
                    :href="tournament.bracketUrl"
                    target="_blank"
                    rel="noopener"
                    class="tnav-bracket-btn"
                >
                    <tournament-bracket-svg />
                    <span>Bracket</span>
                </a>
            </div>
        </div>

        <!-- ── Game chips ─────────────────────────────────────────────────── -->
        <div v-if="games.length > 1" class="tnav-filter-row">
            <span class="tnav-filter-label">Game</span>
            <div class="tnav-chips">
                <button
                    :class="['tnav-chip', 'tnav-chip--game', { active: activeGame === null }]"
                    @click="selectGame(null)"
                >
                    All
                </button>
                <button
                    v-for="game in games"
                    :key="game.id"
                    :class="['tnav-chip', 'tnav-chip--game', { active: activeGame === game.id }]"
                    @click="selectGame(game)"
                >
                    <img
                        v-if="game.logoUrl"
                        :src="game.logoUrl"
                        class="tnav-chip-logo"
                        :alt="game.title"
                    />
                    <span>{{ game.abbreviation || game.title }}</span>
                </button>
            </div>
        </div>

        <!-- ── Bracket stage chips ───────────────────────────────────────── -->
        <div
            v-if="tournament.bracketFilters && tournament.bracketFilters.length > 1"
            class="tnav-filter-row"
        >
            <span class="tnav-filter-label">Round</span>
            <div class="tnav-chips">
                <button
                    :class="['tnav-chip', 'tnav-chip--stage', { active: activeBracket === null }]"
                    @click="selectBracket(null)"
                >
                    All Rounds
                </button>
                <button
                    v-for="stage in tournament.bracketFilters"
                    :key="stage"
                    :class="['tnav-chip', 'tnav-chip--stage', { active: activeBracket === stage }]"
                    @click="selectBracket(stage)"
                >
                    {{ stage }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GamesService from '@/services/games-service';
import TournamentsService from '@/services/tournaments-service';
import TournamentBracketSvg from '../svg/tournament-bracket-svg.vue';
import moment from 'moment';

export default {
    name: 'TournamentNav',

    components: {
        'tournament-bracket-svg': TournamentBracketSvg,
    },

    props: {
        tournamentId: {
            type: String,
            default: '',
        },
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            tournament: {
                name: null,
                logoUrl: null,
                bracketUrl: null,
                games: [],
                eventDate: null,
                location: null,
                bracketFilters: [],
            },
            games: [], // full game objects for chip rendering
            activeGame: null,
            activeBracket: null,
            isLoading: false,
        };
    },

    computed: {
        isAdmin() {
            return this.account && String(this.account.role || '').toLowerCase() === 'admin';
        },
    },

    watch: {
        tournamentId() {
            this.activeGame = null;
            this.activeBracket = null;
            this.getTournament();
        },
    },

    created() {
        eventbus.$on('account:update', () => {});
        this.getTournament();
    },

    beforeDestroy() {
        eventbus.$off('account:update');
    },

    methods: {
        async getTournament() {
            this.isLoading = true;
            try {
                const response = await TournamentsService.getTournament({ id: this.tournamentId });
                const t = response.data;

                this.tournament = {
                    name: t.Name,
                    logoUrl: t.Image,
                    bracketUrl: t.BracketUrl,
                    games: t.Games || [],
                    eventDate: t.EventDate ? moment(t.EventDate).format('MMM Do, YYYY') : null,
                    location: t.Location || null,
                    bracketFilters: t.BracketFilters || [],
                };

                // Fetch full game objects so we can show logo + abbreviation on chips
                if (this.tournament.games.length > 1) {
                    const gamesResponse = await GamesService.fetchGames();
                    const allGames = gamesResponse.data.games.map((g) => ({
                        id: String(g._id),
                        title: g.Title,
                        abbreviation: g.Abbreviation || null,
                        logoUrl: g.LogoUrl || null,
                    }));
                    const tournamentGameIds = this.tournament.games.map((id) => String(id));
                    this.games = allGames.filter((g) => tournamentGameIds.includes(g.id));
                } else {
                    this.games = [];
                }
            } finally {
                this.isLoading = false;
            }
        },

        selectGame(game) {
            // Toggle: clicking the active game deselects it (shows all)
            if (game && this.activeGame === game.id) {
                this.activeGame = null;
                this.$emit('filter:game', null);
            } else {
                this.activeGame = game ? game.id : null;
                this.$emit(
                    'filter:game',
                    game ? { queryName: 'GameId', queryValue: game.id } : null
                );
            }
            // Changing the game always resets the bracket selection
            this.activeBracket = null;
            this.$emit('filter:bracket', null);
        },

        selectBracket(stage) {
            if (stage && this.activeBracket === stage) {
                this.activeBracket = null;
                this.$emit('filter:bracket', null);
            } else {
                this.activeBracket = stage || null;
                this.$emit(
                    'filter:bracket',
                    stage ? { queryName: 'Notes', queryValue: stage } : null
                );
            }
        },
    },
};
</script>

<style scoped>
/* ── Container ──────────────────────────────────────────────────────────────── */
.tnav {
    width: 100%;
    margin-bottom: 8px;
}

/* ── Hero row ───────────────────────────────────────────────────────────────── */
.tnav-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1a1d2e;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 10px;
    gap: 12px;
}

.tnav-identity {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
}

.tnav-logo {
    height: 56px;
    width: auto;
    flex-shrink: 0;
    border-radius: 6px;
    object-fit: contain;
}

.tnav-title-block {
    min-width: 0;
}

.tnav-name {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tnav-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.tnav-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.tnav-meta-icon {
    color: #3eb489 !important;
    font-size: 14px !important;
}

/* ── Hero actions ───────────────────────────────────────────────────────────── */
.tnav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.tnav-edit-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    width: 68px;
    height: 64px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.tnav-edit-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    text-decoration: none;
}

/* ── Bracket button ─────────────────────────────────────────────────────────── */
.tnav-bracket-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    width: 68px;
    height: 64px;
    background: rgba(62, 180, 137, 0.12);
    border: 1px solid rgba(62, 180, 137, 0.3);
    border-radius: 8px;
    color: #3eb489;
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: background 0.15s, border-color 0.15s;
}

.tnav-bracket-btn:hover {
    background: rgba(62, 180, 137, 0.22);
    border-color: rgba(62, 180, 137, 0.6);
    color: #3eb489;
    text-decoration: none;
}

.tnav-bracket-btn svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
}

/* ── Filter rows ────────────────────────────────────────────────────────────── */
.tnav-filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.tnav-filter-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 1px;
    text-transform: uppercase;
    flex-shrink: 0;
    width: 40px;
}

.tnav-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

/* ── Individual chip ────────────────────────────────────────────────────────── */
.tnav-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.6);
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    white-space: nowrap;
}

.tnav-chip:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.22);
    color: #fff;
}

.tnav-chip.active {
    background: rgba(62, 180, 137, 0.15);
    border-color: #3eb489;
    color: #3eb489;
}

.tnav-chip-logo {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

/* Stage chips are slightly taller to distinguish from game chips */
.tnav-chip--stage {
    padding: 5px 14px;
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
    .tnav-hero {
        padding: 12px 14px;
    }

    .tnav-name {
        font-size: 16px;
    }

    .tnav-logo {
        height: 40px;
    }

    .tnav-filter-label {
        display: none;
    }

    .tnav-chips {
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 2px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }

    .tnav-chips::-webkit-scrollbar {
        display: none;
    }
}
</style>
