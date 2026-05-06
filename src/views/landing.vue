<!-- @format -->
<template>
    <div class="landing-view">

        <!-- ── Hero ── -->
        <section class="lv-hero">
            <div class="lv-container">
                <h1 class="lv-hero-h1">
                    Find any matchup, from any tournament, instantly.
                </h1>
                <p class="lv-hero-sub">
                    Thousands of indexed pro and tournament matches across SF6, Tekken 8, 2XKO,
                    GGST, and more. Free, forever.
                </p>

                <div class="lv-search-wrap">
                    <general-search />
                </div>

                <div class="lv-suggestions">
                    <span class="lv-suggestions-label">Try one of these:</span>
                    <a href="/matches" class="lv-chip">Ken vs JP — SF6</a>
                    <a href="/matches" class="lv-chip">Knee — Tekken 8</a>
                    <a href="/matches" class="lv-chip">Punk this month</a>
                    <a href="/matches" class="lv-chip">Mishima mirrors</a>
                    <a href="/matches" class="lv-chip">EVO Japan 2026 top 8</a>
                </div>
            </div>
        </section>

        <!-- ── Demo video placeholder ── -->
        <section class="lv-demo-section">
            <div class="lv-container">
                <div class="lv-demo-box">
                    <i class="fas fa-play-circle lv-demo-play-icon"></i>
                    <span class="lv-demo-title">Demo GIF / video</span>
                    <p class="lv-demo-caption">
                        Search → results → click → timestamped clip (10–15 sec loop)
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Stats bar ── -->
        <section class="lv-stats-section">
            <div class="lv-container">
                <div class="lv-stats-row">
                    <div class="lv-stat">
                        <span class="lv-stat-label">Matches indexed</span>
                        <span class="lv-stat-num">
                            {{ counts && counts.matches ? (counts.matches | commaDelimited) : '12,400+' }}
                        </span>
                    </div>
                    <div class="lv-stat-divider"></div>
                    <div class="lv-stat">
                        <span class="lv-stat-label">Pro players tracked</span>
                        <span class="lv-stat-num">
                            {{ counts && counts.players ? (counts.players | commaDelimited) : '600+' }}
                        </span>
                    </div>
                    <div class="lv-stat-divider"></div>
                    <div class="lv-stat">
                        <span class="lv-stat-label">Games supported</span>
                        <span class="lv-stat-num">
                            {{ counts && counts.games ? counts.games : '6' }}
                        </span>
                    </div>
                    <div class="lv-stat-divider"></div>
                    <div class="lv-stat">
                        <span class="lv-stat-label">Added this week</span>
                        <span class="lv-stat-num lv-stat-num--accent">
                            {{ weeklyCount != null ? weeklyCount : '—' }}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Browse by game ── -->
        <section class="lv-games-section">
            <div class="lv-container">
                <div class="lv-section-header">
                    <h2 class="lv-section-h2">Browse by game</h2>
                    <a href="/games" class="lv-view-all">All games →</a>
                </div>
                <explore-games />
            </div>
        </section>

        <!-- ── New characters ── -->
        <section v-if="recentCharacters && recentCharacters.length" class="lv-characters-section">
            <div class="lv-container">
                <div class="lv-section-header">
                    <h2 class="lv-section-h2">New characters</h2>
                    <a href="/games" class="lv-view-all">Browse all →</a>
                </div>
                <div class="lv-characters-stage">
                    <character-slideshow
                        :characters="recentCharacters"
                        :auto-play="true"
                        :interval="4000"
                        :isMobile="false"
                    />
                </div>
            </div>
        </section>

        <!-- ── Trending this week ── -->
        <section class="lv-trending-section">
            <div class="lv-container">
                <div class="lv-section-header">
                    <h2 class="lv-section-h2">Trending this week</h2>
                    <a href="/matches" class="lv-view-all">View all →</a>
                </div>

                <div class="lv-trending-grid">
                    <!-- loaded cards -->
                    <a
                        v-for="match in featuredMatches"
                        :key="match.id"
                        :href="`/match/${match.id}`"
                        class="lv-match-card"
                    >
                        <div class="lv-match-thumb">
                            <img
                                :src="`https://img.youtube.com/vi/${match.url}/hqdefault.jpg`"
                                :alt="'Featured match'"
                                loading="lazy"
                            />
                            <div class="lv-match-play-btn">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="lv-match-meta">
                            <p class="lv-match-title">{{ match.title || 'Featured match' }}</p>
                            <p class="lv-match-event">{{ match.subtitle || 'Fighters Edge' }}</p>
                        </div>
                    </a>

                    <!-- skeleton while loading -->
                    <template v-if="!featuredMatches || featuredMatches.length === 0">
                        <div v-for="i in 3" :key="'sk' + i" class="lv-match-card lv-match-card--skeleton">
                            <div class="lv-match-thumb lv-sk-box"></div>
                            <div class="lv-match-meta">
                                <div class="lv-sk-line" style="width: 68%"></div>
                                <div class="lv-sk-line" style="width: 44%; margin-top: 7px"></div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </section>

        <!-- ── Built for studying the game ── -->
        <section class="lv-features-section">
            <div class="lv-container">
                <h2 class="lv-section-h2">Built for studying the game</h2>

                <div class="lv-features-grid">
                    <a href="/matches" class="lv-feat-card">
                        <h3>Matchup study</h3>
                        <p>Pull every Ken vs JP set, filtered by player skill or tournament tier.</p>
                    </a>
                    <div class="lv-feat-card">
                        <h3>Auto-timestamps</h3>
                        <p>Jump straight to punishes, throw techs, and clutch moments.</p>
                    </div>
                    <a href="/players" class="lv-feat-card">
                        <h3>Player profiles</h3>
                        <p>Follow pros, get notified when new sets drop.</p>
                    </a>
                    <a href="/collections" class="lv-feat-card">
                        <h3>Notes &amp; collections</h3>
                        <p>Save sets, take notes on tendencies, share tier lists.</p>
                    </a>
                    <a href="/matches" class="lv-feat-card">
                        <h3>Tournament database</h3>
                        <p>Every major and local, brackets and full VOD index.</p>
                    </a>
                    <a
                        href="https://www.twitch.tv/fgcloops"
                        target="_blank"
                        class="lv-feat-card lv-feat-card--accent"
                    >
                        <h3>24/7 stream ↗</h3>
                        <p>FGC Loops streams matches around the clock on Twitch.</p>
                    </a>
                </div>
            </div>
        </section>

        <!-- ── Footer ── -->
        <footer class="lv-footer">
            <div class="lv-container">
                <p class="lv-footer-free">Free, no ads, no account required to search.</p>
                <div class="lv-footer-links">
                    <a href="https://discord.gg/jKbEWfwqkn" target="_blank">Discord</a>
                    <span class="lv-footer-dot">·</span>
                    <a href="https://github.com/fightersedge" target="_blank">GitHub</a>
                    <span class="lv-footer-dot">·</span>
                    <a href="https://twitter.com/fightersedgefgc" target="_blank">@fightersedgefgc</a>
                </div>
            </div>
        </footer>

    </div>
