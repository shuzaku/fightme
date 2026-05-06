<!-- @format -->
<template>
    <div ref="videoViewRef" class="matches-view">

        <!-- Page header -->
        <div class="matches-header">
            <div class="matches-header-text">
                <h1>Matches</h1>
                <p class="matches-subtitle">
                    <span v-if="activeGameTitle">{{ activeGameTitle }} footage</span>
                    <span v-else-if="activeCharacterTitle">{{ activeCharacterTitle }} matches</span>
                    <span v-else>Browse all indexed match footage</span>
                </p>
            </div>
        </div>

        <!-- Game filter chips -->
        <div class="game-filter-bar">
            <div class="game-chips">
                <a href="/matches" :class="['game-chip', { active: !gameId && !characterId }]">
                    <i class="fas fa-fire"></i>
                    All Games
                </a>
                <a
                    v-for="game in featuredGames"
                    :key="game.id"
                    :href="`/matches/game/${game.id}`"
                    :class="['game-chip', 'game-chip--logo', { active: gameId === game.id }]"
                >
                    <img v-if="game.logoUrl" :src="game.logoUrl" :alt="game.title" />
                    <span>{{ game.title }}</span>
                </a>
            </div>
        </div>

        <!-- Active filter pill -->
        <div v-if="gameId || characterId" class="active-filters">
            <span class="active-filter-label">Filtered by:</span>
            <span v-if="activeGameTitle" class="active-filter-chip">
                {{ activeGameTitle }}
                <a href="/matches" class="filter-clear" title="Clear filter">
                    <i class="fas fa-times"></i>
                </a>
            </span>
            <span v-if="activeCharacterTitle" class="active-filter-chip">
                {{ activeCharacterTitle }}
                <a href="/matches" class="filter-clear" title="Clear filter">
                    <i class="fas fa-times"></i>
                </a>
            </span>
        </div>

        <!-- Match feed -->
        <div class="matches-feed">

            <!-- Loading skeleton -->
            <div v-if="isLoading && videos.length === 0" class="matches-skeleton">
                <div v-for="n in 3" :key="n" class="skeleton-card">
                    <div class="skeleton-video"></div>
                    <div class="skeleton-info">
                        <div class="skeleton-line skeleton-line--short"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line skeleton-line--med"></div>
                        <div class="skeleton-line skeleton-line--short"></div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="!isLoading && videos.length === 0" class="matches-empty">
                <i class="fas fa-video-slash"></i>
                <h3>No matches found</h3>
                <p>Try a different game or clear your filters.</p>
                <a href="/matches" class="empty-reset-btn">Clear Filters</a>
            </div>

            <!-- Video cards -->
            <div v-else class="videos-container">
                <div v-for="(video, index) in videos" :key="index" class="video-row">
                    <match-video-card
                        v-if="video.contentType === 'Match'"
                        v-model="video.isPlaying"
                        :matchId="video.matchId"
                        :account="account"
                        @video:delete="refreshDelete()"
                    />
                </div>
            </div>

            <!-- Load-more spinner -->
            <div v-if="isLoadingMore" class="loading-more">
                <i class="fas fa-circle-notch fa-spin"></i>
                <span>Loading more matches…</span>
            </div>

        </div>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import GamesService from '@/services/games-service';
import NewMatchVideoCard from '@/components/videos/match-video-card';
import { eventbus } from '@/main';

