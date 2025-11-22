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

            <!-- Game Statistics Section -->
            <div v-if="stats" class="game-stats">
                <div class="stat-card">
                    <p class="number">{{ stats.characters | commaDelimited }}</p>
                    <p class="label">Characters</p>
                </div>
                <div class="stat-card">
                    <p class="number">{{ stats.matches | commaDelimited }}</p>
                    <p class="label">Matches</p>
                </div>
                <div class="stat-card">
                    <p class="number">{{ stats.combos | commaDelimited }}</p>
                    <p class="label">Combos</p>
                </div>
            </div>

            <explore-characters :gameId="gameId" :key="gameId" />
            <div v-if="featuredVideos && featuredVideos.length > 0" class="featured-videos">
                <h2>🎥 Featured Videos</h2>
                <div class="videos">
                    <youtube-media
                        v-for="video in featuredVideos"
                        :key="video.id"
                        :video-id="video.url"
                        ref="youtubeRef"
                        :player-width="350"
                        :player-height="200"
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
                </div>
            </div>

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
import CharactersService from '@/services/characters-service';
import TournamentsService from '@/services/tournaments-service';
import VideosService from '@/services/videos-service';
import TournamentMatchService from '@/services/tournament-match-service';
import FeaturedVideosService from '@/services/featured-videos-service';
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
        isNewGame: function () {
            if (!this.stats) return false;
            return (
                this.stats.matches === 0 && this.stats.combos === 0 && this.stats.tournaments === 0
            );
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
            stats: null,
            featuredVideos: null,
        };
    },

    watch: {
        gameId: function () {
            this.getGame();
            this.getGameStats();
            this.getFeaturedVideos();
        },
    },

    mounted() {
        this.getGame();
        this.getGameStats();
        this.getFeaturedVideos();
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

        async getGameStats() {
            try {
                // Get character count
                const charactersResponse = await CharactersService.queryCharacters({
                    searchQuery: [
                        {
                            queryName: 'GameId',
                            queryValue: this.gameId,
                        },
                    ],
                });
                const characterCount = charactersResponse.data.characters
                    ? charactersResponse.data.characters.length
                    : 0;

                // Get match count (online matches)
                const matchesResponse = await VideosService.queryVideos({
                    searchQuery: [
                        {
                            queryName: 'GameId',
                            queryValue: this.gameId,
                        },
                    ],
                    filter: 'Online Match',
                });
                const matchCount = matchesResponse.data.videos
                    ? matchesResponse.data.videos.length
                    : 0;

                // Get tournament match count
                const tournamentMatchesResponse =
                    await TournamentMatchService.queryTournamentMatches({
                        searchQuery: [
                            {
                                queryName: 'GameId',
                                queryValue: this.gameId,
                            },
                        ],
                    });
                const tournamentMatchCount = tournamentMatchesResponse.data.matches
                    ? tournamentMatchesResponse.data.matches.length
                    : 0;

                // Get tournament count
                const tournamentsResponse = await TournamentsService.queryTournaments({
                    searchQuery: [
                        {
                            queryName: 'Games',
                            queryValue: this.gameId,
                        },
                    ],
                });
                const tournamentCount = tournamentsResponse.data.tournaments
                    ? tournamentsResponse.data.tournaments.length
                    : 0;

                // Get combo count
                const combosResponse = await VideosService.queryVideos({
                    searchQuery: [
                        {
                            queryName: 'GameId',
                            queryValue: this.gameId,
                        },
                    ],
                    filter: 'Combo',
                });
                const comboCount = combosResponse.data.videos
                    ? combosResponse.data.videos.length
                    : 0;

                this.stats = {
                    characters: characterCount,
                    matches: matchCount + tournamentMatchCount,
                    tournaments: tournamentCount,
                    combos: comboCount,
                };
            } catch (error) {
                console.error('Error fetching game stats:', error);
                this.stats = {
                    characters: 0,
                    matches: 0,
                    tournaments: 0,
                    combos: 0,
                };
            }
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

        scrollToVideos() {
            this.selectedVideoType = 'Online Matches';
            this.$nextTick(() => {
                const element = document.getElementById('game-videos');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },

        scrollToCombos() {
            this.selectedVideoType = 'Combos';
            this.$nextTick(() => {
                const element = document.getElementById('game-videos');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },

        openAddModal(option) {
            eventbus.$emit('open:widget', { name: option, valuse: option });
        },

        getFeaturedVideos() {
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

.game-view .game-stats {
    display: flex;
    gap: 16px;
    margin: 40px 0;
    flex-wrap: wrap;
}

.game-view .game-stats .stat-card {
    background: #191b2490;
    border-radius: 15px;
    padding: 16px;
    max-width: 190px;
    min-width: 140px;
    height: 85px;
    width: 100%;
    color: #ffffff90;
    border: 1px solid #ffffff30;
    flex: 1;
}

.game-view .game-stats .stat-card .number {
    font-size: 25px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 4px;
}

.game-view .game-stats .stat-card .label {
    font-size: 14px;
    font-weight: 300;
    text-transform: uppercase;
    color: #ffffff90;
}

.game-view .game-cta {
    background: #191b2490;
    border-radius: 15px;
    padding: 40px;
    margin: 60px 0;
    text-align: center;
    border: 1px solid #ffffff30;
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
    color: #fff !important;
    padding: 12px 32px;
    font-weight: 600;
    text-transform: none;
}

.game-view .game-cta .cta-btn:hover {
    background: #2d8a6a !important;
}

.mobile .game-view .game-stats .stat-card {
    max-width: 100%;
    width: 48%;
}

.mobile .game-view .game-cta {
    padding: 30px 20px;
}

.mobile .game-view .game-cta h2 {
    font-size: 24px;
}

.mobile .game-view .game-cta .cta-actions {
    flex-direction: column;
}

.mobile .game-view .game-cta .cta-btn {
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
</style>
