<!-- @format -->
<template>
    <div class="game-combos">
        <div v-if="videos.length > 0">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <combo-video-card
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :isFirst="video.isFirst"
                    :comboClipId="video.comboClipId"
                    :backingVideoId="video.backingVideoId"
                    :account="account"
                    @video:delete="removeComboAt(index)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import ComboVideoCard from '@/components/videos/combo-video-card';
import VideosService from '@/services/videos-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';

export default {
    name: 'GameCombos',

    components: {
        'combo-video-card': ComboVideoCard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
        gameId: {
            type: String,
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

        effectiveGameId: function () {
            if (this.gameId != null && this.gameId !== '') {
                return this.gameId;
            }
            var legacyId = this.$route.params.id;
            if (legacyId && /^[0-9a-fA-F]{24}$/.test(String(legacyId))) {
                return String(legacyId);
            }
            return '';
        },
    },

    watch: {
        effectiveGameId: function () {
            this.videos = [];
            this.isLast = false;
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

        refreshQuery() {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },

        filterQuery(filter) {
            this.videos = [];
            this.filter = filter;
            this.isLast = false;
            this.queryVideos();
        },

        async queryVideos() {
            if (this.isLast || this.loading) {
                return;
            }
            if (!this.effectiveGameId) {
                this.loading = false;
                this.isLoading = false;
                return;
            }
            this.loading = true;
            this.isLoading = true;
            try {
                var queryParameter = {
                    skip: this.skip,
                    sort: this.sort,
                    filter: 'Combo',
                    searchQuery: [
                        {
                            queryName: 'GameId',
                            queryValue: this.effectiveGameId,
                        },
                    ],
                };

                const response = await VideosService.queryVideos(queryParameter);
                const batch = response.data.videos || [];
                if (batch.length === 0) {
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
            response.data.videos.forEach((video) => {
                this.videos.push({
                    comboClipId: video.ComboClip ? video.ComboClip._id : null,
                    backingVideoId: video._id || video.Id || null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isPlaying: false,
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
            if (isNearDocumentBottom() && !this.isLoading) {
                this.queryVideos();
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },

        removeComboAt(index) {
            this.videos.splice(index, 1);
        },
    },
};
</script>

<style>
.game-combos {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.game-combos video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
