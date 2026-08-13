<!-- @format -->
<template>
    <div class="tournament-history">
        <div v-if="years.length > 0 || games.length > 0" class="history-filters">
            <div v-if="years.length > 0" class="history-filter-wrap">
                <label for="history-year-select" class="history-filter-label">Year</label>
                <select
                    id="history-year-select"
                    class="history-filter-select"
                    :value="selectedYear || ''"
                    @change="onFilterChange($event.target.value, null)"
                >
                    <option value="">All years</option>
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
            </div>
            <div v-if="games.length > 0" class="history-filter-wrap">
                <label for="history-game-select" class="history-filter-label">Game</label>
                <select
                    id="history-game-select"
                    class="history-filter-select"
                    :value="selectedGameId || ''"
                    @change="onFilterChange(null, $event.target.value)"
                >
                    <option value="">All games</option>
                    <option v-for="game in games" :key="game.id" :value="game.id">{{ game.title }}</option>
                </select>
            </div>
        </div>

        <div v-if="hydratedEntries.length === 0 && !isLoading" class="history-empty">
            <i class="fas fa-trophy"></i>
            <p v-if="selectedYear || selectedGameId">No tournament history for this filter.</p>
            <p v-else>No tournament history recorded yet.</p>
        </div>

        <div v-else class="history-list">
            <div v-for="entry in hydratedEntries" :key="entry.id" class="history-card">
                <div
                    class="history-card-header"
                    :class="{ 'history-card-header--clickable': entry.rounds.length > 0 }"
                    @click="entry.rounds.length > 0 && toggleExpanded(entry.id)"
                >
                    <img v-if="entry.image" :src="entry.image" class="history-logo" :alt="entry.name" />
                    <div v-else class="history-logo history-logo--placeholder">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="history-card-info">
                        <router-link
                            :to="'/tournaments/' + entry.id"
                            class="history-tournament-name"
                            @click.native="$event.stopPropagation()"
                        >
                            {{ entry.name }}
                        </router-link>
                        <div class="history-card-meta">
                            <span v-if="entry.eventDateLabel" class="meta-item">
                                <i class="fas fa-calendar"></i>{{ entry.eventDateLabel }}
                            </span>
                            <span v-if="entry.tier" class="meta-item">
                                <i class="fas fa-medal"></i>Tier {{ entry.tier }}
                            </span>
                            <span v-if="entry.gameNames" class="meta-item">{{ entry.gameNames }}</span>
                            <span v-if="entry.setCount" class="meta-item">
                                {{ entry.setCount }} set{{ entry.setCount === 1 ? '' : 's' }}
                            </span>
                        </div>
                    </div>
                    <div v-if="entry.placementLabel" class="history-placement">{{ entry.placementLabel }}</div>
                    <i
                        v-if="entry.rounds.length > 0"
                        class="fas fa-chevron-down history-toggle-icon"
                        :class="{ 'history-toggle-icon--open': isExpanded(entry.id) }"
                    ></i>
                </div>

                <div v-if="entry.rounds.length && isExpanded(entry.id)" class="rounds-list">
                    <div
                        v-for="round in entry.rounds"
                        :key="round.phaseName + round.roundText"
                        class="round-group"
                    >
                        <div class="round-heading">
                            <span class="round-phase">{{ round.phaseName }}</span>
                            <span class="round-name">{{ round.roundText }}</span>
                        </div>
                        <div class="sets-list">
                            <div v-for="set in round.sets" :key="set.id" class="set-row">
                                <div class="set-entrant" :class="{ winner: set.result === 'win' }">{{ entry.playerName }}</div>
                                <div class="set-score" :class="'set-score--' + set.result">
                                    {{ set.entrantScore != null ? set.entrantScore : '-' }}
                                    &ndash;
                                    {{ set.opponentScore != null ? set.opponentScore : '-' }}
                                </div>
                                <router-link
                                    v-if="set.opponentLink"
                                    :to="set.opponentLink"
                                    :class="[
                                        'set-entrant',
                                        'set-entrant--right',
                                        'set-entrant--link',
                                        { winner: set.result === 'loss' },
                                    ]"
                                >
                                    {{ set.opponentName }}
                                </router-link>
                                <div
                                    v-else
                                    :class="['set-entrant', 'set-entrant--right', { winner: set.result === 'loss' }]"
                                >
                                    {{ set.opponentName }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="!entry.rounds.length" class="history-no-sets">No match data recorded for this event yet.</div>
            </div>
        </div>

        <loading v-if="isLoading"></loading>

        <div v-if="!isLoading && isLast && hydratedEntries.length > 0" class="history-end">
            You're all caught up
        </div>
    </div>
</template>

<script>
import Loading from '@/components/common/loading';
import { playerPagePath } from '@/utils/game-character-routes';

export default {
    name: 'PlayerTournamentHistory',

    components: {
        loading: Loading,
    },

    props: {
        entries: {
            type: Array,
            default: () => [],
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isLast: {
            type: Boolean,
            default: false,
        },
        years: {
            type: Array,
            default: () => [],
        },
        games: {
            type: Array,
            default: () => [],
        },
        selectedYear: {
            type: [Number, String],
            default: null,
        },
        selectedGameId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            // Tournament cards whose match list is expanded, keyed by
            // tournament id — cards start collapsed so the list reads as a
            // compact attendance history until you open one up.
            expandedIds: {},
        };
    },

    computed: {
        hydratedEntries() {
            return this.entries.map((entry) => this.hydrateEntry(entry));
        },
    },

    methods: {
        // Only one of year/game changes per call (the other stays as
        // whichever is currently selected) — parent owns the actual filter
        // state and re-fetches accordingly.
        onFilterChange(year, gameId) {
            this.$emit('change-filter', {
                year: year !== null ? (year || null) : this.selectedYear || null,
                gameId: gameId !== null ? (gameId || null) : this.selectedGameId || null,
            });
        },

        isExpanded(id) {
            return !!this.expandedIds[id];
        },

        toggleExpanded(id) {
            this.$set(this.expandedIds, id, !this.expandedIds[id]);
        },

        placementLabel(placement) {
            if (!placement) return null;
            if (placement === 1) return '1st';
            if (placement === 2) return '2nd';
            if (placement === 3) return '3rd';
            return `${placement}th`;
        },

        opponentLink(opponent) {
            if (!opponent || !opponent.playerId) return null;
            return playerPagePath({ id: opponent.playerId, name: opponent.name, slug: opponent.slug }) || null;
        },

        hydrateEntry(entry) {
            const t = entry.tournament || {};
            const gamesList = (t.Games || []).filter((g) => g && typeof g === 'object');
            const gameId = t.GameId && typeof t.GameId === 'object' ? t.GameId : null;
            if (gamesList.length === 0 && gameId) {
                gamesList.push(gameId);
            }
            const gameNames = gamesList.map((g) => g.Title).filter(Boolean).join(', ');
            const gameLogo = gamesList.length ? gamesList[0].LogoUrl : null;
            const setCount = (entry.rounds || []).reduce((sum, round) => sum + (round.sets || []).length, 0);

            return {
                id: t._id,
                name: t.Name,
                image: t.Image || t.LogoUrl || gameLogo,
                tier: t.Tier,
                gameNames,
                eventDateLabel: t.EventDate
                    ? new Date(t.EventDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : null,
                placementLabel: this.placementLabel(entry.entrant && entry.entrant.finalPlacement),
                // The RawName recorded for this player in this specific bracket
                // (their start.gg tag at the time) — not the site profile Name,
                // so it matches what the opponent's name is shown as too.
                playerName: (entry.entrant && entry.entrant.rawName) || 'You',
                setCount,
                rounds: (entry.rounds || []).map((round) => ({
                    phaseName: round.phaseName,
                    roundText: round.roundText,
                    sets: (round.sets || []).map((set) => ({
                        id: set._id,
                        result: set.result,
                        entrantScore: set.entrantScore,
                        opponentScore: set.opponentScore,
                        opponentName: (set.opponent && set.opponent.rawName) || 'TBD',
                        opponentLink: this.opponentLink(set.opponent),
                    })),
                })),
            };
        },
    },
};
</script>

<style scoped>
.tournament-history {
    width: 100%;
}

.history-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 18px;
}

.history-filter-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.history-filter-label {
    color: #ffffff70;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
}

.history-filter-select {
    background: #14161f;
    border: 1px solid #ffffff1a;
    color: #fff;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 14px;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    max-width: 220px;
}

.history-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
}

