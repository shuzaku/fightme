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
                        Fighters Edge indexes replay s from tournaments and streams so you can study
                        matchups, follow your favorite players, and level up your game.
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
                <div class="featured-games section-card">
                    <div class="section-header">
                        <i class="fas fa-gamepad section-icon"></i>
                        <h2>Featured Games</h2>
                    </div>
                    <div class="videos">
                        <explore-games />
                    </div>
                </div>
                <div class="trending-matches section-card">
                    <div class="section-header">
                        <i class="fas fa-fire section-icon"></i>
                        <h2>Trending Matches</h2>
                    </div>
                    <div class="videos">
                        <div v-for="match in featuredMatches" :key="match.id" class="video-card">
                            <youtube-media
                                :video-id="match.url"
                                :player-width="420"
                                :player-height="240"
                                :mute="true"
                                :playsinline="1"
                            />
                        </div>
                    </div>
                </div>
                <div class="recent-tournaments section-card">
                    <completed-tournaments />
                </div>
                <div class="latest-update section-card">
                    <explore-updates />
                </div>

                <div class="featured-videos section-card">
                    <div class="section-header">
                        <i class="fas fa-video section-icon"></i>
                        <h2>Featured Videos</h2>
                    </div>
                    <div class="videos">
                        <div v-for="video in featuredVideos" :key="video.id" class="video-card">
                            <youtube-media
                                :video-id="video.url"
                                ref="youtubeRef"
                                :player-width="420"
                                :player-height="240"
                                :mute="true"
                                :playsinline="1"
                            />
                        </div>
                    </div>
                </div>
                <div class="cta section-card">
                    <div class="cta-content">
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
import FeaturedVideosService from '@/services/featured-videos-service';
import GeneralService from '@/services/general-service';
import ExploreGames from '@/components/explore/explore-games.vue';
export default {
    name: 'Home',

    components: {
        'general-search': GeneralSearch,
        'completed-tournaments': CompletedTournaments,
        'explore-updates': ExploreUpdates,
        'character-slideshow': CharacterSlideshow,
        'explore-games': ExploreGames,
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
            featuredMatches: null,
            featuredVideos: null,
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
        this.getFeaturedVideos();
    },

    beforeDestroy() {},

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
            });
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
            FeaturedMatchesService.fetchFeaturedMatches().then((response) => {
                this.featuredMatches = this.mapMatches(response.data.video);
            });
        },

        mapMatches(matches) {
            return matches.map((match) => {
                return {
                    id: match._id,
                    url: match.VideoUrl,
                };
            });
        },

        getFeaturedVideos() {
            var queryParameter = {
                limit: 3,
                sort: '_id',
                sortDirection: 'desc',
                Type: 'General',
            };

            FeaturedVideosService.fetchFeaturedVideos(queryParameter).then((response) => {
                this.featuredVideos = this.mapVideos(response.data.video);
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
.home-view {
    padding-top: 160px;
    width: 100%;
    height: 100%;
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
    padding: 50px;
    margin: 0 auto;
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
    margin: 0 auto;
}

.home-view .heading {
    width: 60%;
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

.home-view .featured-videos .videos,
.home-view .trending-matches .videos {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.home-view .video-card {
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

.home-view .trending-matches {
    position: relative;
}

.home-view .recent-tournaments,
.home-view .latest-update {
    position: relative;
}

.home-view .tournaments {
    display: flex;
    gap: 11px;
    flex-wrap: wrap;
    margin-bottom: 0;
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

.mobile .home-view .tournaments,
.mobile .home-view .updates,
.mobile .home-view .videos {
    justify-content: center;
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

.mobile .home-view .tournaments {
    justify-content: flex-start;
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

.mobile .home-view {
    padding-top: 160px;
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

.mobile .home-view .cta h2 {
    font-size: 28px;
}

.mobile .home-view .cta-icon {
    font-size: 48px;
}
</style>
