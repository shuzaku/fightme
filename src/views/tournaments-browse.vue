<!-- @format -->
<template>
    <div class="tournaments-browse">
        <div class="browse-header">
            <h1>Tournaments</h1>
            <p>Browse fighting game tournaments — filter by game, tier, date, and location.</p>
        </div>

        <div class="filter-bar">
            <div class="filter-row">
                <div class="filter-field">
                    <game-search
                        v-model="filters.game"
                        multiple
                        placeholder="Search game…"
                        @update:game="onGameSelected"
                    />
                </div>
                <div id="tier-filter-anchor" class="filter-field filter-field--sm select-anchor">
                    <v-select
                        v-model="filters.tier"
                        :items="tierOptions"
                        label="Tier"
                        multiple
                        chips
                        small-chips
                        deletable-chips
                        clearable
                        dark
                        outlined
                        dense
                        hide-details
                        attach="#tier-filter-anchor"
                        :menu-props="selectMenuProps"
                    />
                </div>
                <div id="status-filter-anchor" class="filter-field filter-field--sm select-anchor">
                    <v-select
                        v-model="filters.statuses"
                        :items="statusOptions"
                        item-text="label"
                        item-value="value"
                        label="Status"
                        multiple
                        chips
                        small-chips
                        deletable-chips
                        clearable
                        dark
                        outlined
                        dense
                        hide-details
                        attach="#status-filter-anchor"
                        :menu-props="selectMenuProps"
                    />
                </div>
            </div>
            <div class="filter-row">
                <v-text-field
                    v-model="filters.search"
                    label="Search by name"
                    clearable
                    dark
                    outlined
                    dense
                    hide-details
                    class="filter-field"
                />
                <v-text-field
                    v-model="filters.location"
                    label="Location"
                    clearable
                    dark
                    outlined
                    dense
                    hide-details
                    class="filter-field"
                />
                <v-text-field
                    v-model="filters.dateFrom"
                    label="From"
                    type="date"
                    dark
                    outlined
                    dense
                    hide-details
                    class="filter-field filter-field--sm"
                />
                <v-text-field
                    v-model="filters.dateTo"
                    label="To"
                    type="date"
                    dark
                    outlined
                    dense
                    hide-details
                    class="filter-field filter-field--sm"
                />
            </div>
            <div v-if="hasActiveFilters" class="filter-actions">
                <button class="clear-btn" @click="clearFilters">Clear filters</button>
            </div>
        </div>

        <div class="results-meta" v-if="!isLoading">
            <span v-if="total > 0">{{ total | commaDelimited }} tournament{{ total === 1 ? '' : 's' }}</span>
            <span v-else>No tournaments found</span>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading && tournaments.length === 0" class="browse-grid">
            <div v-for="n in 8" :key="n" class="skeleton-card"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!isLoading && tournaments.length === 0" class="browse-empty">
            <i class="fas fa-trophy"></i>
            <h3>No tournaments found</h3>
            <p>Try adjusting or clearing your filters.</p>
            <button v-if="hasActiveFilters" class="empty-reset-btn" @click="clearFilters">
                Clear Filters
            </button>
        </div>

        <!-- Results grid -->
        <div v-else class="browse-grid">
            <tournament-browse-card
                v-for="t in tournaments"
                :key="t.id"
                :tournament="t"
            />
        </div>

        <div v-if="!isLoading && tournaments.length < total" class="load-more-wrap">
            <button class="load-more-btn" :disabled="isLoadingMore" @click="loadMore">
                <span v-if="isLoadingMore"><i class="fas fa-circle-notch fa-spin"></i> Loading…</span>
                <span v-else>Load more</span>
            </button>
        </div>
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';
import GameSearch from '@/components/games/game-search';
import TournamentBrowseCard from '@/components/tournament/tournament-browse-card.vue';
import { setPageTitle } from '@/services/og-meta-service';
import { setLastBrowseQuery } from '@/utils/tournaments-browse-state';

const PAGE_SIZE = 24;
let debounceTimer = null;

