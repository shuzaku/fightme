<!-- @format -->
<template>
    <div ref="videoViewRef" class="game-view">
        <loading v-if="loading"></loading>
        <div v-else class="character-container">
            <game-nav
                v-if="!loading"
                :gameId="gameId"
                :account="account"
                :selectedVideoType="selectedVideoType"
                @selected-video="selectVideoType($event)"
            />
            <explore-characters :gameId="gameId" :key="gameId" />

            <game-videos
                id="game-videos"
                :selectedVideoType="selectedVideoType"
                :account="account"
            />
        </div>
    </div>
</template>

<script>
import GameNav from '@/components/games/game-nav';
import Loading from '@/components/common/loading';
import ExploreCharacters from '@/components/explore/explore-characters';
import GameVideos from '@/components/games/game-videos';
import GamesService from '@/services/games-service';
import { eventbus } from '@/main';

export default {
    name: 'Game',

    components: {
        'game-nav': GameNav,
        loading: Loading,
        'explore-characters': ExploreCharacters,
        'game-videos': GameVideos,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    computed: {
        gameId: function () {
            return this.$route.params.id;
        },
    },

    data() {
        return {
            loading: false,
            game: {
                id: this.gameId,
                name: null,
                logo: null,
            },
            selectedVideoType: 'Online Matches',
        };
    },

    watch: {},

    mounted() {
        this.getGame();
    },

    beforeDestroy() {},

    methods: {
        async getGame() {
            this.loading = true;

            const response = await GamesService.getGame({
                id: this.gameId,
            });

            var game = response.data;
            this.game = {
                id: game._id,
                name: game.Title,
                logo: game.LogoUrl || null,
            };
            this.loading = false;
        },

        selectVideoType(selectedVideo) {
            this.selectedVideoType = selectedVideo;
            this.$nextTick(() => {
                const element = document.getElementById('game-videos');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
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
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 10px;
    padding-top: 140px;
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
</style>
