<!-- @format -->
<template>
    <div class="home-view">
        <div class="container">
            <div class="hero">
                <div class="heading">
                    <img
                        class="fe-logo"
                        src="https://res.cloudinary.com/shuzchef/image/upload/v1759458070/cjee1o9a0mtpnmcudhfl.png"
                    />
                    <h1>Find Any Match, Any Player, Any Character</h1>
                    <p class="description">
                        Fighters Edge helps you find replays from tournaments and streams, study
                        matchups, follow your favorite games and players, and level up.
                    </p>
                    <div class="search-container">
                        <general-search />
                        <p class="recent-searches">
                            Popular:
                            <a href="https://fighters-edge.com/Player/6048487f4fd4ab5b68a083f0"
                                >Punk</a
                            >
                            <a href="https://fighters-edge.com/Character/68ef0b1638aafd0022ea947b"
                                >C.Viper</a
                            >
                            <a href="https://fighters-edge.com/Game/68cba126f261500022897969"
                                >2XKO</a
                            >
                        </p>
                    </div>
                    <div class="stats" v-if="counts">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <p class="number">{{ counts.matches | commaDelimited }}</p>
                            <p class="label">Matches Indexed</p>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <p class="number">{{ counts.players | commaDelimited }}</p>
                            <p class="label">Players</p>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <p class="number">{{ counts.tournaments | commaDelimited }}</p>
                            <p class="label">Tournaments</p>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-gamepad"></i>
                            </div>
                            <p class="number">{{ counts.games | commaDelimited }}</p>
                            <p class="label">Games</p>
                        </div>
                    </div>
                </div>

                <div class="featured-character">
                    <character-slideshow
                        :characters="recentCharacters"
                        :auto-play="true"
                        :interval="4000"
                        :isMobile="isMobile"
                    />
                </div>
            </div>

            <div class="home-content">
                <!-- Browse by game -->
                <div class="featured-games home-section">
                    <div class="home-section-header">
                        <h2 class="home-section-h2">Browse by game</h2>
                        <a href="/games" class="home-view-all">All games →</a>
                    </div>
                    <explore-games />
                </div>

                <!-- Trending this week -->
                <div class="trending-matches home-section">
                    <div class="home-section-header">
                        <h2 class="home-section-h2">Trending this week</h2>
                        <a href="/matches" class="home-view-all">View all →</a>
                    </div>
                    <div class="home-trending-grid">
                        <a
                            v-for="match in featuredMatches"
                            :key="match.id"
                            :href="`/match/${match.id}`"
                            class="home-match-card"
                        >
                            <div class="home-match-thumb">
                                <img
                                    :src="`https://img.youtube.com/vi/${match.url}/hqdefault.jpg`"
                                    :alt="match.title || 'Featured match'"
                                    loading="lazy"
                                />
                                <div class="home-match-play-btn">
                                    <i class="fas fa-play"></i>
                                </div>
                            </div>
                            <div class="home-match-meta">
                                <p class="home-match-title">{{ match.title || 'Featured match' }}</p>
                                <p class="home-match-event">{{ match.subtitle || 'Fighters Edge' }}</p>
                            </div>
                        </a>
                        <template v-if="!featuredMatches || featuredMatches.length === 0">
                            <div v-for="i in 6" :key="'sk' + i" class="home-match-card home-match-card--skeleton">
                                <div class="home-match-thumb home-sk-box"></div>
                                <div class="home-match-meta">
                                    <div class="home-sk-line" style="width: 68%"></div>
                                    <div class="home-sk-line" style="width: 44%; margin-top: 7px"></div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Recent Tournaments -->
                <div class="recent-tournaments section-card">
                    <completed-tournaments />
                </div>

                <!-- Combined CTA + Community -->
                <div class="cta-community section-card">
                    <div class="cta-community-inner">
                        <div class="cta-col">
                            <div class="cta-icon">
                                <i class="fas fa-fist-raised"></i>
                            </div>
                            <h2>Join the Fight!</h2>
                            <p class="cta-description">
                                Create an account to follow players, save favorite matches, and build
                                your collection
                            </p>
                            <div class="cta-buttons">
                                <button class="sign-up-btn" @click="openRegisterModal()">
                                    <i class="fas fa-user-plus"></i> Sign Up
                                </button>
                                <button class="login-btn" @click="openLoginModal()">
                                    <i class="fas fa-sign-in-alt"></i> Login
                                </button>
                            </div>
                        </div>
                        <div class="cta-community-divider"></div>
                        <div class="community-col">
                            <div class="section-header">
                                <i class="fas fa-users section-icon"></i>
                                <h2>Join Our Community</h2>
                            </div>
                            <p class="community-description">
                                Connect with the FGC, share your matches, get tips, and stay updated on the latest tournament news
                            </p>
                            <div class="community-links">
                                <a href="https://discord.gg/jKbEWfwqkn" target="_blank" class="community-link discord-link">
                                    <font-awesome-icon :icon="['fab', 'discord']" />
                                    <span>Join Discord Server</span>
                                </a>
                                <div class="social-icons">
                                    <a href="https://www.youtube.com/channel/UCEQbjKp4CDP1JzrzAcQEh8Q" target="_blank" class="social-icon" title="YouTube">
                                        <font-awesome-icon :icon="['fab', 'youtube']" />
                                    </a>
                                    <a href="https://bsky.app/profile/fighters-edge.bsky.social" target="_blank" class="social-icon" title="Bluesky">
                                        <bluesky-icon width="24" height="24" />
                                    </a>
                                    <a href="https://twitter.com/fightersedgefgc" target="_blank" class="social-icon" title="Twitter">
                                        <font-awesome-icon :icon="['fab', 'twitter']" />
                                    </a>
                                    <a href="https://www.tiktok.com/@fighters_edge?lang=en" target="_blank" class="social-icon" title="TikTok">
                                        <font-awesome-icon :icon="['fab', 'tiktok']" />
                                    </a>
                                    <a href="https://www.instagram.com/fighters_edge_fgc/" target="_blank" class="social-icon" title="Instagram">
                                        <font-awesome-icon :icon="['fab', 'instagram']" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GeneralSearch from '@/components/common/general-search';
