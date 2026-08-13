<!-- @format -->
<template>
    <div class="calendar-view">
        <div class="page-header">
            <div class="header-row">
                <h1>FGC Calendar</h1>
                <button v-if="isAdmin" class="add-tournament-btn" @click="addTournament()">
                    + Add tournament
                </button>
            </div>
            <p>Upcoming patches, character releases, and tournaments across every tracked game.</p>
        </div>

        <div class="filters">
            <button
                v-for="option in filterOptions"
                :key="option.value"
                :class="['filter-chip', option.value, { active: activeFilter === option.value }]"
                @click="activeFilter = option.value"
            >
                {{ option.label }}
            </button>
        </div>

        <div class="calendar-layout">
            <div class="month-panel">
                <div class="month-nav">
                    <button class="nav-btn" @click="prevMonth">‹</button>
                    <h2>{{ monthLabel }}</h2>
                    <button class="nav-btn" @click="nextMonth">›</button>
                </div>

                <div class="weekday-row">
                    <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
                </div>

                <div class="day-grid">
                    <div
                        v-for="(day, index) in calendarDays"
                        :key="index"
                        :class="[
                            'day-cell',
                            {
                                'other-month': !day.inMonth,
                                'is-today': day.isToday,
                                'is-selected': isSelectedDay(day),
                                'has-events': day.events.length > 0,
                            },
                        ]"
                        @click="selectDay(day)"
                    >
                        <span class="day-number">{{ day.date.date() }}</span>
                        <div v-if="day.events.length" class="day-dots">
                            <span
                                v-for="category in day.categories"
                                :key="category"
                                :class="['dot', category]"
                            ></span>
                        </div>
                    </div>
                </div>

                <div class="legend">
                    <span class="legend-item"><span class="dot patch"></span>Patch</span>
                    <span class="legend-item"><span class="dot character"></span>Character</span>
                    <span class="legend-item"><span class="dot tournament"></span>Tournament</span>
                    <span class="legend-item"><span class="dot other"></span>Other</span>
                </div>
            </div>

            <div class="upcoming-panel">
                <div class="upcoming-header">
                    <h2>{{ selectedDay ? selectedDay.date.format('MMMM D, YYYY') : 'Upcoming' }}</h2>
                    <button v-if="selectedDay" class="clear-selection" @click="selectedDay = null">
                        Show all upcoming
                    </button>
                </div>

                <loading v-if="loading"></loading>
                <div v-else-if="filteredEvents.length === 0" class="empty-state">
                    Nothing on the calendar yet.
                </div>
                <div v-else class="event-list">
                    <div
                        v-for="event in filteredEvents"
                        :key="event.id"
                        class="calendar-event"
                        @click="openEvent(event)"
                    >
                        <img v-if="event.image" :src="event.image" class="event-image" />
                        <div class="event-body">
                            <div class="event-top-row">
                                <span :class="['event-badge', event.category]">{{ event.badgeLabel }}</span>
                                <span class="event-date">{{ event.date.format('ddd, MMM D, YYYY') }}</span>
                            </div>
                            <div class="event-title">{{ event.title }}</div>
                            <div v-if="event.subtitle" class="event-subtitle">{{ event.subtitle }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import UpdatesService from '@/services/updates-service';
import TournamentsService from '@/services/tournaments-service';
import CharactersService from '@/services/characters-service';
import GamesService from '@/services/games-service';
import Loading from '@/components/common/loading';

const PATCH_TYPES = ['Game Update', 'Balance Patch', 'Season Update', 'Beta / Demo'];
const CHARACTER_TYPES = ['Character DLC'];

export default {
    name: 'Calendar',

    components: {
        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            loading: true,
            updates: [],
            tournaments: [],
            characters: [],
            gameNamesById: {},
            activeFilter: 'all',
            currentMonth: moment().startOf('month'),
            selectedDay: null,
            weekdayLabels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            filterOptions: [
                { value: 'all', label: 'All' },
                { value: 'patch', label: 'Patches' },
                { value: 'character', label: 'Characters' },
                { value: 'tournament', label: 'Tournaments' },
            ],
        };
    },

    computed: {
        isAdmin() {
            return Boolean(this.account) && this.account.role === 'admin';
        },

        monthLabel() {
            return this.currentMonth.format('MMMM YYYY');
        },

        allEvents() {
            const updateEvents = this.updates
                .filter((update) => update.Date)
                .map((update) => this.normalizeUpdate(update));

            const tournamentEvents = this.tournaments
                .filter((tournament) => tournament.EventDate)
                .map((tournament) => this.normalizeTournament(tournament));

            const characterEvents = this.characters
                .filter((character) => character.releaseDate)
                .map((character) => this.normalizeCharacter(character));

            return updateEvents
                .concat(tournamentEvents)
                .concat(characterEvents)
                .filter((event) => event.date.isValid())
                .sort((a, b) => a.date.valueOf() - b.date.valueOf());
        },

        categoryFilteredEvents() {
            if (this.activeFilter === 'all') {
                return this.allEvents;
            }
            return this.allEvents.filter((event) => event.category === this.activeFilter);
        },

        filteredEvents() {
            if (this.selectedDay) {
                return this.categoryFilteredEvents.filter((event) =>
                    event.date.isSame(this.selectedDay.date, 'day')
                );
            }
            const startOfToday = moment().startOf('day');
            return this.categoryFilteredEvents.filter((event) =>
                event.date.isSameOrAfter(startOfToday, 'day')
            );
        },

        calendarDays() {
            const startOfGrid = this.currentMonth.clone().startOf('week');
            const endOfGrid = this.currentMonth.clone().endOf('month').endOf('week');
            const today = moment();
            const events = this.categoryFilteredEvents;

            const days = [];
            const cursor = startOfGrid.clone();
            while (cursor.isSameOrBefore(endOfGrid, 'day')) {
                const dayEvents = events.filter((event) => event.date.isSame(cursor, 'day'));
                days.push({
                    date: cursor.clone(),
                    inMonth: cursor.isSame(this.currentMonth, 'month'),
                    isToday: cursor.isSame(today, 'day'),
                    events: dayEvents,
                    categories: [...new Set(dayEvents.map((event) => event.category))],
                });
                cursor.add(1, 'day');
            }
            return days;
        },
    },

    created() {
        this.getData();
    },

    methods: {
        async getData() {
            this.loading = true;
            try {
                const [updatesRes, tournamentsRes, charactersRes, gamesRes] = await Promise.all([
                    UpdatesService.fetchUpdates(),
                    // Fetch every tournament and let EventDate place it on the
                    // calendar — the IsFinished flag isn't reliably set.
                    TournamentsService.fetchTournaments(),
                    CharactersService.fetchRecentCharacters({
                        limit: 60,
                        sort: 'releaseDate',
                        sortDirection: 'desc',
                    }),
                    GamesService.fetchGames(),
                ]);

                this.gameNamesById = (gamesRes.data.games || []).reduce((map, game) => {
                    map[game._id] = game.Title;
                    return map;
                }, {});

                this.updates = updatesRes.data.updates || [];
                this.tournaments = tournamentsRes.data.tournaments || [];
                this.characters = charactersRes.data.characters || [];
            } catch (e) {
                console.error(e);
            }
            this.loading = false;
        },

        categoryForUpdateType(type) {
            if (PATCH_TYPES.includes(type)) return 'patch';
            if (CHARACTER_TYPES.includes(type)) return 'character';
            if (type === 'Tournament Announcement') return 'tournament';
            return 'other';
        },

        badgeLabelForCategory(category) {
            return { patch: 'Patch', character: 'Character', tournament: 'Tournament', other: 'Update' }[
                category
            ];
        },

        // Games arrive either as raw ids (Updates, Tournaments) or as populated
        // documents (Characters), so resolve both shapes.
        gameNames(games) {
            return (games || [])
                .map((game) => {
                    if (game && typeof game === 'object') {
                        return game.Title || game.Abbreviation || this.gameNamesById[game._id];
                    }
                    return this.gameNamesById[game];
                })
                .filter(Boolean)
                .join(', ');
        },

        normalizeUpdate(update) {
            const category = this.categoryForUpdateType(update.Type);
            return {
                id: `update-${update._id}`,
                category,
                badgeLabel: this.badgeLabelForCategory(category),
                title: update.Note || update.Type,
                subtitle: this.gameNames(update.Games),
                date: moment(update.Date),
                image: update.Image,
                link: update.Link,
                external: true,
            };
        },

        normalizeTournament(tournament) {
            return {
                id: `tournament-${tournament._id}`,
                category: 'tournament',
                badgeLabel: 'Tournament',
                title: tournament.Name,
                subtitle: [tournament.Location, this.gameNames(tournament.Games)]
                    .filter(Boolean)
                    .join(' — '),
                date: moment(tournament.EventDate),
                image: tournament.Image,
                link: `/tournament/${tournament._id}`,
                external: false,
            };
        },

        normalizeCharacter(character) {
            const gameLabel = this.gameNames(character.Game);
            return {
                id: `character-${character._id}`,
                category: 'character',
                badgeLabel: 'Character',
                title: `${character.Name} releases`,
                subtitle: gameLabel,
                date: moment(character.releaseDate),
                image: character.AvatarUrl || character.ImageUrl,
                link: character.Slug ? `/c/${character.Slug}` : `/character/${character._id}`,
                external: false,
            };
        },

        addTournament() {
            this.$router.push('/create-tournament');
        },

        prevMonth() {
            this.currentMonth = this.currentMonth.clone().subtract(1, 'month');
        },

        nextMonth() {
            this.currentMonth = this.currentMonth.clone().add(1, 'month');
        },

        selectDay(day) {
            if (this.isSelectedDay(day)) {
                this.selectedDay = null;
                return;
            }
            this.selectedDay = day;
        },

        isSelectedDay(day) {
            return Boolean(this.selectedDay) && this.selectedDay.date.isSame(day.date, 'day');
        },

        openEvent(event) {
            if (!event.link) return;
            if (event.external) {
                window.open(event.link, '_blank');
            } else {
                this.$router.push(event.link);
            }
        },
    },
};
</script>

