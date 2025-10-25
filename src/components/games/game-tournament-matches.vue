<!-- @format -->
<template>
    <div v-if="videos.length > 0" class="game-tournament-matches">
        <div v-for="(video, index) in videos" :key="index" :class="{ selected: video.selected }">
            <tournament-match-video-card
                :video="video"
                v-model="video.isPlaying"
                :favoriteVideos="account ? account.favoriteVideos : null"
                :account="account"
                :matchId="video.matchId"
            />
        </div>
    </div>
</template>

<script>
import TournamentMatchService from '@/services/tournament-match-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import Loading from '@/components/common/loading';

export default {
    name: 'GameOnlineMatches',

    components: {
        'tournament-match-video-card': TournamentMatchVideoCard,

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
            videos: [],
            isLoading: true,
            query: null,
            favorites: [],
            filter: null,
            sort: null,
            isLast: false,
            loading: false,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        gameId: function () {
            return this.$route.params.id;
        },
    },

    watch: {
        gameId: function () {
            this.videos = [];
            this.queryVideos();
        },
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        filterbyTag(filter) {
            this.videos = [];
            this.tagFilter = filter;
            this.queryVideos();
        },

        refreshQuery(newQuery) {
            this.videos = [];
            this.queryVideos(newQuery);
        },

        filterQuery(filter) {
            this.videos = [];
            this.filter = filter;
            this.isLast = false;
            this.queryVideos();
        },

        async queryVideos() {
            if (!this.isLast && !this.loading) {
                this.loading = true;

                var queryParameter = {
                    skip: this.skip,
                    sort: this.sort,
                    searchQuery: [
                        {
                            queryName: 'GameId',
                            queryValue: this.gameId,
                        },
                    ],
                    filter: this.filter,
                };

                const response = await TournamentMatchService.queryTournamentMatches({
                    searchQuery: queryParameter ? queryParameter.searchQuery : null,
                });

                this.hydrateVideos(response);
                if (this.videos.length > 0 && this.videos.length < 6) {
                    this.playFirstVideo();
                }
                this.isLast = true;
                this.loading = false;
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Tournament Match',
                    isEditing: false,
                    isPlaying: false,
                    videoUrl: video.VideoUrl,
                    videoType: video.VideoPlatform,
                    game: {
                        title: video.Game[0].Title,
                        logoUrl: video.Game[0].LogoUrl,
                        id: video.Game[0]._id,
                    },
                    match: {
                        team1Players: video.Team1Players.map((player) => {
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: video.Team1Player.filter(
                                    (searchPlayer) => searchPlayer._id === player.Id
                                )[0].Name,
                                games: this.hydrateGames(player.GameIds, video.Team1PlayerGames),
                            };
                        }),
                        team2Players: video.Team2Players.map((player) => {
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: video.Team2Player.filter(
                                    (searchPlayer) => searchPlayer._id === player.Id
                                )[0].Name,
                                games: this.hydrateGames(player.GameIds, video.Team2PlayerGames),
                            };
                        }),
                        startTime: video.ClipStart ? this.convertTime(video.ClipStart) : null,
                        endTime: video.ClipEnd ? this.convertTime(video.ClipEnd) : null,
                        notes: video.Notes || null,
                        secondaryNotes: video.SecondaryNotes || null,
                    },
                    tournament: {
                        name: video.Tournament[0].Name,
                        logoUrl: video.Tournament[0].Image,
                    },
                });
            });
        },

        hydrateGames(gameIds, games) {
            var playerGames = [];

            gameIds.forEach((id) => {
                var filteredGame = games.filter((game) => game._id === id);
                playerGames.push({
                    name: filteredGame[0].Name ? filteredGame[0].Name : null,
                    id: filteredGame[0]._id,
                    imageUrl: filteredGame[0].AvatarUrl,
                });
            });
            return playerGames;
        },

        convertTime(time) {
            var a = time.split(':');
            var n = a.length;
            var minutesToSeconds = null;
            var hoursToSeconds = null;
            var seconds = 0;
            if (n === 3) {
                hoursToSeconds = parseInt(a[0]) * 3600;
                minutesToSeconds = parseInt(a[1]) * 60;
                seconds = hoursToSeconds + minutesToSeconds + parseInt(a[2]);
            } else if (n === 2) {
                minutesToSeconds = parseInt(a[0]) * 60;
                seconds = minutesToSeconds + parseInt(a[1]);
            } else {
                return parseInt(a[0]);
            }
            seconds === 0 ? seconds++ : seconds;
            return seconds;
        },

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.loading = false;
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find((video) => video.matchId === objectId);
            if (going === this.$waypointMap.GOING_IN && direction) {
                featuredVideo.isPlaying = true;
            }

            if (going === this.$waypointMap.GOING_OUT && direction) {
                featuredVideo.isPlaying = false;
            }
        },

        handleScroll() {
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.isLoading) {
                if (this.isTournament) {
                    this.queryTournamentMatches();
                } else {
                    this.queryVideos();
                }
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },
    },
};
</script>

<style>
.game-tournament-matches {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.game-tournament-matches video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
