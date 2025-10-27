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
                            <p class="number">{{ counts.matches | commaDelimited }}</p>
                            <p class="label">Matches Indexed</p>
                        </div>
                        <div class="stat-card">
                            <p class="number">{{ counts.players | commaDelimited }}</p>
                            <p class="label">Players</p>
                        </div>
                        <div class="stat-card">
                            <p class="number">{{ counts.tournaments | commaDelimited }}</p>
                            <p class="label">Tournaments</p>
                        </div>
                        <div class="stat-card">
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
                <div class="trending-matches">
                    <h2>🔥 Trending Matches</h2>
                    <div class="videos">
                        <youtube-media
                            v-for="match in featuredMatches"
                            :key="match.id"
                            :video-id="match.url"
                            :player-width="420"
                            :player-height="240"
                            :mute="true"
                            :playsinline="1"
                        />
                    </div>
                </div>
                <div class="featured-games">
                    <h2>🎮 Featured Games</h2>
                    <div class="videos">
                        <explore-games />
                    </div>
                </div>
                <div class="recent-tournaments">
                    <completed-tournaments />
                </div>
                <div class="latest-update">
                    <explore-updates />
                </div>

                <div class="featured-videos">
                    <h2>🎥 Featured Videos</h2>
                    <div class="videos">
                        <youtube-media
                            v-for="video in featuredVideos"
                            :key="video.id"
                            :video-id="video.url"
                            ref="youtubeRef"
                            :player-width="420"
                            :player-height="240"
                            :mute="true"
                            :playsinline="1"
                        />
                    </div>
                </div>
                <div class="cta">
                    <h2>Join the fight!</h2>
                    <button class="sign-up">Sign Up</button><button class="login">Login</button>
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
    width: 150px;
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
    max-width: 1300px;
    margin: 0 auto;
}

.home-view .heading {
    width: 60%;
}

.home-view .recent-searches {
    margin-top: 10px;
}

.home-view .recent-searches a {
    color: #fff;
    margin-left: 8px;
}

.home-view h1 {
    color: #fff;
    opacity: 0.8;
    font-size: 80px;
    font-family: 'Roboto';
    font-weight: 800;
    line-height: 1em;
    margin-bottom: 24px;
}

.home-view .hero .description {
    color: #fff;
    opacity: 0.8;
    font-family: 'Roboto';
    font-size: 18px;
    max-width: 600px;
    margin-bottom: 40px;
    line-height: 1.6em;
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
    background: #191b2490;
    border-radius: 15px;
    padding: 16px;
    max-width: 190px;
    height: 85px;
    width: 100%;
    color: #ffffff90;
    border: 1px solid #ffffff30;
}

.home-view .stat-card .number {
    font-size: 25px;
    font-weight: 800;
}

.home-view .stat-card .label {
    font-size: 14px;
    font-weight: 300;
    text-transform: uppercase;
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

.home-view .featured-videos {
    z-index: 10px;
    position: relative;
    margin-top: 80px;
}

.home-view .featured-videos .videos {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.home-view .trending-matches .videos {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
}

.home-view .recent-tournaments,
.home-view .latest-update {
    margin-top: 80px;
}

.home-view .tournaments {
    display: flex;
    gap: 11px;
    flex-wrap: wrap;
    margin-bottom: 80px;
}

.home-view .cta {
    text-align: center;
    margin-top: 120px;
}

.home-view .featured-games {
    margin-top: 80px;
}

.home-view .cta button.sign-up {
    background: #3eb489;
    margin-right: 24px;
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
</style>