// `IsFinished` is never set by the auto-ingestion pipeline (MicroServices/
// tournament-ingestion-service) and defaults to false, so thousands of
// already-completed tournaments were showing as "Upcoming". EventDate is
// reliable for every tournament regardless of source, so derive
// finished-state from that instead — "before today" per date, in UTC to
// match how EventDate gets stored (bare `sdate=YYYY-MM-DD` values parse as
// UTC midnight both here and in the ingestion pipeline).
function todayDateString() {
    return new Date().toISOString().slice(0, 10);
}

function addDaysToDateString(dateStr, days) {
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

function isPastEventDate(eventDate) {
    if (!eventDate) return false;
    return new Date(eventDate).toISOString().slice(0, 10) < todayDateString();
}

const EMPTY_FILTERS = {
    game: [],
    tier: [],
    statuses: [],
    search: '',
    location: '',
    dateFrom: '',
    dateTo: '',
};

// Filters live in the URL query so they survive navigating into a tournament
// and back, and so a filtered view can be linked or refreshed.
function parseFiltersFromQuery(query) {
    const q = query || {};
    const list = (v) => (v ? String(v).split(',').filter(Boolean) : []);
    const str = (v) => (v == null ? '' : String(v));
    return {
        game: list(q.game),
        tier: list(q.tier).map(Number).filter((n) => !isNaN(n)),
        statuses: list(q.status),
        search: str(q.search),
        location: str(q.location),
        dateFrom: str(q.dateFrom),
        dateTo: str(q.dateTo),
    };
}

function buildQueryFromFilters(f) {
    const q = {};
    if (f.game.length) q.game = f.game.join(',');
    if (f.tier.length) q.tier = f.tier.join(',');
    if (f.statuses.length) q.status = f.statuses.join(',');
    if (f.search) q.search = f.search;
    if (f.location) q.location = f.location;
    if (f.dateFrom) q.dateFrom = f.dateFrom;
    if (f.dateTo) q.dateTo = f.dateTo;
    return q;
}

// Order-independent comparison — $route.query key order follows the URL,
// which won't necessarily match the order buildQueryFromFilters emits.
function sameQuery(a, b) {
    const ka = Object.keys(a || {}).sort();
    const kb = Object.keys(b || {}).sort();
    if (ka.length !== kb.length) return false;
    return ka.every((k, i) => kb[i] === k && String(a[k]) === String(b[k]));
}

export default {
    name: 'TournamentsBrowse',

    components: {
        'game-search': GameSearch,
        'tournament-browse-card': TournamentBrowseCard,
    },

    filters: {
        commaDelimited(value) {
            if (value == null) return '';
            return Number(value).toLocaleString();
        },
    },

    data() {
        return {
            // Seeded from the URL so returning to a filtered view (browser
            // back, a shared link, or a refresh) restores what was set.
            filters: parseFiltersFromQuery(this.$route.query),
            tierOptions: [1, 2, 3, 4, 5],
            selectMenuProps: {
                offsetY: true,
                contentClass: 'tournaments-browse-select-menu',
            },
            // Deliberately just Upcoming/Completed, not an "All" option —
            // none selected already means "no filter" (i.e. all), and with
            // both selected the two would cancel out to the same thing.
            statusOptions: [
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'completed', label: 'Completed' },
            ],
            tournaments: [],
            total: 0,
            page: 1,
            isLoading: true,
            isLoadingMore: false,
        };
    },

    computed: {
        hasActiveFilters() {
            const f = this.filters;
            return Boolean(
                f.game.length || f.tier.length || f.statuses.length ||
                f.search || f.location || f.dateFrom || f.dateTo
            );
        },
    },

    watch: {
        filters: {
            deep: true,
            handler() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.syncFiltersToUrl();
                    this.page = 1;
                    this.tournaments = [];
                    this.isLoading = true;
                    this.fetchTournaments();
                }, 300);
            },
        },

        // Browser back/forward between two filtered views swaps the query
        // without remounting this component, so pull the filters back in.
        '$route.query': function (query) {
            const next = parseFiltersFromQuery(query);
            if (sameQuery(buildQueryFromFilters(this.filters), buildQueryFromFilters(next))) {
                return;
            }
            this.filters = next;
        },
    },

    mounted() {
        setPageTitle(
            'Tournaments',
            'Browse fighting game tournaments — filter by game, tier, date, and location.'
        );
        setLastBrowseQuery(buildQueryFromFilters(this.filters));
        this.fetchTournaments();
    },

    beforeDestroy() {
        clearTimeout(debounceTimer);
    },

    methods: {
        onGameSelected(games) {
            this.filters.game = (games || []).map((g) => g.id);
        },

        // `replace` rather than `push` — typing in the search box shouldn't
        // bury the previous page under a stack of history entries, and the
        // updated URL is still what browser-back returns to.
        syncFiltersToUrl() {
            const query = buildQueryFromFilters(this.filters);
            setLastBrowseQuery(query);
            if (sameQuery(query, this.$route.query)) return;
            this.$router.replace({ path: '/tournaments', query }).catch(() => {});
        },

        buildFilterParams() {
            const f = this.filters;
            const params = {
                page: this.page,
                limit: PAGE_SIZE,
                sort: 'EventDate desc',
            };
            if (f.game.length) params.game = f.game.join(',');
            if (f.tier.length) params.tier = f.tier.join(',');
            if (f.search) params.search = f.search;
            if (f.location) params.location = f.location;

            // Status (Upcoming/Completed) is EventDate-derived, not the
            // unreliable IsFinished field — map it onto the same dateFrom/
            // dateTo range params the From/To fields use, taking the more
            // restrictive bound if the user set both. With neither or both
            // statuses selected there's nothing to narrow, so leave dates as-is.
            let dateFrom = f.dateFrom || null;
            let dateTo = f.dateTo || null;
            const wantsUpcoming = f.statuses.includes('upcoming');
            const wantsCompleted = f.statuses.includes('completed');
            if (wantsUpcoming && !wantsCompleted) {
                const today = todayDateString();
                dateFrom = dateFrom && dateFrom > today ? dateFrom : today;
            } else if (wantsCompleted && !wantsUpcoming) {
                const yesterday = addDaysToDateString(todayDateString(), -1);
                dateTo = dateTo && dateTo < yesterday ? dateTo : yesterday;
            }

            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;

            return params;
        },

        async fetchTournaments() {
            try {
                const res = await TournamentsService.searchTournaments(this.buildFilterParams());
                const data = res.data || {};
                const hydrated = (data.tournaments || []).map(this.hydrateTournament);
                this.tournaments = this.page === 1 ? hydrated : this.tournaments.concat(hydrated);
                this.total = data.total || 0;
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
            this.isLoadingMore = false;
        },

        async loadMore() {
            if (this.isLoadingMore) return;
            this.isLoadingMore = true;
            this.page += 1;
            await this.fetchTournaments();
        },

        hydrateTournament(t) {
            // Manually-entered / backfilled tournaments carry the curated Games
            // array; most auto-ingested ones (see MicroServices/tournament-ingestion-service)
            // only reliably have the single GameId until that array's been
            // backfilled — fall back to it so those still show a game/logo.
            const gamesList = (t.Games || []).filter((g) => g && typeof g === 'object');
            const gameId = t.GameId && typeof t.GameId === 'object' ? t.GameId : null;
            if (gamesList.length === 0 && gameId) {
                gamesList.push(gameId);
            }
            const gameNames = gamesList.map((g) => g.Title).filter(Boolean).join(', ');
            const gameLogo = gamesList.length ? gamesList[0].LogoUrl : null;
            return {
                id: t._id,
                name: t.Name,
                image: t.Image || t.LogoUrl || gameLogo,
                location: t.Location,
                tier: t.Tier,
                isFinished: isPastEventDate(t.EventDate),
                entrantCount: t.EntrantCount,
                gameNames,
                eventDateLabel: t.EventDate
                    ? new Date(t.EventDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : null,
            };
        },

        clearFilters() {
            this.filters = { ...EMPTY_FILTERS, game: [], tier: [], statuses: [] };
        },
    },
};
</script>

<style scoped>
.tournaments-browse {
    padding-top: calc(var(--app-top-bar-height, 84px) + var(--app-follows-bar-height, 72px) + 32px);
    max-width: 1200px;
    margin: 0 auto;
    padding-left: clamp(16px, 3vw, 48px);
    padding-right: clamp(16px, 3vw, 48px);
    padding-bottom: 80px;
    box-sizing: border-box;
    width: 100%;
}

.browse-header {
    margin-bottom: 24px;
}

.browse-header h1 {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: clamp(26px, 4vw, 38px);
    color: #fff;
    margin: 0 0 4px;
}

.browse-header p {
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0;
}

.filter-bar {
    background: #1c1c24;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: visible;
}

.filter-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.filter-field {
    flex: 1 1 200px;
    min-width: 160px;
}

/* Tier/Status v-select menus attach directly to their own field
   (#tier-filter-anchor / #status-filter-anchor) rather than "body" or a
   shared container — this app has no <v-app> root for Vuetify's overlay
   system to size against, so an explicit attach point is required, and
   attaching to a wrapper that spans more than just the field itself made
   the menu stretch to that wrapper's full width/position instead of sitting
   under the actual input. */
.select-anchor {
    position: relative;
}

.filter-field--sm {
    flex: 1 1 130px;
    min-width: 120px;
}

.filter-actions {
    display: flex;
    justify-content: flex-end;
}

.clear-btn {
    background: none;
    border: none;
    color: #3eb489;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 0;
}

.clear-btn:hover {
    text-decoration: underline;
}

.results-meta {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    margin-bottom: 14px;
}

.browse-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 18px;
}