<style scoped>
.calendar-view {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 20px;
}

.page-header .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.page-header h1 {
    color: #fff;
    font-size: 28px;
    font-weight: 700;
}

.add-tournament-btn {
    background: #3eb489;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;
}

.add-tournament-btn:hover {
    background: #2d8a6a;
}

.page-header p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin-bottom: 24px;
}

.filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 24px;
}

.filter-chip {
    background: #1c1c24;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.filter-chip:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.25);
}

.filter-chip.active {
    background: #3eb489;
    color: #fff;
    border-color: #3eb489;
}

.calendar-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
}

@media (max-width: 800px) {
    .calendar-layout {
        grid-template-columns: 1fr;
    }
}

.month-panel,
.upcoming-panel {
    background: #1c1c24;
    border-radius: 15px;
    padding: 20px;
}

.month-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.month-nav h2 {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
}

.nav-btn {
    background: rgba(255, 255, 255, 0.06);
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
}

.nav-btn:hover {
    background: #3eb489;
}

.weekday-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 6px;
}

.weekday-row span {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

.day-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.day-cell {
    aspect-ratio: 1 / 1;
    border-radius: 8px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.03);
    transition: background 0.15s ease;
}

.day-cell:hover {
    background: rgba(255, 255, 255, 0.08);
}

