<!-- @format -->
<template>
    <div class="game-online-matches">
        <div v-if="videos.length > 0">
            <div v-for="(video, index) in videos" :key="index" :class="{ selected: video.selected }">
                <match-video-card
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :isFirst="video.isFirst"
                    :matchId="video.matchId"
                    :account="account"
                />
            </div>
        </div>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';

import MatchVideoCard from '@/components/videos/match-video-card';
import Loading from '@/components/common/loading';

export default {
    name: 'GameOnlineMatches',

    components: {
        'match-video-card': MatchVideoCard,
        loading: Loading,
    },

    props: {
        account: { type: Object, default: null },
        teamChar1: { type: String, default: null },
        teamChar2: { type: String, default: null },
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

        isTeamGame() {
            return this.gameId === '68cba126f261500022897969';
        },
    },

    watch: {
        gameId: function () {
            this.videos = [];
            this.queryVideos();
        },
        teamChar1() { this.resetAndQuery(); },
        teamChar2() { this.resetAndQuery(); },
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

        resetAndQuery() {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },

        async queryVideos(newQuery) {
            if (!this.isLast && !this.loading) {
                this.isLoading = true;
                try {
                    let response;
                    const teamFilterActive = this.isTeamGame && (this.teamChar1 || this.teamChar2);

                    if (teamFilterActive) {
                        response = await MatchesService.queryMatchesByTeam({
                            skip: this.skip,
                            gameId: this.gameId,
                            char1: this.teamChar1 || undefined,
                            char2: this.teamChar2 || undefined,
                        });
                    } else {
                        var queryParameter = {
                            skip: this.skip,
                            sort: this.sort,
                            searchQuery: [{ queryName: 'GameId', queryValue: this.gameId }],
                            filter: this.filter,
                        };
                        if (this.gameSlug) {
                            queryParameter.searchQuery[0].queryName = 'GameSlug';
                            queryParameter.searchQuery[0].queryValue = this.gameSlug.toUpperCase();
                        }
                        response = await MatchesService.queryMatchesByGame(queryParameter);
                    }

                    if (response.data.matches.length === 0) {
                        this.isLast = true;
                    }
                    this.hydrateVideos(response);
                } catch (e) {
                    console.error('queryVideos error:', e);
                }
                this.isLoading = false;
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    isEditing: false,
                    isFirst: false,
                    contentType: 'Match',
                });
            });
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
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
.game-online-matches {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.game-online-matches video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