import CompletedTournaments from '@/components/explore/completed-tournaments.vue';
import ExploreUpdates from '@/components/explore/explore-updates.vue';
import CharacterSlideshow from '@/components/common/character-slideshow.vue';
import CharactersService from '@/services/characters-service';
import FeaturedMatchesService from '@/services/featured-matches-service';
import MatchesService from '@/services/matches-service';
import GeneralService from '@/services/general-service';
import ExploreGames from '@/components/explore/explore-games.vue';
import BlueskyIcon from '@/components/svg/bluesky-icon';
export default {
    name: 'Home',

    components: {
        'general-search': GeneralSearch,
        'completed-tournaments': CompletedTournaments,
        'explore-updates': ExploreUpdates,
        'character-slideshow': CharacterSlideshow,
        'explore-games': ExploreGames,
        'bluesky-icon': BlueskyIcon,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    computed: {
        isMobile() {
            return this.$attrs.isMobile;
        },
    },

    data() {
        return {
            notes: null,
            recentCharacters: null,
            featuredMatches: [],
            weeklyCount: null,
            weeklyCountInterval: null,
            counts: {
                players: null,
                characters: null,
                tournaments: null,
                games: null,
            },
        };
    },

    watch: {},

    mounted() {
        this.getCounts();
        this.getRecentCharacters();
        this.getFeaturedMatches();
        this.getWeeklyCount();
        this.weeklyCountInterval = setInterval(this.getWeeklyCount, 60000);
    },

    beforeDestroy() {
        clearInterval(this.weeklyCountInterval);
    },

    methods: {
        getCounts() {
            GeneralService.getCounts().then((response) => {
                var countsRes = response.data.data;
                this.counts = {
                    players: countsRes.players,
                    characters: countsRes.characters,
                    tournaments: countsRes.tournaments,
                    games: countsRes.games,
                    matches: countsRes.matches,
                };
                var weekly = countsRes.weeklyMatches !== undefined ? countsRes.weeklyMatches
                           : countsRes.recentMatches !== undefined ? countsRes.recentMatches
                           : countsRes.matchesThisWeek !== undefined ? countsRes.matchesThisWeek
                           : null;
                if (weekly != null && this.weeklyCount == null) {
                    this.weeklyCount = weekly;
                }
            });
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
            var queryParameter = {
                limit: 5,
                sort: 'releaseDate',
                sortDirection: 'desc',
            };

            CharactersService.fetchRecentCharacters(queryParameter).then((response) => {
                this.recentCharacters = this.mapCharacters(response.data.characters);
            });
        },

        mapCharacters(characters) {
            return characters.map((character) => {
                return {
                    id: character._id,
                    name: character.Name,
                    imageUrl: character.ImageUrl,
                    avatarUrl: character.AvatarUrl,
                };
            });
        },

        getFeaturedMatches() {
            FeaturedMatchesService.fetchFeaturedMatches({ limit: 6 }).then((response) => {
                this.featuredMatches = (response.data.video || []).slice(0, 6).map((m) => ({
                    id: m._id,
                    url: m.VideoUrl,
                    title: null,
                    subtitle: null,
                }));

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
            });
        },

        openLoginModal() {
            eventbus.$emit('open:widget', { name: 'login' });
        },

        openRegisterModal() {
            eventbus.$emit('open:widget', { name: 'register' });
        },
    },
};
</script>

<style>
/* Clear top bar + fixed follows (see App.vue / follows.vue) */
.home-view {
    padding-top: calc(
        var(--app-top-bar-height, 84px) + var(--app-follows-bar-height, 72px) + clamp(24px, 4vw, 48px)
    );
    width: 100%;
    min-height: 100%;
    box-sizing: border-box;
}

.home-view .fe-logo {
    width: 180px;
    margin-bottom: 24px;
    filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
}

.home-view .fe-logo:hover {
    transform: scale(1.05);
}

.home-view > .container {
    max-width: 1600px;
    padding: clamp(16px, 3vw, 50px);
    margin: 0 auto;
    box-sizing: border-box;
}

.home-view .content {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    padding: 10vh 50px 50px;
}

.home-view .home-content {
    max-width: 1400px;
    margin: clamp(48px, 8vw, 96px) auto 0;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
}

.home-view .heading {
    width: 60%;
}

.home-view .search-container .multiselect__tags {
    box-shadow: 0 0 18px 4px rgba(62, 180, 137, 0.28),
                0 0 40px 8px rgba(62, 180, 137, 0.12);
    animation: search-glow-pulse 3s ease-in-out infinite;
    transition: box-shadow 0.2s ease;
}

.home-view .search-container .multiselect__tags:hover {
    box-shadow: 0 0 24px 6px rgba(62, 180, 137, 0.42),
                0 0 60px 14px rgba(62, 180, 137, 0.18);
    animation: none;
}

.home-view .search-container .multiselect--active .multiselect__tags {
    box-shadow: 0 0 30px 8px rgba(62, 180, 137, 0.55),
                0 0 70px 18px rgba(62, 180, 137, 0.22);
    animation: none;
}

@keyframes search-glow-pulse {
    0%, 100% {
        box-shadow: 0 0 18px 4px rgba(62, 180, 137, 0.28),
                    0 0 40px 8px rgba(62, 180, 137, 0.12);
    }
    50% {
        box-shadow: 0 0 26px 7px rgba(62, 180, 137, 0.40),
                    0 0 55px 14px rgba(62, 180, 137, 0.16);
    }
}

.home-view .recent-searches {
    margin-top: 10px;
}

.home-view .recent-searches a {
    color: #3eb489;
    margin-left: 8px;
    text-decoration: none;
    transition: color 0.2s ease;
    font-weight: 500;
}

.home-view .recent-searches a:hover {
    color: #2d8a6a;
    text-decoration: underline;
}

.home-view h1 {
    color: #fff;
    font-size: 72px;
    font-family: 'Roboto';
    font-weight: 800;
    line-height: 1.1em;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.home-view .hero .description {
    color: #ffffff90;
    font-family: 'Roboto';
    font-size: 18px;
    max-width: 600px;
    margin-bottom: 40px;
    line-height: 1.7em;
    font-weight: 400;
}

.home-view .hero {
    display: flex;
    align-items: center;
    height: 80vh;
    z-index: 1;
    margin-bottom: 80px;
}

.home-view .recent-searches {
    color: #fff;
    opacity: 0.8;
    font-family: 'Roboto';
    font-size: 14px;
}

.home-view .stats {
    display: flex;
    gap: 16px;
    margin-top: 40px;
    flex-wrap: wrap;
}

.home-view .stat-card {
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 16px;
    padding: 20px;
    max-width: 190px;
    min-height: 100px;
    width: 100%;
    color: #ffffff90;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
}

.home-view .stat-icon {
    font-size: 28px;
    color: #3eb489;
    margin-bottom: 0;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.home-view .stat-icon i {
    display: inline-block;
}

.home-view .stat-card:hover .stat-icon {
    transform: scale(1.1);
    color: #2d8a6a;
}

.home-view .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.2);
    border-color: rgba(62, 180, 137, 0.3);
}

.home-view .stat-card .number {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.home-view .stat-card .label {
    font-size: 13px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #ffffff90;
}

.home-view .featured-character {
    position: absolute;
    right: 0;
    z-index: 0;
    opacity: 0.7;
    max-width: 45vw;
    width: 100%;
    height: 100%;
    max-height: 105vh;
}

.home-view .featured-character img {
    width: 100%;
}

.home-view .video-placeholder {
    width: 420px;
    height: 275px;
    background: #fff;
}

.home-view .section-card {
    background: linear-gradient(135deg, rgba(25, 27, 36, 0.6) 0%, rgba(36, 40, 50, 0.8) 100%);
    border-radius: 20px;
    padding: 40px;
    margin-top: 60px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.home-view .section-card:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
}

.home-view .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(62, 180, 137, 0.2);
}

.home-view .section-icon {
    font-size: 24px;
    color: #3eb489;
}

.home-view .section-card h2 {
    color: #fff;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

.home-view .featured-videos {
    z-index: 10px;
    position: relative;
}

.home-view .featured-videos .videos--grid,
.home-view .trending-matches .videos--grid,
.home-view .latest-update .updates--grid,
.home-view .featured-games .games--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
    gap: clamp(12px, 2.5vw, 20px);
    width: 100%;
    min-width: 0;
    align-items: start;
}

.home-view .home-video-embed {
    position: relative;
    width: 100%;
    max-width: 100%;
    padding-top: 56.25%;
    min-width: 0;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
}

/* ensure vue-youtube root fills the 16:9 box */
.home-view .home-video-embed > * {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
}

/* vue-youtube-embed may render wrapper div; target nested iframe */
.home-view .home-video-embed iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    max-width: 100%;
    border: 0;
    border-radius: 12px;
}