</template>

<script>
import GeneralSearch from '@/components/common/general-search';
import FeaturedMatchesService from '@/services/featured-matches-service';
import GeneralService from '@/services/general-service';
import MatchesService from '@/services/matches-service';
import ExploreGames from '@/components/explore/explore-games';
import CharacterSlideshow from '@/components/common/character-slideshow';
import CharactersService from '@/services/characters-service';

export default {
    name: 'Landing',

    components: {
        'general-search': GeneralSearch,
        'explore-games': ExploreGames,
        'character-slideshow': CharacterSlideshow,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            counts: null,
            weeklyCount: null,
            featuredMatches: [],
            recentCharacters: null,
        };
    },

    mounted() {
        this.getCounts();
        this.getWeeklyCount();
        this.getFeaturedMatches();
        this.getRecentCharacters();
    },

    methods: {
        getCounts() {
            GeneralService.getCounts()
                .then((response) => {
                    var d = response.data.data;
                    this.counts = {
                        matches: d.matches,
                        players: d.players,
                        games: d.games,
                        tournaments: d.tournaments,
                    };
                    // use weekly field if backend already returns one
                    var weekly = d.weeklyMatches !== undefined ? d.weeklyMatches
                               : d.recentMatches !== undefined ? d.recentMatches
                               : d.matchesThisWeek !== undefined ? d.matchesThisWeek
                               : null;
                    if (weekly != null && this.weeklyCount == null) {
                        this.weeklyCount = weekly;
                    }
                })
                .catch(() => {});
        },

        getWeeklyCount() {
            var since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            GeneralService.getCountsSince(since)
                .then((response) => {
                    var d = response.data.data;
                    if (d && d.matches != null) {
                        this.weeklyCount = d.matches;
                    }
                })
                .catch(() => {});
        },

        getRecentCharacters() {
            CharactersService.fetchRecentCharacters({ limit: 6, sort: 'releaseDate', sortDirection: 'desc' })
                .then((response) => {
                    this.recentCharacters = response.data.characters.map((c) => ({
                        id: c._id,
                        name: c.Name,
                        imageUrl: c.ImageUrl,
                        avatarUrl: c.AvatarUrl,
                    }));
                })
                .catch(() => {});
        },

        getFeaturedMatches() {
            FeaturedMatchesService.fetchFeaturedMatches({ limit: 6 })
                .then((response) => {
                    this.featuredMatches = (response.data.video || []).slice(0, 6).map((m) => ({
                        id: m._id,
                        url: m.VideoUrl,
                        title: null,
                        subtitle: null,
                    }));

                    // enrich each card with player names + game as they load
                    this.featuredMatches.forEach((match, i) => {
                        MatchesService.getMatch(match.id)
                            .then((mr) => {
                                var m = mr.data.match;
                                if (!m) return;
                                var t1 = m.Team1 && m.Team1[0] ? m.Team1[0].Name : null;
                                var t2 = m.Team2 && m.Team2[0] ? m.Team2[0].Name : null;
                                var game = m.Game && m.Game[0] ? m.Game[0].Title : null;
                                this.$set(this.featuredMatches, i, {
                                    ...this.featuredMatches[i],
                                    title: t1 && t2 ? `${t1} vs ${t2}` : null,
                                    subtitle: game || null,
                                });
                            })
                            .catch(() => {});
                    });
                })
                .catch(() => {});
        },
    },
};
</script>