.day-cell.other-month .day-number {
    color: rgba(255, 255, 255, 0.25);
}

.day-cell.is-today {
    box-shadow: 0 0 0 1px #3eb489 inset;
}

.day-cell.is-selected {
    background: rgba(62, 180, 137, 0.25);
}

.day-cell.has-events .day-number {
    font-weight: 700;
}

.day-number {
    color: #fff;
    font-size: 12px;
}

.day-dots {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    justify-content: center;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
}

.dot.patch {
    background: #3eb489;
}

.dot.character {
    background: #e2984c;
}

.dot.tournament {
    background: #4447e2;
}

.dot.other {
    background: #888;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 16px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
}

.upcoming-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
}

.upcoming-header h2 {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
}

.clear-selection {
    background: none;
    border: none;
    color: #3eb489;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.empty-state {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    padding: 20px 0;
}

.event-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 560px;
    overflow-y: auto;
}

.calendar-event {
    display: flex;
    gap: 12px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.calendar-event:hover {
    background: rgba(255, 255, 255, 0.09);
}

.event-image {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
}

.event-body {
    min-width: 0;
    flex: 1;
}

.event-top-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
}

.event-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 10px;
    color: #fff;
}

.event-badge.patch {
    background: #3eb489;
}

.event-badge.character {
    background: #e2984c;
}

.event-badge.tournament {
    background: #4447e2;
}

.event-badge.other {
    background: #888;
}

.event-date {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}

.event-title {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.event-subtitle {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    margin-top: 2px;
}
</style>