.home-view .video-card {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    background: rgba(0, 0, 0, 0.3);
}

.home-view .video-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(62, 180, 137, 0.3);
}

@media (max-width: 600px) {
    .home-view .featured-videos .videos--grid,
    .home-view .trending-matches .videos--grid,
    .home-view .latest-update .updates--grid,
    .home-view .featured-games .games--grid {
        grid-template-columns: 1fr;
        gap: 14px;
    }
}

.home-view .trending-matches {
    position: relative;
}

.home-view .recent-tournaments,
.home-view .latest-update {
    position: relative;
}

/* Tournament grid layout lives in completed-tournaments (tournaments--grid) */
.home-view .recent-tournaments .tournaments {
    margin-bottom: 0;
}

.home-view .community-section {
    background: #242832;
    text-align: center;
}

.home-view .community-section .community-description {
    color: #b0b3c4;
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto 30px;
}

.home-view .community-links {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;
}

.home-view .discord-link {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: #5865F2;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
}

.home-view .discord-link:hover {
    background: #4752C4;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(88, 101, 242, 0.4);
}

.home-view .discord-link svg {
    font-size: 1.5rem;
}

.home-view .social-icons {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.home-view .social-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1c1c24;
    color: #fff;
    border-radius: 50%;
    font-size: 1.3rem;
    transition: all 0.3s ease;
    text-decoration: none;
    border: 2px solid #3eb489;
}