<style>
/* ── Root ── */
.landing-view {
    width: 100%;
    min-height: 100%;
    box-sizing: border-box;
    color: #fff;
    font-family: 'Roboto', sans-serif;
    padding-top: calc(var(--app-top-bar-height, 84px) + var(--app-follows-bar-height, 72px));
}

.landing-view .lv-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 24px;
    box-sizing: border-box;
}

/* ── Hero ── */
.landing-view .lv-hero {
    padding: clamp(60px, 10vw, 120px) 0 clamp(40px, 6vw, 72px);
    text-align: center;
}

.landing-view .lv-hero-h1 {
    font-size: clamp(32px, 5.5vw, 58px);
    font-weight: 800;
    line-height: 1.12;
    color: #fff;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
}

.landing-view .lv-hero-sub {
    font-size: clamp(15px, 2vw, 18px);
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.65;
    margin: 0 auto 36px;
    max-width: 580px;
}

/* Search bar — prominent with glow */
.landing-view .lv-search-wrap {
    max-width: 560px;
    margin: 0 auto 20px;
}

.landing-view .lv-search-wrap .multiselect__tags {
    box-shadow: 0 0 20px 5px rgba(62, 180, 137, 0.30),
                0 0 50px 12px rgba(62, 180, 137, 0.13);
    animation: lv-search-pulse 3s ease-in-out infinite;
    transition: box-shadow 0.2s ease;
}

.landing-view .lv-search-wrap .multiselect__tags:hover {
    box-shadow: 0 0 28px 8px rgba(62, 180, 137, 0.45),
                0 0 65px 18px rgba(62, 180, 137, 0.20);
    animation: none;
}

.landing-view .lv-search-wrap .multiselect--active .multiselect__tags {
    box-shadow: 0 0 35px 10px rgba(62, 180, 137, 0.58),
                0 0 80px 22px rgba(62, 180, 137, 0.24);
    animation: none;
}

@keyframes lv-search-pulse {
    0%, 100% {
        box-shadow: 0 0 20px 5px rgba(62, 180, 137, 0.30),
                    0 0 50px 12px rgba(62, 180, 137, 0.13);
    }
    50% {
        box-shadow: 0 0 30px 9px rgba(62, 180, 137, 0.44),
                    0 0 65px 18px rgba(62, 180, 137, 0.19);
    }
}

.landing-view .lv-search-wrap .general-search .multiselect {
    background: #242832;
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    font-size: 16px;
}

/* Suggestion chips */
.landing-view .lv-suggestions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
}

.landing-view .lv-suggestions-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
}

.landing-view .lv-chip {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.75);
    font-size: 13px;
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    cursor: pointer;
}

.landing-view .lv-chip:hover {
    border-color: #3eb489;
    background: rgba(62, 180, 137, 0.08);
    color: #3eb489;
}

/* ── Demo section ── */
.landing-view .lv-demo-section {
    padding: 0 0 clamp(32px, 5vw, 60px);
}

.landing-view .lv-demo-box {
    width: 100%;
    aspect-ratio: 16 / 7;
    min-height: 180px;
    background: #191b24;
    border: 1.5px dashed rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.35);
    text-align: center;
}

.landing-view .lv-demo-play-icon {
    font-size: 36px;
    opacity: 0.4;
}

.landing-view .lv-demo-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
}

.landing-view .lv-demo-caption {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    margin: 0;
}

/* ── Stats bar ── */
.landing-view .lv-stats-section {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding: 28px 0;
    margin-bottom: clamp(40px, 6vw, 72px);
}

.landing-view .lv-stats-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    flex-wrap: wrap;
}

.landing-view .lv-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 32px;
}

