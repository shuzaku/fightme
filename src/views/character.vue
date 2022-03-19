<!-- @format -->
<template>
    <div ref="videoViewRef" class="characters-view">
        <character-nav
            :characterId="characterId"
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
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';
import MontageVideoCard from '@/components/videos/montage-video-card';
import CharacterNav from '@/components/character/character-nav';

import { eventbus } from '@/main';

export default {
    name: 'Character',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'montage-video-card': MontageVideoCard,
        'character-nav': CharacterNav,
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
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        characterId: function () {
            return this.$route.params.id;
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

            if (newQuery) {
                queryParameter.searchQuery.push(newQuery);
            }

            console.log(queryParameter);

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
        },

        hydrateVideos(response) {
            response.data.videos.forEach((video) => {
                this.videos.push({
                    comboClipId: video.ComboClip ? video.ComboClip._id : null,
                    matchId: video.Match ? video.Match._id : null,
                    montageId: video.Montage ? video.Montage._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isFirst: false,
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
            if (bottomOfWindow) {
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
.characters-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-top: 20px;
    height: 100%;
    flex-direction: column;
}

.characters-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.characters-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.characters-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.characters-view .videos-container {
    position: relative;
    margin-top: 0;
}

.characters-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.characters-view .combo-card:first-child {
    margin-top: 30px;
}
</style>