.skeleton-card {
    aspect-ratio: 3 / 4;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: tb-shimmer 1.5s infinite;
}

@keyframes tb-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.browse-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 80px 20px;
    text-align: center;
}

.browse-empty i {
    font-size: 44px;
    color: rgba(62, 180, 137, 0.3);
}

.browse-empty h3 {
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
}

.browse-empty p {
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.35);
    margin: 0;
}

.empty-reset-btn {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 24px;
    background: rgba(62, 180, 137, 0.1);
    border: 1px solid rgba(62, 180, 137, 0.3);
    color: #3eb489;
    font-family: 'Roboto', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    margin-top: 6px;
}

.empty-reset-btn:hover {
    background: rgba(62, 180, 137, 0.18);
}

.load-more-wrap {
    display: flex;
    justify-content: center;
    margin-top: 32px;
}

.load-more-btn {
    padding: 10px 28px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-family: 'Roboto', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
    border-color: #3eb489;
    color: #3eb489;
}

.load-more-btn:disabled {
    opacity: 0.6;
    cursor: default;
}

.tournaments-browse .filter-field .game-search >>> .multiselect__tags {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 4px;
    min-height: 40px;
}

.tournaments-browse .filter-field .game-search >>> .multiselect__input,
.tournaments-browse .filter-field .game-search >>> .multiselect__single,
.tournaments-browse .filter-field .game-search >>> .multiselect__placeholder {
    background: transparent;
    color: #fff;
}

