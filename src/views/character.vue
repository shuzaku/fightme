<!-- @format -->
<template>
    <div ref="videoViewRef" class="characters-view">
        <character-nav
            v-if="!isLoading"
            :characterId="characterId"
            @character-sort:update="applySort($event)"
            @character-filter:update="applyFilter($event)"
            @character-filter-tag:update="applyTagFilter($event)"
        />
        <character-recommended v-if="$route.name === 'Character'" />
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :favoriteVideos="account.favoriteVideos"
                    :isFirst="video.isFirst"
                    :matchId="video.matchId"
                />
                <combo-video-card
                    v-if="video.contentType === 'Combo'"
                    v-model="video.isPlaying"
                    :favoriteVideos="account.favoriteVideos"
                    :isFirst="video.isFirst"
                    :comboId="video.comboId"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';
import CharacterNav from '@/components/character/character-nav';
import CharacterRecommended from '@/components/character/character-recommended';

import { eventbus } from '@/main';

export default {
    name: 'Videos',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
        'character-nav': CharacterNav,
        'character-recommended': CharacterRecommended
    },

    props: {
        account: {
            type: Object,
            default: null
        }
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
            tagFilter: null
        };
    },

    computed: {
        skip: function() {
            return this.videos.length;
        },

        characterId: function() {
            return this.$route.params.id;
        }
    },

    watch: {
        characterId: function() {
            this.isLoading = true;
            this.videos = [];
            this.queryVideos();
            this.isLoading = false;
        }
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
        eventbus.$on('filter-tag:update', this.filterbyTag);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
        eventbus.$off('account:update', this.updateFavorites);
        eventbus.$off('filter-tag:update', this.filterbyTag);
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

        filterbyTag(filter) {
            this.videos = [];
            this.tagFilter = filter;
            this.queryVideos();
        },

        async queryVideos() {
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                tagFilter: this.tagFilter,
                searchQuery: [
                    {
                        queryName: 'CharacterId',
                        queryValue: this.characterId
                    }
                ]
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
            // this.checkFavorites();
        },

        hydrateVideos(response) {
            response.data.videos.forEach(video => {
                this.videos.push({
                    comboId: video.Combo ? video.Combo._id : null,
                    matchId: video.Match ? video.Match._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isFirst: false
                });
            });
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            var featuredVideo = this.videos.find(video => video.matchId === objectId);
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

        updateFavorites() {
            this.favorites = this.account.favoriteVideos.map(video => {
                return {
                    contentType: video.contentType,
                    id: video.id
                };
            });
        },

        checkFavorites() {
            this.favorites.forEach(favorite => {
                if (favorite.contentType === 'Combo') {
                    this.videos.filter(
                        video => video.combo.id === favorite.id
                    )[0].isFavorited = true;
                } else {
                    this.videos.filter(video => video.id === favorite.id)[0].isFavorited = true;
                }
            });
        }
    }
};
</script>

<style>
.characters-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-top: 100px;
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
