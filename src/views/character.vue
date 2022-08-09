<!-- @format -->
<template>
    <div ref="videoViewRef" class="character-view">
        <character-nav
            :characterId="characterId"
            :characterSlug="characterSlug"
            :account="account"
            @character-filter:update="filterQuery($event)"
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
            </div>
        </div>
        <loading v-show="loading"></loading>
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

import { eventbus } from '@/main';

export default {
    name: 'Character',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'montage-video-card': MontageVideoCard,
        'character-nav': CharacterNav,
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
            tagFilter: null,
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
            this.isLoading = true;
            this.videos = [];
            this.queryVideos();
            this.isLoading = false;
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
            this.queryVideos();
        },

        async queryVideos(newQuery) {
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
            this.hydrateVideos(response);
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
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
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
    },
};
</script>

<style>
.character-view {
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
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
