<!-- @format -->
<template>
    <div ref="videoViewRef" class="game-view">
        <loading v-if="!gameResolveFailed && (resolvingGame || !resolvedGameId || loading)"></loading>
        <div v-else-if="gameResolveFailed" class="game-not-found">
            <p>We could not find that game. Check the link or browse all games.</p>
            <v-btn text color="primary" :to="{ name: 'Games' }">Games</v-btn>
        </div>
        <div v-else class="character-container">
            <game-nav
                v-if="!loading"
                :gameId="gameId"
                :account="account"
                :content-tabs="allContentTabs"
                :active-tab-id="activeContentTab"
                @select-content-tab="onSelectContentTab"
            />

            <!-- Game Statistics Section -->
            <div class="stats-and-cta-container">
                <div class="game-stats">
                    <div class="stat-card">
                        <p class="number">
                            <span v-if="statsLoading && stats.characters === 0">...</span>
                            <span v-else>{{ stats.characters | commaDelimited }}</span>
                        </p>
                        <p class="label">Characters</p>
                    </div>
                    <div class="stat-card">
                        <p class="number">
                            <span v-if="statsLoading && stats.matches === 0">...</span>
                            <span v-else>{{ stats.matches | commaDelimited }}</span>
                        </p>
                        <p class="label">Matches</p>
                    </div>
                    <div class="stat-card">
                        <p class="number">
                            <span v-if="statsLoading && stats.combos === 0">...</span>
                            <span v-else>{{ stats.combos | commaDelimited }}</span>
                        </p>
                        <p class="label">Combos</p>
                    </div>
                </div>

                <!-- Compact CTA for games with content -->
                <div v-if="!isNewGame && !statsLoading" class="game-cta-compact">
                    <div class="cta-compact-content">
                        <p class="cta-compact-text">Contribute to this game's community</p>
                        <div class="cta-compact-actions">
                            <v-btn
                                class="cta-compact-btn"
                                rounded
                                small
                                @click="openAddModal('match')"
                                >Add Match</v-btn
                            >
                            <v-btn
                                class="cta-compact-btn"
                                rounded
                                small
                                @click="openAddModal('combo')"
                                >Add Combo</v-btn
                            >
                            <v-btn class="cta-compact-btn" rounded small @click="createTierList"
                                >Create Tier List</v-btn
                            >
                        </div>
                    </div>
                </div>
            </div>

            <explore-characters
                :key="gameId"
                :gameId="gameId"
            />
            <game-team-filter
                v-if="isTeamGame"
                :key="gameId + '-team'"
                :gameId="gameId"
                @change="onTeamFilterChange"
            />
            <game-point-character-filter
                v-if="isPointGame"
                :key="gameId + '-point'"
                :gameId="gameId"
                @change="onPointFilterChange"
            />
            <div v-if="featuredVideos && featuredVideos.length > 0" class="featured-videos">
                <h2>🎥 Featured Videos</h2>
                <div class="videos">
                    <youtube-media
                        v-for="video in featuredVideos"
                        :key="video.id"
                        ref="youtubeRef"
                        :video-id="video.url"
                        :player-width="350"
                        :player-height="200"
                        :player-vars="{ autoplay: 0 }"
                        :mute="true"
                        :playsinline="1"
                    />
                </div>
            </div>
            <!-- Call to Action for New Games -->
            <div v-if="isNewGame" class="game-cta">
                <h2>Help Build This Game's Community!</h2>
                <p class="cta-description">
                    This game is just getting started. Be the first to add matches, combos, and
                    tournaments to help build the community!
                </p>
                <div class="cta-actions">
                    <v-btn class="cta-btn" rounded @click="openAddModal('match')">Add Match</v-btn>
                    <v-btn class="cta-btn" rounded @click="openAddModal('combo')">Add Combo</v-btn>
                    <v-btn class="cta-btn" rounded @click="createTierList">Create Tier List</v-btn>
                </div>
            </div>

            <div
                id="game-content-tabs"
                class="game-content-tabs"
                :aria-label="currentContentTabLabel"
            >
                <h2 class="visually-hidden-game-info">{{ currentContentTabLabel }}</h2>
                <div
                    v-show="isVideoContentTab"
                    class="game-content-panel game-content-panel--videos"
                >
                    <game-videos
                        id="game-videos"
                        :gameId="gameId"
                        :selectedVideoType="selectedVideoType"
                        :teamChar1="teamChar1"
                        :teamChar2="teamChar2"
                        :pointChar="pointChar"
                        :account="account"
                    />
                </div>
                <div
                    v-if="tierLists && tierLists.length"
                    v-show="activeContentTab === 'tiers'"
                    class="game-content-panel game-content-panel--tiers"
                >
                    <div class="tier-lists-grid">
                        <div
                            v-for="list in tierLists"
                            :key="list.id"
                            class="tier-list-item"
                            @click="goToTierListDetails(list.id)"
                        >
                            <div class="tier-list-header">
                                <h3>{{ list.name }}</h3>
                                <span class="tier-list-author">by {{ list.author }}</span>
                            </div>
                            <div class="tier-list-preview">
                                <img
                                    v-for="(charUrl, index) in (list.topCharacters || []).filter(
                                        (u) => u
                                    )"
                                    :key="index"
                                    :src="charUrl"
                                    class="preview-character"
                                />
                            </div>
                            <div class="tier-list-stats">
                                <span><i class="fas fa-eye"></i> {{ list.views || 0 }}</span>
                                <span
                                    ><i class="fas fa-thumbs-up"></i> {{ list.likes || 0 }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="rankings && rankings.length"
                    v-show="activeContentTab === 'rankings'"
                    class="game-content-panel game-content-panel--rankings"
                >
                    <rankings-leaderboard :rows="rankings" />
                </div>
                <div
                    v-if="seasonRankings && seasonRankings.length"
                    v-show="activeContentTab === 'season-rankings'"
                    class="game-content-panel game-content-panel--season-rankings"
                >
                    <season-power-rankings-leaderboard
                        :rows="seasonRankings"
                        :seasons="seasonRankingsSeasons"
                        :computed-seasons="seasonRankingsComputedSeasons"
                        :selected-season="selectedSeason"
                        @change-season="handleSeasonChange"
                    />
                </div>
                <div
                    v-if="gameUpdates && gameUpdates.length"
                    v-show="activeContentTab === 'updates'"
                    class="game-content-panel game-content-panel--updates"
                >
                    <div class="updates">
                        <div
                            v-for="update in gameUpdates"
                            :key="update.id"
                            class="update"
                        >
                            <update-card :update="update" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GameNav from '@/components/games/game-nav';
import Loading from '@/components/common/loading';
import ExploreCharacters from '@/components/explore/explore-characters';
import GameVideos from '@/components/games/game-videos';
import GameTeamFilter from '@/components/games/game-team-filter';
import GamePointCharacterFilter from '@/components/games/game-point-character-filter';
import { isTeamPairingGame, isPointCharacterGame } from '@/utils/team-games';
import GamesService from '@/services/games-service';
import FeaturedVideosService from '@/services/featured-videos-service';
import TierListsService from '@/services/tier-lists-service';
import UpdatesService from '@/services/updates-service';
import PlayerRatingsService from '@/services/player-ratings-service';
import SeasonPowerRankingsService from '@/services/season-power-rankings-service';
import UpdateCard from '@/components/update/update-card';
import RankingsLeaderboard from '@/components/rankings/rankings-leaderboard.vue';
import SeasonPowerRankingsLeaderboard from '@/components/rankings/season-power-rankings-leaderboard.vue';
import moment from 'moment';
import { eventbus } from '@/main';
import { setPageTitle } from '@/services/og-meta-service';

import { resolveGameIdFromRouteParam } from '@/utils/game-character-routes';

export default {
    name: 'Game',

    components: {
        'game-nav': GameNav,
        loading: Loading,
        'explore-characters': ExploreCharacters,
        'game-videos': GameVideos,
        'game-team-filter': GameTeamFilter,
        'game-point-character-filter': GamePointCharacterFilter,
        'update-card': UpdateCard,
        'rankings-leaderboard': RankingsLeaderboard,
        'season-power-rankings-leaderboard': SeasonPowerRankingsLeaderboard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            resolvingGame: false,
            resolvedGameId: null,
            gameResolveFailed: false,
            loading: false,
            game: {
                id: null,
                name: null,
                logo: null,
                abbreviation: null,
            },
            activeContentTab: 'online',
            teamChar1: null,
            teamChar2: null,
            pointChar: null,
            stats: {
                characters: 0,
                matches: 0,
                tournaments: 0,
                combos: 0,
            },
            featuredVideos: null,
            tierLists: [],
            statsLoading: false,
            gameUpdates: [],
            rankings: [],
            seasonRankings: [],
            seasonRankingsSeasons: [],
            seasonRankingsComputedSeasons: [],
            selectedSeason: null,
        };
    },

    computed: {
        gameRouteParam() {
            return this.$route.params.gameKey;
        },
        gameId: function () {
            return this.resolvedGameId || '';
        },
        isNewGame: function () {
            if (this.statsLoading) return false;
            return (
                this.stats.matches === 0 && this.stats.combos === 0 && this.stats.tournaments === 0
            );
        },
        allContentTabs() {
            const t = [
                { id: 'combos', label: 'Combos' },
                { id: 'online', label: 'Online Matches' },
                { id: 'tournament', label: 'Tournament Matches' },
            ];
            if (this.tierLists && this.tierLists.length) {
                t.push({ id: 'tiers', label: '📊 Tier lists' });
            }
            if (this.gameUpdates && this.gameUpdates.length) {
                t.push({ id: 'updates', label: '📰 Game updates' });
            }
            if (this.rankings && this.rankings.length) {
                t.push({ id: 'rankings', label: '🏆 Rankings' });
            }
            if (this.seasonRankings && this.seasonRankings.length) {
                t.push({ id: 'season-rankings', label: '📅 Season Power Rankings' });
            }
            return t;
        },
        isVideoContentTab() {
            return (
                this.activeContentTab === 'combos' ||
                this.activeContentTab === 'online' ||
                this.activeContentTab === 'tournament'
            );
        },

        isTeamGame() {
            return isTeamPairingGame(this.gameId);
        },

        isPointGame() {
            return isPointCharacterGame(this.gameId);
        },
        selectedVideoType() {
            return this.mapTabIdToGameVideosLabel(this.activeContentTab);
        },
        currentContentTabLabel() {
            const row = this.allContentTabs.find((r) => r.id === this.activeContentTab);
            return row && row.label ? row.label : 'Content';
        },
    },

    watch: {
        gameRouteParam: {
            immediate: true,
            handler() {
                this.resolveGameFromRoute();
            },
        },
        resolvedGameId: function (id) {
            if (!id) {
                return;
            }
            this.getGame();
            this.getGameStats();
            this.getFeaturedVideos();
            this.getTierLists();
            this.getGameUpdates();
            this.getPlayerRankings();
            this.getSeasonPowerRankings();
            this.activeContentTab = 'online';
        },
        allContentTabs: {
            deep: true,
            handler() {
                this.ensureActiveContentTab();
            },
        },
    },

    mounted() {
        this.$nextTick(() => {
            this.ensureActiveContentTab();
        });
    },

    beforeDestroy() {},

    methods: {
        async resolveGameFromRoute() {
            this.gameResolveFailed = false;
            var param = this.gameRouteParam;
            if (!param) {
                this.resolvedGameId = null;
                return;
            }
            this.resolvingGame = true;
            try {
                var id = await resolveGameIdFromRouteParam(param);
                this.resolvedGameId = id || null;
                this.gameResolveFailed = !this.resolvedGameId;
            } finally {
                this.resolvingGame = false;
            }
        },

        async getGame() {
            if (!this.gameId) {
                this.loading = false;
                return;
            }
            this.loading = true;

            const response = await GamesService.getGame({
                id: this.gameId,
            });

            var game = response.data;
            this.game = {
                id: game._id,
                name: game.Title,
                logo: game.LogoUrl || null,
                abbreviation: game.Abbreviation || null,
            };
            setPageTitle(
                `${game.Title} matches & combos`,
                `Browse every indexed ${game.Title} match, combo clip, character, and tournament on Fighters Edge.`,
                game.LogoUrl || undefined
            );
            this.loading = false;
        },

        async getGameStats() {
            if (!this.gameId) {
                return;
            }
            this.statsLoading = true;
            try {
                const response = await GamesService.getGameStats({
                    id: this.gameId,
                });

                this.stats = {
                    characters: response.data.characters || 0,
                    matches: response.data.matches || 0,
                    tournaments: response.data.tournaments || 0,
                    combos: response.data.combos || 0,
                };
            } catch (error) {
                console.error('Error fetching game stats:', error);
                // Keep existing stats on error rather than resetting to 0
            } finally {
                this.statsLoading = false;
            }
        },

        onTeamFilterChange({ char1, char2 }) {
            this.teamChar1 = char1;
            this.teamChar2 = char2;
        },

        onPointFilterChange({ pointChar }) {
            this.pointChar = pointChar;
        },

        mapTabIdToGameVideosLabel(id) {
            if (id === 'combos') {
                return 'Combos';
            }
            if (id === 'online') {
                return 'Online Matches';
            }
            if (id === 'tournament') {
                return 'Tournament Matches';
            }
            return 'Online Matches';
        },

        ensureActiveContentTab() {
            const valid = (this.allContentTabs || []).some(
                (t) => t && t.id === this.activeContentTab
            );
            if (!valid) {
                this.activeContentTab = 'online';
            }
        },

        onSelectContentTab(id) {
            this.activeContentTab = id;
            this.$nextTick(() => {
                const el = document.getElementById('game-content-tabs');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        },

        scrollToVideos() {
            this.activeContentTab = 'online';
            this.$nextTick(() => {
                const el = document.getElementById('game-content-tabs');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },

        scrollToCombos() {
            this.activeContentTab = 'combos';
            this.$nextTick(() => {
                const el = document.getElementById('game-content-tabs');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },

        openAddModal(option) {
            eventbus.$emit('open:widget', { name: option, valuse: option });
        },

        createTierList() {
            // Navigate to tier list maker with the current gameId as a query parameter
            this.$router.push({
                name: 'TierListMaker',
                query: { gameId: this.gameId },
            });
        },

        getFeaturedVideos() {
            if (!this.gameId) {
                this.featuredVideos = [];
                return;
            }
            var queryParameter = {
                limit: 3,
                sort: '_id',
                sortDirection: 'desc',
                GameId: this.gameId,
                Type: 'Game',
            };

            FeaturedVideosService.fetchFeaturedVideos(queryParameter)
                .then((response) => {
                    this.featuredVideos = this.mapVideos(response.data.video);
                })
                .catch((error) => {
                    console.error('Error fetching featured videos:', error);
                    this.featuredVideos = [];
                });
        },

        mapVideos(videos) {
            return videos.map((video) => {
                return {
                    id: video._id,
                    url: video.VideoUrl,
                };
            });
        },

        async getTierLists() {
            try {
                const response = await TierListsService.getTierLists();
                const allTierLists = this.mapTierListItems(response.data);
                // Filter tier lists by current gameId
                this.tierLists = allTierLists.filter((list) => list.gameId === this.gameId);
            } catch (error) {
                console.error('Error fetching tier lists:', error);
                this.tierLists = [];
            }
        },

        async getGameUpdates() {
            try {
                const response = await UpdatesService.fetchRecentUpdates();
                const allUpdates = response.data.updates.map((update) => {
                    return {
                        id: update._id,
                        type: update.Type,
                        subType: update.SubType,
                        games: update.Games,
                        note: update.Note,
                        date: moment(update.Date).add('days', 1).local().format('MM.DD.YY'),
                        image: update.Image,
                        link: update.Link,
                    };
                });
                // Filter updates by current gameId
                this.gameUpdates = allUpdates.filter((update) => {
                    if (!update.games || !Array.isArray(update.games)) return false;
                    return update.games.some((game) => {
                        // Handle both ObjectId objects and string IDs
                        const gameIdStr =
                            typeof game === 'object' && game._id
                                ? game._id.toString()
                                : game.toString();
                        return gameIdStr === this.gameId;
                    });
                });
            } catch (error) {
                console.error('Error fetching game updates:', error);
                this.gameUpdates = [];
            }
        },

        async getPlayerRankings() {
            if (!this.gameId) {
                this.rankings = [];
                return;
            }
            try {
                const response = await PlayerRatingsService.getLeaderboard(this.gameId, { limit: 50 });
                const rows = (response.data && response.data.ratings) || [];
                this.rankings = rows.map((row, index) => {
                    const player = row.PlayerId && typeof row.PlayerId === 'object' ? row.PlayerId : null;
                    return {
                        rank: index + 1,
                        playerId: player ? player._id : row.PlayerId,
                        name: player ? player.Name : 'Unknown player',
                        imageUrl: player ? player.ImageUrl : null,
                        slug: player ? player.Slug : null,
                        rating: Math.round(row.Rating),
                        rd: Math.round(row.RatingDeviation),
                        wins: row.Wins || 0,
                        losses: row.Losses || 0,
                        lastActiveLabel: row.LastEventAt
                            ? moment(row.LastEventAt).format('MMM YYYY')
                            : null,
                    };
                });
            } catch (error) {
                console.error('Error fetching player rankings:', error);
                this.rankings = [];
            }
        },

        async getSeasonPowerRankings() {
            if (!this.gameId) {
                this.seasonRankings = [];
                this.seasonRankingsSeasons = [];
                this.seasonRankingsComputedSeasons = [];
                this.selectedSeason = null;
                return;
            }
            try {
                const seasonsResponse = await SeasonPowerRankingsService.getAvailableSeasons(this.gameId);
                const computedSeasons = (seasonsResponse.data && seasonsResponse.data.seasons) || [];
                this.seasonRankingsComputedSeasons = computedSeasons;

                // The year filter should let you browse ANY season, not just
                // ones already computed — otherwise there's no way to notice
                // "hey, 2022 hasn't been backfilled yet" from the UI. Merge
                // computed years with a browsable range back to
                // SEASON_EARLIEST_YEAR_FALLBACK (matches ranking-service's
                // SEASON_EARLIEST_YEAR default of 2018 — see that service's
                // README if it's ever configured differently).
                const SEASON_EARLIEST_YEAR_FALLBACK = 2018;
                const currentYear = new Date().getFullYear();
                const browsableRange = [];
                for (let y = currentYear; y >= SEASON_EARLIEST_YEAR_FALLBACK; y -= 1) browsableRange.push(y);

                const allYears = new Set([...computedSeasons, ...browsableRange]);
                this.seasonRankingsSeasons = Array.from(allYears).sort((a, b) => b - a);

                // Default to the most recent COMPUTED season if there is
                // one; otherwise just land on the current year so there's
                // still something sensible selected (the leaderboard will
                // show its existing "no data yet" empty state).
                this.selectedSeason = computedSeasons.length > 0 ? computedSeasons[0] : currentYear;
                await this.fetchSeasonRankingsFor(this.selectedSeason);
            } catch (error) {
                console.error('Error fetching season power rankings:', error);
                this.seasonRankings = [];
                this.seasonRankingsSeasons = [];
                this.seasonRankingsComputedSeasons = [];
                this.selectedSeason = null;
            }
        },

        async fetchSeasonRankingsFor(season) {
            try {
                const response = await SeasonPowerRankingsService.getLeaderboard(this.gameId, season, { limit: 50 });
                const rows = (response.data && response.data.rankings) || [];
                this.seasonRankings = rows.map((row) => {
                    const player = row.PlayerId && typeof row.PlayerId === 'object' ? row.PlayerId : null;
                    // A row may represent someone never linked to a Fighters-Edge
                    // player profile — tracked across the season via their
                    // start.gg account instead (see ranking-service's
                    // entrant-identity.js). No profile to link to in that case.
                    return {
                        rank: row.Rank,
                        playerId: player ? player._id : null,
                        name: player ? player.Name : row.UnresolvedName || 'Unknown player',
                        imageUrl: player ? player.ImageUrl : null,
                        slug: player ? player.Slug : null,
                        unlinked: !player,
                        score: Math.round(row.Score * 10) / 10,
                        tournamentsAttended: row.TournamentsAttended || 0,
                        notConverged: row.Converged === false,
                    };
                });
            } catch (error) {
                console.error('Error fetching season power rankings for season', season, error);
                this.seasonRankings = [];
            }
        },

        async handleSeasonChange(season) {
            this.selectedSeason = season;
            await this.fetchSeasonRankingsFor(season);
        },

        mapTierListItems(items) {
            return items.map((item) => {
                // Find top 3 characters
                let topCharacters = [];
                if (item.Tiers && item.Tiers.length > 0) {
                    for (const tier of item.Tiers) {
                        if (tier.Characters && tier.Characters.length > 0) {
                            topCharacters = topCharacters.concat(tier.Characters);
                            if (topCharacters.length >= 3) break;
                        }
                    }
                }
                topCharacters = topCharacters
                    .slice(0, 3)
                    .map((c) => c.AvatarUrl)
                    .filter((url) => url);

                return {
                    id: item._id,
                    gameId: item.GameId ? item.GameId._id : null,
                    gameLogo: item.GameId ? item.GameId.LogoUrl : null,
                    name: item.Name,
                    author: item.OwnerId ? item.OwnerId.DisplayName : 'Unknown',
                    views: item.Views || 0,
                    likes: item.Likes ? item.Likes.length : 0,
                    topCharacters: topCharacters,
                };
            });
        },

        goToTierListDetails(id) {
            this.$router.push({ name: 'TierListDetails', params: { id: id } });
        },
    },
};
</script>

<style>
.game-view {
    position: relative;
    height: 100%;
    overflow: visible;
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 20px 120px;
    padding-top: 180px;
}

/* Angled backdrop wash behind the hero, so the banner reads as part of a
   stylized spread rather than a floating card. */
.game-view::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 560px;
    background: linear-gradient(180deg, #1b1d2b 0%, #242832 100%);
    clip-path: polygon(0 0, 100% 0, 100% 78%, 0 100%);
    pointer-events: none;
    z-index: 0;
}

.game-view > * {
    position: relative;
    z-index: 1;
}

.mobile .game-view {
    padding: 150px 14px 80px;
}

/* Condensed uppercase section headings, matching the character page. */
.game-view .featured-videos h2,
.game-view .game-cta h2 {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.game-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.game-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.game-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.game-view .videos-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.game-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.game-view .stats-and-cta-container {
    display: flex;
    gap: 16px;
    margin: 40px 0;
    align-items: flex-start;
    flex-wrap: wrap;
}

.game-view .game-stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    flex: 1;
    min-width: 300px;
}

.game-view .game-stats .stat-card {
    background: #0e1018cc;
    padding: 16px 18px;
    max-width: 200px;
    min-width: 140px;
    height: 85px;
    width: 100%;
    color: #ffffff90;
    border: 1px solid #ffffff1f;
    border-bottom: 2px solid #3eb489;
    transform: skewX(-8deg);
    flex: 1;
}

.game-view .game-stats .stat-card > * {
    transform: skewX(8deg);
}

.game-view .game-stats .stat-card .number {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.05;
    color: #fff;
    margin-bottom: 2px;
}

.game-view .game-stats .stat-card .label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffffff70;
}

.game-view .game-cta {
    background: linear-gradient(180deg, #1b1e2b 0%, #16181f 100%);
    border-radius: 4px;
    padding: 40px;
    margin: 60px 0;
    text-align: center;
    border: 1px solid #ffffff1f;
    border-left: 3px solid #3eb489;
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
}

.game-view .game-cta h2 {
    color: #fff;
    font-size: 32px;
    margin-bottom: 16px;
    font-weight: 700;
}

.game-view .game-cta .cta-description {
    color: #ffffff90;
    font-size: 16px;
    margin-bottom: 32px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
}

.game-view .game-cta .cta-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

.game-view .game-cta .cta-btn {
    background: #3eb489 !important;
    color: #06231a !important;
    padding: 12px 32px;
    border-radius: 0 !important;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.game-view .game-cta .cta-btn:hover {
    background: #2d8a6a !important;
}

.game-view .game-cta-compact {
    background: linear-gradient(180deg, #1b1e2b 0%, #16181f 100%);
    border-radius: 4px;
    padding: 14px 20px;
    border: 1px solid #ffffff1f;
    border-left: 3px solid #3eb489;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
    flex: 0 0 auto;
    min-width: 280px;
    max-width: 400px;
    height: 85px;
    display: flex;
    align-items: center;
}

.game-view .game-cta-compact .cta-compact-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    justify-content: center;
}

.game-view .game-cta-compact .cta-compact-text {
    color: #ffffff90;
    font-size: 13px;
    margin: 0;
    font-weight: 400;
    line-height: 1.2;
    text-align: center;
}

.game-view .game-cta-compact .cta-compact-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.game-view .game-cta-compact .cta-compact-btn {
    background: #3eb489 !important;
    color: #06231a !important;
    padding: 6px 16px;
    border-radius: 0 !important;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-size: 13px;
    flex: 1;
    min-width: 100px;
    height: 28px;
}

.game-view .game-cta-compact .cta-compact-btn:hover {
    background: #2d8a6a !important;
}

.mobile .game-view .stats-and-cta-container {
    flex-direction: column;
}

.mobile .game-view .game-stats {
    width: 100%;
}

.mobile .game-view .game-stats .stat-card {
    max-width: 100%;
    width: 48%;
}

.mobile .game-view .game-cta-compact {
    width: 100%;
    max-width: 100%;
    min-width: auto;
}

.mobile .game-view .game-cta-compact .cta-compact-actions {
    flex-direction: column;
}

.mobile .game-view .game-cta-compact .cta-compact-btn {
    width: 100%;
}

.game-view .featured-videos {
    margin: 60px 0;
}

.game-view .featured-videos h2 {
    color: #fff;
    font-size: 28px;
    margin-bottom: 24px;
    font-weight: 600;
}

.game-view .featured-videos .videos {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.mobile .game-view .featured-videos .videos {
    justify-content: center;
}

.game-view .game-content-tabs {
    position: relative;
    margin: 60px 0;
    scroll-margin-top: var(--app-top-bar-height, 84px);
    background: transparent;
}

.game-view .visually-hidden-game-info {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.game-view .game-content-panel {
    background: transparent;
    padding-top: 0;
}

.game-view .game-not-found {
    text-align: center;
    padding: 120px 24px;
    color: #fff;
}

.game-view .game-not-found p {
    margin-bottom: 16px;
    opacity: 0.9;
}

.game-view .tier-lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.game-view .tier-list-item {
    background: linear-gradient(180deg, #1b1e2b 0%, #16181f 100%);
    border-radius: 4px;
    padding: 18px 20px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    border: 1px solid #ffffff1f;
    border-left: 3px solid #3eb489;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.game-view .tier-list-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: #3eb48959;
    border-left-color: #5ae1ae;
}

.game-view .tier-list-header {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.game-view .tier-list-header h3 {
    color: #fff;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.game-view .tier-list-author {
    color: #ffffff90;
    font-size: 12px;
}

.game-view .tier-list-preview {
    display: flex;
    gap: 8px;
    min-height: 50px;
    align-items: center;
}

.game-view .preview-character {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    background-color: #333;
    border: 1px solid #ffffff20;
}

.game-view .tier-list-stats {
    display: flex;
    gap: 15px;
    color: #ffffff90;
    font-size: 14px;
    margin-top: auto;
}

.game-view .tier-list-stats i {
    margin-right: 5px;
}

.mobile .game-view .tier-lists-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
}

.game-view .game-content-tabs .updates {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    gap: 0;
    margin: -12px;
    margin-bottom: 20px;
}

.game-view .game-content-tabs .update {
    display: flex;
    flex: 0 0 auto;
    position: relative;
}

.mobile .game-view .game-content-tabs .update {
    max-width: none;
}
</style>