export default {
    name: 'Matches',

    components: {
        'match-video-card': NewMatchVideoCard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            videos: [],
            featuredGames: [],
            isLoading: true,
            isLoadingMore: false,
            favorites: [],
            activeGameTitle: null,
            activeCharacterTitle: null,
        };
    },

    computed: {
        skip() {
            return this.videos.length;
        },

        gameId() {
            return this.$route.params.gameId || null;
        },

        characterId() {
            return this.$route.params.characterId || null;
        },

        path() {
            return this.$route.path;
        },
    },

    watch: {
        path() {
            this.videos = [];
            this.isLoading = true;
            this.activeGameTitle = null;
            this.activeCharacterTitle = null;
            this.setActiveFilterLabel();
            this.queryVideos();
        },
    },

    mounted() {
        if (this.account) {
            this.updateFavorites();
        }
        this.loadFeaturedGames();
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('filter', this.applyFilter);
        eventbus.$on('search', this.newQuery);
        eventbus.$on('account:update', this.updateFavorites);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('filter', this.applyFilter);
        eventbus.$off('search', this.newQuery);
        eventbus.$off('account:update', this.updateFavorites);
    },

    methods: {
        async loadFeaturedGames() {
            const response = await GamesService.queryGames({
                searchQuery: [{ queryName: 'IsFeatured', queryValue: true }],
            });
            this.featuredGames = response.data.games
                .map((game) => ({ id: game._id, title: game.Title, logoUrl: game.LogoUrl }))
                .reverse();
            this.setActiveFilterLabel();
        },

        setActiveFilterLabel() {
            if (this.gameId && this.featuredGames.length) {
                const matched = this.featuredGames.find((g) => g.id === this.gameId);
                this.activeGameTitle = matched ? matched.title : null;
            }
        },

        newQuery(query) {
            this.videos = [];
            this.isLoading = true;
            this.queryVideos(query);
        },

        refreshDelete() {
            this.videos = [];
            this.isLoading = true;
            this.queryVideos();
        },

        applyFilter(filter) {
            this.videos = [];
            this.isLoading = true;
            this.queryVideos(filter);
        },

        async queryVideos() {
            const isFirstLoad = this.videos.length === 0;
            if (!isFirstLoad) this.isLoadingMore = true;

            const params = { skip: this.skip };
            if (this.gameId)      params.gameId = this.gameId;
            if (this.characterId) params.characterId = this.characterId;

            const response = await MatchesService.queryMatchesFeed(params);
            this.hydrateVideos(response);

            this.isLoading = false;
            this.isLoadingMore = false;

            if (this.videos.length > 0 && this.videos.length < 6) {
                this.videos[0].isPlaying = true;
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((match) => {
                this.videos.push({
                    matchId: match._id,
                    contentType: 'Match',
                    isEditing: false,
                    isPlaying: false,
                });
            });
        },

        handleScroll() {
            const bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight >=
                document.documentElement.offsetHeight - 200;
            if (bottomOfWindow && !this.isLoading && !this.isLoadingMore) {
                this.queryVideos();
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.isLoading = true;
            this.queryVideos();
        },

        updateFavorites() {
            if (this.account && this.account.id) {
                this.favorites = this.account.favoriteVideos.map((video) => ({
                    contentType: video.contentType,
                    id: video.id,
                }));
            }
        },
    },
};
</script>

<style>
.matches-view {
    padding-top: calc(var(--app-top-bar-height, 84px) + var(--app-follows-bar-height, 72px) + 32px);
    max-width: 1100px;
    margin: 0 auto;
    padding-left: clamp(16px, 3vw, 48px);
    padding-right: clamp(16px, 3vw, 48px);
    padding-bottom: 80px;
    box-sizing: border-box;
    width: 100%;
}

/* ── Header ── */
.matches-view .matches-header {
    margin-bottom: 24px;
}

.matches-view .matches-header h1 {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: clamp(26px, 4vw, 38px);
    color: #fff;
    margin: 0 0 4px;
    line-height: 1.1;
}

.matches-view .matches-subtitle {
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0;
}

/* ── Game chips ── */
.matches-view .game-filter-bar {
    overflow: hidden;
    margin-bottom: 16px;
}

.matches-view .game-chips {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 6px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.matches-view .game-chips::-webkit-scrollbar { display: none; }

.matches-view .game-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 18px;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Roboto', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.matches-view .game-chip:hover {
    border-color: rgba(62, 180, 137, 0.4);
    color: #fff;
    background: rgba(62, 180, 137, 0.07);
}

.matches-view .game-chip.active {
    background: rgba(62, 180, 137, 0.15);
    border-color: #3eb489;
    color: #3eb489;
    font-weight: 600;
}

.matches-view .game-chip--logo img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    border-radius: 3px;
}

/* ── Active filter pill ── */
.matches-view .active-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.matches-view .active-filter-label {
    font-family: 'Roboto', sans-serif;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.matches-view .active-filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 20px;
    background: rgba(62, 180, 137, 0.1);
    border: 1px solid rgba(62, 180, 137, 0.3);
    color: #3eb489;
    font-family: 'Roboto', sans-serif;
    font-size: 13px;
    font-weight: 500;
}

.matches-view .filter-clear {
    color: #3eb489;
    opacity: 0.6;
    font-size: 11px;
    text-decoration: none;
    transition: opacity 0.2s;
}

.matches-view .filter-clear:hover { opacity: 1; }

/* ── Feed ── */
.matches-view .matches-feed { width: 100%; }

.matches-view .videos-container {
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* Pull the excessive card margin back to something sane at the page level */
.matches-view .video-row { width: 100%; }
.matches-view .video-row .match-card { margin: 0 0 24px; }

/* ── Skeleton ── */
.matches-view .matches-skeleton {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.matches-view .skeleton-card {
    display: flex;
    background: #242832;
    border-radius: 15px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.06);
    min-height: 220px;
}

.matches-view .skeleton-video {
    flex: 3;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: matches-shimmer 1.5s infinite;
}

.matches-view .skeleton-info {
    flex: 1;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    justify-content: center;
}

.matches-view .skeleton-line {
    height: 13px;
    border-radius: 6px;
    width: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: matches-shimmer 1.5s infinite;
}

.matches-view .skeleton-line--short { width: 38%; }
.matches-view .skeleton-line--med   { width: 60%; }

@keyframes matches-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ── Empty state ── */
.matches-view .matches-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 80px 20px;
    text-align: center;
}

.matches-view .matches-empty i {
    font-size: 44px;
    color: rgba(62, 180, 137, 0.3);
}

.matches-view .matches-empty h3 {
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
}

.matches-view .matches-empty p {
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.35);
    margin: 0;
}

.matches-view .empty-reset-btn {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 24px;
    background: rgba(62, 180, 137, 0.1);
    border: 1px solid rgba(62, 180, 137, 0.3);
    color: #3eb489;
    font-family: 'Roboto', sans-serif;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    transition: all 0.2s ease;
    margin-top: 6px;
}

.matches-view .empty-reset-btn:hover { background: rgba(62, 180, 137, 0.18); }

/* ── Load-more spinner ── */
.matches-view .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    color: rgba(255, 255, 255, 0.35);
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
}

.matches-view .loading-more i { color: #3eb489; font-size: 18px; }

/* ── Mobile ── */
@media (max-width: 640px) {
    .matches-view .skeleton-card { flex-direction: column; }
    .matches-view .skeleton-video { min-height: 180px; flex: none; }
}
</style>
