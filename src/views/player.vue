<!-- @format -->
<template>
    <div ref="videoViewRef" class="player-view">
        <player-nav
            :playerId="playerId"
            :account="account"
            :playerSlug="playerSlug"
            @player-filter:update="filterQuery($event)"
        />
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
                :favoriteVideos="account ? account.favoriteVideos : null"
                :account="account"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :matchId="video.matchId"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                />
            </div>
        </div>
        <div v-else-if="(videos.length = 0 && !loading)" class="no-videos">
            <h2>Unable to find any videos</h2>
        </div>
        <loading v-show="loading"></loading>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import NewMatchVideoCard from '@/components/videos/match-video-card';
import PlayerNav from '@/components/players/player-nav';
import Loading from '@/components/common/loading';
import { eventbus } from '@/main';

export default {
    name: 'Player',

    components: {
        'match-video-card': NewMatchVideoCard,
        'player-nav': PlayerNav,
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
            loading: true,
            query: null,
            savedQuery: null,
            favorites: [],
            filter: null,
            sort: null,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        playerId: function () {
            return this.$route.params.id;
        },

        playerSlug: function () {
            return this.$route.params.slug;
        },
    },

    watch: {
        playerId: function () {
            this.isLoading = true;
            this.videos = [];
            window.scrollTo(0, 0);
            this.queryVideos();
            this.isLoading = false;
        },
    },

    mounted() {
        if (this.account) {
            this.updateFavorites();
        }
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
        eventbus.$on('account:update', this.updateFavorites);
        eventbus.$on('player-filter', this.refreshQuery);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
        eventbus.$off('account:update', this.updateFavorites);
        eventbus.$off('player-filter', this.refreshQuery);
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.sort = sort;
            this.queryVideos();
        },

        refreshQuery(newQuery) {
            this.videos = [];
            this.queryVideos(newQuery);
        },

        async queryVideos(newQuery) {
            this.isLoading = true;
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                searchQuery: [
                    {
                        queryName: 'PlayerId',
                        queryValue: this.playerId,
                    },
                ],
            };

            if (this.playerSlug) {
                queryParameter.searchQuery[0].queryName = 'PlayerSlug';
                queryParameter.searchQuery[0].queryValue = this.playerSlug;
            }

            if (newQuery) {
                queryParameter.searchQuery.push(newQuery);
            }

            const response = await MatchesService.queryMatchesByPlayer(queryParameter);
            this.hydrateVideos(response);
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
            this.isLoading = false;
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
        },

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.isLoading = false;
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
                this.queryVideos();
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },

        updateFavorites() {
            if (this.account.id) {
                this.favorites = this.account.favoriteVideos.map((video) => {
                    return {
                        contentType: video.contentType,
                        id: video.id,
                    };
                });
            }
        },

        checkFavorites() {
            this.favorites.forEach((favorite) => {
                this.videos.filter((video) => video.id === favorite.id)[0].isFavorited = true;
            });
        },
    },
};
</script>

<style>
.player-view {
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.player-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.player-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.player-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.player-view .videos-container {
    position: relative;
    width: 100%;
}

.player-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
