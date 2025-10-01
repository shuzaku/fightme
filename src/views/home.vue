<!-- @format -->
<template>
    <div class="home-view">
        <div class="container">
            <div class="hero">
                <div class="heading">
                    <img
                        class="logo"
                        src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                    />
                    <h1>Find Any Match, Any Player, Any Character</h1>
                    <p class="description">
                        Fighters Edge indexes replay s from tournaments and streams so you can study
                        matchups, follow your favorite players, and level up your game.
                    </p>
                    <div class="search-container">
                        <general-search />
                        <p class="recent-searches">
                            Recent: <a href="">Tokido</a> <a href="">Ken vs JP</a>
                            <a href="">GGST Sol</a>
                        </p>
                    </div>
                    <div class="stats">
                        <div class="stat-card">
                            <p class="number">1,240</p>
                            <p class="label">Matches Indexed</p>
                        </div>
                        <div class="stat-card">
                            <p class="number">320</p>
                            <p class="label">Players</p>
                        </div>
                        <div class="stat-card">
                            <p class="number">12</p>
                            <p class="label">Tournaments</p>
                        </div>
                        <div class="stat-card">
                            <p class="number">8</p>
                            <p class="label">Games</p>
                        </div>
                    </div>
                </div>

                <div class="featured-character">
                    <img
                        src="https://res.cloudinary.com/shuzchef/image/upload/v1758173083/Characters/2XKO/jinx.png"
                    />
                </div>
            </div>
            <div class="trending-matches">
                <h2>🔥 Trending Matches</h2>
                <div class="videos">
                    <div class="video-placeholder"></div>
                    <div class="video-placeholder"></div>
                    <div class="video-placeholder"></div>
                    <div class="video-placeholder"></div>
                    <div class="video-placeholder"></div>
                    <div class="video-placeholder"></div>
                </div>
            </div>
            <div class="recent-tournaments">
                <h2>🏆 Recent Tournaments</h2>
                <div class="tournaments">
                    <div class="tournament-placeholder">Tournament 1</div>
                    <div class="tournament-placeholder">Tournament 2</div>
                    <div class="tournament-placeholder">Tournament 3</div>
                    <div class="tournament-placeholder">Tournament 4</div>
                    <div class="tournament-placeholder">Tournament 5</div>
                </div>
            </div>
            <div class="latest-update">
                <h2>📰 Latest Update</h2>
                <div class="updates">
                    <div class="update">Update 1</div>
                    <div class="update">Update 2</div>
                    <div class="update">Update 3</div>
                    <div class="update">Update 4</div>
                    <div class="update">Update 5</div>
                </div>
            </div>
            <div class="cta">
                <h2>Join the fight!</h2>
                <button class="sign-up">Sign Up</button><button class="login">Login</button>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GeneralSearch from '@/components/common/general-search';

export default {
    name: 'Home',

    components: {
        'general-search': GeneralSearch,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            notes: null,
        };
    },

    watch: {},

    mounted() {},

    beforeDestroy() {},

    methods: {},
};
</script>

<style>
.home-view {
    padding-top: 40px;
    width: 100%;
    height: 100%;
}

.home-view .logo {
    width: 150px;
}

.home-view .content {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    padding: 10vh 50px 50px;
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
    top: -10vh;
    right: 0;
    z-index: 0;
    opacity: 0.7;
}

.home-view .featured-character img {
    width: 100%;
}

.home-view .video-placeholder {
    width: 420px;
    height: 275px;
    background: #fff;
}

.home-view .trending-matches {
    z-index: 10px;
    position: relative;
    margin-bottom: 40px;
}

.home-view .trending-matches .videos {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.home-view .tournaments {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 40px;
}

.home-view .tournament-placeholder {
    width: 253px;
    height: 60px;
    background: #191b2490;
    border-radius: 15px;
    padding: 16px;
    color: #ffffff;
    border: 1px solid #ffffff30;
    display: flex;
    align-items: center;
    justify-content: center;
}

.home-view .updates {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 80px;
}

.home-view .update {
    width: 420px;
    height: 150px;
    background: #191b2490;
    border-radius: 15px;
    padding: 16px;
    color: #ffffff;
    border: 1px solid #ffffff30;
    display: flex;
    align-items: center;
    justify-content: center;
}

.home-view .cta {
    text-align: center;
}

.home-view .cta button.sign-up {
    background: #3eb489;
    margin-right: 24px;
}
</style>
