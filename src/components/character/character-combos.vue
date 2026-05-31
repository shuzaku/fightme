<!-- @format -->
<template>
    <div class="character-combos">
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
            <div v-if="isLast" class="feed-end">
                <v-icon class="feed-end-icon">mdi-check-circle-outline</v-icon>
                <p class="feed-end-title">You're all caught up</p>
                <p class="feed-end-subtitle">No more combos for this character. Have a clip to share? Submit one, or explore combos for a different character.</p>
                <div class="feed-end-actions">
                    <v-btn small outlined class="feed-end-btn" @click="openAddCombo">+ Add Combo</v-btn>
                    <v-btn small outlined class="feed-end-btn" @click="$router.push('/explore')">Explore Characters</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ComboVideoCard from '@/components/videos/combo-video-card';
import VideosService from '@/services/videos-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';
import { eventbus } from '@/main';

export default {
    name: 'CharacterCombos',

    components: {
        'combo-video-card': ComboVideoCard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
        // Game the character belongs to. Used to pre-fill the Add Combo
        // widget so the user lands on the form with both selectors filled.
        gameId: {
            type: String,
            default: null,
        },
        // The resolved character ObjectId from the parent. Preferred over
        // `$route.params.id` because routes like /c/:slug or
        // /character/:slug pass a slug — but newCombo and the API expect
        // an ObjectId.
        characterId: {
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

        // Falls back to the route param when the parent hasn't resolved
        // the ObjectId yet (e.g. very first render). The query API accepts
        // both ObjectId and slug, so either is fine for fetching.
        effectiveCharacterId: function () {
            return this.characterId || this.$route.params.id;
        },
    },

    watch: {
        effectiveCharacterId: function () {
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

        async queryVideos(newQuery) {
            if (this.isLast || this.loading) {
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
                            queryName: 'CharacterId',
                            queryValue: this.effectiveCharacterId,
                        },
                    ],
                    sort: null,
                };

                const response = await VideosService.queryComboClips(queryParameter);
                const batch = response.data.comboClips || [];
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
            (response.data.comboClips || []).forEach((clip) => {
                this.videos.push({
                    comboClipId: clip._id,
                    backingVideoId: null,
                    contentType: 'Combo',
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
            var featuredVideo = this.videos.find((video) => video.comboClipId === objectId);
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

        openAddCombo() {
            // Open the shared combo widget pre-filled with this page's game
            // and character. The widget's `videoUrl` step is left blank so
            // the user pastes the new clip URL.
            eventbus.$emit('open:widget', {
                name: 'combo',
                gameId: this.gameId,
                characterId: this.characterId,
            });
        },
    },
};
</script>

<style>
.character-combos {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.character-combos video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

</style>
