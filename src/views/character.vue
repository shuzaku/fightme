<!-- @format -->
<template>
    <div ref="videoViewRef" class="character-view">
        <loading v-if="loading && videos.length <= 0"></loading>
        <div v-else class="character-container">
            <character-nav
                :characterId="characterId"
                :characterSlug="characterSlug"
                :account="account"
                @character-filter:update="filterQuery($event)"
                @query-tournament-matches="queryTournamentMatches()"
            />
            <div v-if="videos.length > 0" class="videos-container">
                <div
                    v-for="(video, index) in videos"
                    :key="index"
                    :class="{ selected: video.selected }"
                >
                    <match-video-card
                        v-if="video.contentType === 'Match'"
                        v-model="video.isPlaying"
                        :favoriteVideos="account ? account.favoriteVideos : null"
                        :isFirst="video.isFirst"
                        :matchId="video.matchId"
                        :account="account"
                    />
                    <combo-video-card
                        v-if="video.contentType === 'Combo'"
                        v-model="video.isPlaying"
                        :favoriteVideos="account ? account.favoriteVideos : null"
                        :isFirst="video.isFirst"
                        :comboClipId="video.comboClipId"
                        :account="account"
                    />
                    <montage-video-card
                        v-if="video.contentType === 'Montage'"
                        v-model="video.isPlaying"
                        :montageId="video.montageId"
                        :account="account"
                        @video:delete="refreshDelete()"
                    />
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
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchesService from '@/services/matches-service';

import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';
import MontageVideoCard from '@/components/videos/montage-video-card';
import CharacterNav from '@/components/character/character-nav';
import Loading from '@/components/common/loading';
import TournamentMatchService from '@/services/tournament-match-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';

import { eventbus } from '@/main';

export default {
    name: 'Character',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'montage-video-card': MontageVideoCard,
        'character-nav': CharacterNav,
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
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null,
            tagFilter: null,
            isLast: false,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        characterId: function () {
            return this.$route.params.id;
        },

        characterSlug: function () {
            return this.$route.params.slug;
        },
    },

    watch: {
        characterId: function () {
            this.videos = [];
            this.queryVideos();
        },
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('character-query', this.refreshQuery);
        eventbus.$on('character-filter', this.filterQuery);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('filter-tag:update', this.filterbyTag);
        eventbus.$on('matchup-filter', this.initiateQueryMatchup);
        eventbus.$on('account:update', this.isCharacterFollowed);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('character-query', this.refreshQuery);
        eventbus.$off('character-filter', this.filterQuery);
        eventbus.$off('search', this.queryVideos);
        eventbus.$off('filter-tag:update', this.filterbyTag);
        eventbus.$off('matchup-filter', this.initiateQueryMatchup);
        eventbus.$off('account:update', this.isCharacterFollowed);
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

        async queryVideos(newQuery) {
            if (!this.isLast) {
                if (this.$route.name == 'CharacterCombo') {
                    this.filter = 'Combo';
                }

                this.isLoading = true;
                var queryParameter = {
                    skip: this.skip,
                    sortOption: this.sort,
                    searchQuery: [
                        {
                            queryName: 'CharacterId',
                            queryValue: this.characterId,
                        },
                    ],
                    filter: this.filter,
                };

                if (this.characterSlug) {
                    queryParameter.searchQuery[0].queryName = 'CharacterSlug';
                    queryParameter.searchQuery[0].queryValue = this.characterSlug.toUpperCase();
                }

                if (newQuery) {
                    queryParameter.searchQuery.push(newQuery);
                }

                const response = await MatchesService.queryMatchesByCharacter(queryParameter);
                if (response.data.matches.length === 0) {
                    this.isLast = true;
                }

                this.hydrateVideos(response);
                this.isLoading = false;
            }
        },

        async queryTournamentMatches() {
            this.videos = [];
            this.loading = true;

            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                searchQuery: [
                    {
                        queryName: 'CharacterId',
                        queryValue: this.characterId,
                    },
                ],
                filter: this.filter,
            };

            const response = await TournamentMatchService.queryTournamentMatches({
                searchQuery: queryParameter ? queryParameter.searchQuery : null,
            });

            this.hydrateTournamentVideos(response);
            if (this.videos.length > 0 && this.videos.length < 6) {
                this.playFirstVideo();
            }
            this.isLast = true;
            this.loading = false;
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

        hydrateTournamentVideos(response) {
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

        handleScroll() {
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.isLoading) {
                this.fetchVideos();
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },

        initiateQueryMatchup(searchQuery) {
            this.videos = [];
            this.queryMatchup(searchQuery);
        },

        async queryMatchup(searchQuery) {
            var queryParameter = {
                skip: this.skip,
                searchQuery: searchQuery,
            };

            const response = await VideosService.queryMatchup(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
        },

        async fetchVideos() {
            this.isLoading = true;
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                searchQuery: [
                    {
                        queryName: 'CharacterId',
                        queryValue: this.characterId,
                    },
                ],
                id: this.characterId,
            };

            if (this.savedSearchParam) {
                queryParameter.searchQuery.push(this.savedSearchParam);
            }

            const response = await MatchesService.queryMatchesByCharacter(queryParameter);
            if (response.data.matches.length === 0) {
                this.isLast = true;
            }

            this.hydrateVideos(response);
            this.isLoading = false;
        },
    },
};
</script>

<style>
.character-view {
    position: relative;
    padding-top: 40px;
    height: 100%;
    overflow: visible;
    width: 100%;
}

.character-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.character-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.character-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.character-view .videos-container {
    position: relative;
    width: 100%;
}

.character-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
