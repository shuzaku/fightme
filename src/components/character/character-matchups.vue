<!-- @format -->
<template>
    <div v-if="videos.length > 0" class="character-matchups">
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
</template>

<script>
import CharacterMatchupService from '@/services/character-matchup-service';
import CharactersService from '@/services/characters-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';

import MatchVideoCard from '@/components/videos/match-video-card';
import Loading from '@/components/common/loading';

export default {
    name: 'CharacterMatchups',

    components: {
        'match-video-card': MatchVideoCard,

        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },

        character2Id: {
            type: Array,
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

        characterId: function () {
            return this.$route.params.id;
        },
    },

    watch: {
        character2Id: function () {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },
    },

    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },

    methods: {
        applySort(sort) {
            this.videos = [];
            this.isLast = false;
            this.sort = sort;
            this.queryVideos();
        },

        filterbyTag(filter) {
            this.videos = [];
            this.isLast = false;
            this.tagFilter = filter;
            this.queryVideos();
        },

        refreshQuery(newQuery) {
            this.videos = [];
            this.isLast = false;
            this.queryVideos(newQuery);
        },

        filterQuery(filter) {
            this.videos = [];
            this.filter = filter;
            this.isLast = false;
            this.queryVideos();
        },

        async queryVideos() {
            if (!this.character2Id || !this.character2Id.length) {
                return;
            }
            if (this.isLast || this.loading) {
                return;
            }

            this.loading = true;
            this.isLoading = true;
            try {
                var searchQuery = [
                    {
                        characters: { character1: this.characterId, character2: this.character2Id[0] },
                    },
                ];

                if (this.character1Slug && this.character2Slug) {
                    searchQuery[0].characters.character1 = this.character1Slug.toUpperCase();
                    searchQuery[0].characters.character2 = this.character2Slug.toUpperCase();
                }

                var queryParameter = {
                    skip: this.skip,
                    sort: this.sort,
                    filter: this.filter,
                    searchQuery: searchQuery,
                };

                var response = null;

                if (this.character1Slug && this.character2Slug) {
                    response = await CharacterMatchupService.querySlugMatchup(queryParameter);
                    this.getCharacterId();
                } else {
                    response = await CharacterMatchupService.queryMatchup(queryParameter);
                }

                if (!response.data.matches || response.data.matches.length === 0) {
                    this.isLast = true;
                } else {
                    this.hydrateVideos(response);
                }
            } catch (e) {
                console.error('queryVideos error:', e);
            } finally {
                this.loading = false;
                this.isLoading = false;
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((match) => {
                this.videos.push({
                    matchId: match._id,
                    contentType: 'Match',
                    isEditing: false,
                    isPlaying: false,
                    isFirst: false,
                });
            });
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
        },

        async getCharacterId() {
            var searchQuery = [
                {
                    queryName: 'Slug',
                    queryValue: this.character1Slug.toUpperCase(),
                },
                {
                    queryName: 'Slug',
                    queryValue: this.character2Slug.toUpperCase(),
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            var response = await CharactersService.queryCharacters(queryParameter);
            var characters = response.data.characters;
            this.character1Id = characters.filter(
                (c) => c.Slug === this.character1Slug.toUpperCase()
            )[0]._id;
            this.character2Id = characters.filter(
                (c) => c.Slug === this.character2Slug.toUpperCase()
            )[0]._id;
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
            if (isNearDocumentBottom() && !this.loading) {
                this.queryVideos();
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },
    },
};
</script>

<style>
.character-matchups {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.character-matchups video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