.home-view .social-icon:hover {
    background: #3eb489;
    transform: scale(1.1);
}

.home-view .cta {
    text-align: center;
    background: linear-gradient(135deg, rgba(62, 180, 137, 0.1) 0%, rgba(45, 138, 106, 0.1) 100%);
    border: 2px solid rgba(62, 180, 137, 0.3);
}

.home-view .cta-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.home-view .cta-icon {
    font-size: 64px;
    color: #3eb489;
    margin-bottom: 8px;
    animation: pulse 2s ease-in-out infinite;
}

.home-view .cta h2 {
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    margin: 0;
}

.home-view .cta-description {
    color: #ffffff90;
    font-size: 16px;
    max-width: 500px;
    line-height: 1.6;
    margin: 0;
}

.home-view .cta-buttons {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
}

.home-view .cta .sign-up-btn,
.home-view .cta .login-btn {
    padding: 14px 32px;
    border-radius: 24px;
    font-weight: 600;
    font-size: 16px;
    text-transform: none;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.home-view .cta .sign-up-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3);
}

.home-view .cta .sign-up-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.home-view .cta .login-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.home-view .cta .login-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.home-view .featured-games {
    position: relative;
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
}

.mobile .home-view .stat-card {
    max-width: 100%;
    width: 48%;
}