.tournaments-browse .filter-field .game-search >>> .multiselect__content-wrapper {
    background: #1c1f2a;
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.tournaments-browse .filter-field .game-search >>> .multiselect__option {
    background: #1c1f2a;
    color: #e7e9f0;
}

.tournaments-browse .filter-field .game-search >>> .multiselect__option--highlight {
    background: #3eb489;
    color: #fff;
}
</style>

<style>
.tournaments-browse-select-menu {
    z-index: 10001 !important;
}

/* Now that the Tier/Status menus render inline instead of attached to
   <body>, they pick up the app's real (dark) theme context instead of
   Vuetify's default light one — which was accidentally why the items were
   readable before (dark text on the light default). Force explicit colors
   here rather than relying on theme inheritance, since v-menu content isn't
   reachable by this file's `scoped` styles either way. */
.tournaments-browse-select-menu .v-select-list,
.tournaments-browse-select-menu .v-list {
    background: #1c1c24 !important;
}

.tournaments-browse-select-menu .v-list-item,
.tournaments-browse-select-menu .v-list-item__title {
    color: rgba(255, 255, 255, 0.87) !important;
}

.tournaments-browse-select-menu .v-list-item:hover,
.tournaments-browse-select-menu .v-list-item--highlighted {
    background: rgba(62, 180, 137, 0.15) !important;
}

.tournaments-browse-select-menu .v-list-item--active,
.tournaments-browse-select-menu .v-list-item--active .v-icon {
    color: #3eb489 !important;
}

.tournaments-browse-select-menu .v-icon {
    color: rgba(255, 255, 255, 0.6) !important;
}
</style>