.history-empty i {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.15);
}

.history-empty p {
    color: rgba(255, 255, 255, 0.4);
    font-size: 15px;
    margin: 0;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.history-card {
    background: #1a1d26;
    border: 1px solid #ffffff10;
    border-radius: 14px;
    padding: 18px;
}

.history-card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
}

.history-card-header--clickable {
    cursor: pointer;
    margin: -6px;
    padding: 6px;
    border-radius: 10px;
    transition: background 0.15s ease;
}

.history-card-header--clickable:hover {
    background: rgba(255, 255, 255, 0.03);
}

.history-toggle-icon {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.35);
    font-size: 13px;
    transition: transform 0.15s ease;
}

.history-toggle-icon--open {
    transform: rotate(180deg);
}

.history-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: 10px;
    background: #14161f;
    flex-shrink: 0;
}

.history-logo--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff30;
    font-size: 18px;
}

.history-card-info {
    flex: 1;
    min-width: 0;
}

.history-tournament-name {
    display: block;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.history-tournament-name:hover {
    color: #3eb489;
}

.history-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
}

.history-card-meta .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.history-placement {
    flex-shrink: 0;
    color: #ffd77a;
    font-weight: 800;
    font-size: 14px;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
}

.history-no-sets {
    color: rgba(255, 255, 255, 0.35);
    font-size: 13px;
}

.rounds-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.round-heading {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
}

.round-phase {
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.round-name {
    color: #fff;
    font-weight: 700;
    font-size: 13px;
}

.sets-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.set-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
}

.set-entrant {
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.set-entrant--right {
    text-align: right;
}

.set-entrant.winner {
    color: #fff;
    font-weight: 700;
}

.set-entrant--link {
    text-decoration: none;
    cursor: pointer;
}

.set-entrant--link:hover {
    color: #3eb489;
}

.set-score {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    white-space: nowrap;
    text-align: center;
}

.set-score--pending {
    color: rgba(255, 255, 255, 0.25);
    font-style: italic;
}

.history-end {
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
    font-size: 13px;
    padding: 20px 0;
}
</style>