.mobile .home-view .stats {
    margin-bottom: 40px;
}

/* Grid layouts: featured / trending / updates use templates + home.css */
.mobile .home-view .latest-update .updates--grid,
.mobile .home-view .featured-videos .videos--grid,
.mobile .home-view .trending-matches .videos--grid,
.mobile .home-view .featured-games .games--grid {
    grid-template-columns: 1fr;
    gap: 14px;
}

.mobile .home-view h1 {
    font-size: 40px;
}

.mobile .home-view .hero {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    height: initial;
}

.mobile .home-view .hero .heading {
    width: 100%;
    max-width: 100%;
}

.mobile .home-view .hero .featured-character {
    position: relative;
    max-width: 100%;
    width: 100%;
}

.mobile .home-view .stat-card {
    width: 100%;
    text-align: center;
}

.mobile .home-view .recent-tournaments .tournaments--grid {
    grid-template-columns: 1fr;
    gap: 14px;
}

.mobile .home-view h2 {
    font-size: 28px;
}

.mobile .home-view .fe-logo {
    margin-bottom: 30px;
}

.mobile .home-view > .container {
    padding: 0 20px;
}


.mobile .home-view .cta-buttons {
    flex-direction: column;
    width: 100%;
}

.mobile .home-view .cta .sign-up-btn,
.mobile .home-view .cta .login-btn {
    width: 100%;
    justify-content: center;
}

.mobile .home-view .section-card {
    padding: 25px 20px;
}

.mobile .home-view .section-header {
    flex-wrap: wrap;
}

.mobile .home-view .video-card {
    width: 100%;
    max-width: 100%;
}

.mobile .home-view .featured-videos .videos--grid,
.mobile .home-view .trending-matches .videos--grid {
    grid-template-columns: 1fr;
    gap: 16px;
}

.mobile .home-view .discord-link {
    font-size: 1rem;
    padding: 14px 24px;
}

.mobile .home-view .social-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
}

