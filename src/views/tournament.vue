<!-- @format -->
<template>
    <div ref="videoViewRef" class="games-view">
        <tournament-nav
            :tournamentId="tournamentId"
            @filter:game="filterGame($event)"
            @filter:bracket="filterBracket($event)"
        />

        <loading v-if="loading && videos.length <= 0"></loading>
        <div v-else-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <tournament-match-video-card
                    v-if="video.contentType === 'Tournament Match'"
                    :video="video"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
            </div>
        </div>
    </div>
</template>

<script>
import TournamentMatchService from '@/services/tournament-match-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import TournamentNav from '@/components/tournament/tournament-nav';
import Loading from '@/components/common/loading';
import ExploreCharacters from '@/components/explore/explore-characters';

import { eventbus } from '@/main';

export default {
    name: 'Tournament',

    components: {
        'tournament-match-video-card': TournamentMatchVideoCard,
        'tournament-nav': TournamentNav,
        loading: Loading,
        'explore-characters': ExploreCharacters,
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
            query: null,
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null,
            loading: false,
            isLast: false,
            savedSearchParam: null,
            bracketFilter: null,
            gameFilter: null,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length || 0;
        },

        tournamentId: function () {
            return this.$route.params.id;
        },
    },

    watch: {
        tournamentId: function () {
            this.loading = true;
            this.videos = [];
            this.queryVideos();
            this.loading = false;
        },
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('account:update', this.updateFavorites);
    },

    beforeDestroy() {
        eventbus.$off('newVideoPosted');
        eventbus.$off('search');
        eventbus.$off('account:update');
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        applyFilter(filter) {
            this.videos = [];
            this.filter = filter;
            this.queryVideos();
        },

        async queryVideos(queryParam) {
            this.loading = true;

            this.savedSearchParam = queryParam;

            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                searchQuery: [],
                id: this.tournamentId,
            };

            if (queryParam) {
                queryParameter.searchQuery.push(...queryParam);
            }
            const response = await TournamentMatchService.getTournamentMatches(queryParameter);

            this.hydrateVideos(response);
            if (this.videos.length > 0 && this.videos.length < 6) {
                this.playFirstVideo();
            }
            this.loading = false;
        },

        hydrateVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Tournament Match',
                    isEditing: false,
                    isPlaying: false,
                    videoUrl: video.VideoUrl,
                    videoType: 'youtube',
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
                                characters: this.hydrateCharacters(
                                    player.CharacterIds,
                                    video.Team1PlayerCharacters
                                ),
                            };
                        }),
                        team2Players: video.Team2Players.map((player) => {
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: video.Team2Player.filter(
                                    (searchPlayer) => searchPlayer._id === player.Id
                                )[0].Name,
                                characters: this.hydrateCharacters(
                                    player.CharacterIds,
                                    video.Team2PlayerCharacters
                                ),
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

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push({
                    name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                    id: filteredCharacter[0]._id,
                    imageUrl: filteredCharacter[0].AvatarUrl,
                });
            });
            return playerCharacters;
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

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },

        filterGame(queryParam) {
            this.videos = [];
            var filters = [];
            this.gameFilter = queryParam;

            if (this.bracketFilter) {
                filters.push(this.bracketFilter);
            }

            filters.push(this.gameFilter);
            this.queryVideos(filters);
        },

        filterBracket(queryParam) {
            this.videos = [];
            var filters = [];
            this.bracketFilter = queryParam;

            if (this.gameFilter) {
                filters.push(this.gameFilter);
            }

            filters.push(this.bracketFilter);
            this.queryVideos(filters);
        },

        handleScroll() {
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.isLoading) {
                this.fetchVideos();
            }
        },

        async fetchVideos() {
            var filters = [this.gameFilter, this.bracketFilter];
            this.queryVideos(filters);
        },
    },
};
</script>

<style>
.games-view {
    display: block;
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.games-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.games-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.games-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.games-view .videos-container {
    position: relative;
    width: 100%;
}

.games-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