.landing-view .lv-stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
    white-space: nowrap;
}

.landing-view .lv-stat-num {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
}

.landing-view .lv-stat-divider {
    width: 1px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
}

/* ── Section shared ── */
.landing-view .lv-section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
}

.landing-view .lv-section-h2 {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.landing-view .lv-view-all {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
    text-decoration: none;
    transition: color 0.15s;
}

.landing-view .lv-view-all:hover {
    color: #3eb489;
}

/* ── New characters ── */
.landing-view .lv-characters-section {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.landing-view .lv-characters-stage {
    position: relative;
    width: 100%;
    height: 460px;
    border-radius: 14px;
    overflow: hidden;
    background: #191b24;
    border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 680px) {
    .landing-view .lv-characters-stage {
        height: 340px;
    }
}

/* ── Browse by game ── */
.landing-view .lv-games-section {
    margin-bottom: clamp(40px, 6vw, 72px);
}

/* ── Trending ── */
.landing-view .lv-trending-section {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.landing-view .lv-trending-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

/* accent the "added this week" number in green */
.landing-view .lv-stat-num--accent {
    color: #3eb489;
}

.landing-view .lv-match-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: 10px;
    overflow: hidden;
    background: #1e2130;
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: border-color 0.2s, transform 0.2s;
}

.landing-view .lv-match-card:hover {
    border-color: rgba(62, 180, 137, 0.35);
    transform: translateY(-2px);
}

.landing-view .lv-match-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #14161d;
    overflow: hidden;
}

.landing-view .lv-match-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.landing-view .lv-match-card:hover .lv-match-thumb img {
    transform: scale(1.04);
}

.landing-view .lv-match-play-btn {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.2s;
}

.landing-view .lv-match-card:hover .lv-match-play-btn {
    opacity: 1;
}

.landing-view .lv-match-play-btn i {
    font-size: 28px;
    color: #fff;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));
}

.landing-view .lv-match-meta {
    padding: 12px 14px 14px;
}

.landing-view .lv-match-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.landing-view .lv-match-event {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
}

/* skeleton */
.landing-view .lv-match-card--skeleton {
    pointer-events: none;
}

.landing-view .lv-sk-box {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: linear-gradient(90deg, #1e2130 25%, #262b3d 50%, #1e2130 75%);
    background-size: 200% 100%;
    animation: lv-shimmer 1.4s infinite;
}

.landing-view .lv-sk-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #1e2130 25%, #262b3d 50%, #1e2130 75%);
    background-size: 200% 100%;
    animation: lv-shimmer 1.4s infinite;
}

@keyframes lv-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ── Features grid ── */
.landing-view .lv-features-section {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.landing-view .lv-features-section .lv-section-h2 {
    margin-bottom: 20px;
}

.landing-view .lv-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.landing-view .lv-feat-card {
    display: block;
    padding: 20px 22px;
    background: #1a1c24;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s, background 0.2s;
}

.landing-view .lv-feat-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: #1e2130;
}

.landing-view .lv-feat-card h3 {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
}

.landing-view .lv-feat-card p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.55;
    margin: 0;
}

/* accent card — the 24/7 stream one */
.landing-view .lv-feat-card--accent {
    background: #1a2540;
    border-color: rgba(68, 71, 226, 0.4);
}

.landing-view .lv-feat-card--accent:hover {
    background: #1e2a4a;
    border-color: rgba(68, 71, 226, 0.65);
}

.landing-view .lv-feat-card--accent h3 {
    color: #7b8fff;
}

.landing-view .lv-feat-card--accent p {
    color: rgba(130, 145, 255, 0.75);
}

/* ── Footer ── */
.landing-view .lv-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding: 28px 0 40px;
    text-align: center;
}

.landing-view .lv-footer-free {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0 0 10px;
}

.landing-view .lv-footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.landing-view .lv-footer-links a {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
    text-decoration: none;
    transition: color 0.15s;
}

.landing-view .lv-footer-links a:hover {
    color: #3eb489;
}

.landing-view .lv-footer-dot {
    color: rgba(255, 255, 255, 0.2);
    font-size: 13px;
}

/* ── Responsive ── */
@media (max-width: 820px) {
    .landing-view .lv-trending-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 680px) {
    .landing-view .lv-trending-grid {
        grid-template-columns: 1fr;
    }

    .landing-view .lv-features-grid {
        grid-template-columns: 1fr 1fr;
    }

    .landing-view .lv-stats-row {
        gap: 4px;
    }

    .landing-view .lv-stat {
        padding: 8px 16px;
    }

    .landing-view .lv-stat-divider {
        display: none;
    }
}

@media (max-width: 420px) {
    .landing-view .lv-features-grid {
        grid-template-columns: 1fr;
    }
}
</style>