.mobile .home-view .cta h2 {
    font-size: 28px;
}

.mobile .home-view .cta-icon {
    font-size: 48px;
}

/* ── Stats strip ── */
.home-view .home-stats-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding: 28px 0;
    margin-bottom: 0;
}

.home-view .home-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 36px;
}

.home-view .home-stat--featured {
    position: relative;
}

.home-view .home-stat-num {
    font-size: 30px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1;
}

.home-view .home-stat-num--accent {
    font-size: 34px;
    background: linear-gradient(135deg, #3eb489 0%, #56d4a8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.home-view .home-stat-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 500;
    white-space: nowrap;
}

.home-view .home-stat-live-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3eb489;
    box-shadow: 0 0 6px #3eb489;
    animation: home-live-pulse 2s ease-in-out infinite;
    flex-shrink: 0;
}

@keyframes home-live-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px #3eb489; }
    50%       { opacity: 0.5; box-shadow: 0 0 12px #3eb489; }
}

.home-view .home-stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
}

@media (max-width: 680px) {
    .home-view .home-stat-divider {
        display: none;
    }

    .home-view .home-stat {
        padding: 8px 20px;
    }
}

/* ── Restyled flat sections (games + trending) ── */
.home-view .home-section {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.home-view .home-section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
}

.home-view .home-section-h2 {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.home-view .home-view-all {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
    text-decoration: none;
    transition: color 0.15s;
}

.home-view .home-view-all:hover {
    color: #3eb489;
}

/* ── Trending thumbnail grid ── */
.home-view .home-trending-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.home-view .home-match-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: 10px;
    overflow: hidden;
    background: #1e2130;
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: border-color 0.2s, transform 0.2s;
}

.home-view .home-match-card:hover {
    border-color: rgba(62, 180, 137, 0.35);
    transform: translateY(-2px);
}

.home-view .home-match-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #14161d;
    overflow: hidden;
}

.home-view .home-match-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.home-view .home-match-card:hover .home-match-thumb img {
    transform: scale(1.04);
}

.home-view .home-match-play-btn {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.2s;
}

.home-view .home-match-card:hover .home-match-play-btn {
    opacity: 1;
}

.home-view .home-match-play-btn i {
    font-size: 28px;
    color: #fff;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
}

.home-view .home-match-meta {
    padding: 12px 14px 14px;
}

.home-view .home-match-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.home-view .home-match-event {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
}

.home-view .home-match-card--skeleton {
    pointer-events: none;
}

.home-view .home-sk-box {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: linear-gradient(90deg, #1e2130 25%, #262b3d 50%, #1e2130 75%);
    background-size: 200% 100%;
    animation: home-shimmer 1.4s infinite;
}

.home-view .home-sk-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #1e2130 25%, #262b3d 50%, #1e2130 75%);
    background-size: 200% 100%;
    animation: home-shimmer 1.4s infinite;
}

@keyframes home-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ── Combined CTA + Community ── */
.home-view .cta-community {
    background: linear-gradient(135deg, rgba(25, 27, 36, 0.6) 0%, rgba(36, 40, 50, 0.8) 100%);
}

.home-view .cta-community-inner {
    display: flex;
    gap: 48px;
    align-items: flex-start;
}

.home-view .cta-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
}

.home-view .community-col {
    flex: 1;
}

.home-view .community-col .community-description {
    color: rgba(255, 255, 255, 0.75);
    font-size: 15px;
    line-height: 1.65;
    margin: 0 0 24px;
}

.home-view .cta-community-divider {
    width: 1px;
    background: rgba(255, 255, 255, 0.1);
    align-self: stretch;
    flex-shrink: 0;
}

@media (max-width: 820px) {
    .home-view .home-trending-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 680px) {
    .home-view .home-trending-grid {
        grid-template-columns: 1fr;
    }

    .home-view .cta-community-inner {
        flex-direction: column;
    }

    .home-view .cta-community-divider {
        width: 100%;
        height: 1px;
        align-self: auto;
    }
}
</style>
