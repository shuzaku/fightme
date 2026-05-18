<!-- @format -->
<template>
    <div class="character-online-matches">
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
            <div v-if="isLast" class="feed-end">
                <v-icon class="feed-end-icon">mdi-check-circle-outline</v-icon>
                <p class="feed-end-title">You're all caught up</p>
                <p class="feed-end-subtitle">No more online matches for this character. Try a different character or check out tournament footage.</p>
                <div class="feed-end-actions">
                    <v-btn small outlined class="feed-end-btn" @click="$router.push('/explore')">Explore Characters</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';

import MatchVideoCard from '@/components/videos/match-video-card';
import Loading from '@/components/common/loading';

export default {
    name: 'CharacterOnlineMatches',

    components: {
        'match-video-card': MatchVideoCard,

        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },

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
    },

    watch: {
        characterId: function () {
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
            if (!this.isLast && !this.loading) {
                this.loading = true;
                this.isLoading = true;
                try {
                    var queryParameter = {
                        skip: this.skip,
                        sort: this.sort,
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

                    const response = await MatchesService.queryMatchesByCharacter(queryParameter);
                    if (response.data.matches.length === 0) {
                        this.isLast = true;
                    }

                    this.hydrateVideos(response);
                } catch (e) {
                    console.error('queryVideos error:', e);
                } finally {
                    this.loading = false;
                    this.isLoading = false;
                }
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
    },
};
</script>

<style>
.character-online-matches {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.character-online-matches video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.feed-end {
    text-align: center;
    padding: 50px 20px 80px;
    color: #ffffff70;
}

.feed-end .feed-end-icon {
    font-size: 40px !important;
    color: #3eb489;
    display: block;
    margin-bottom: 14px;
}

.feed-end .feed-end-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
}

.feed-end .feed-end-subtitle {
    font-size: 14px;
    color: #ffffff70;
    max-width: 420px;
    margin: 0 auto 24px;
    line-height: 1.6;
}

.feed-end .feed-end-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.feed-end .feed-end-btn {
    color: #3eb489 !important;
    border-color: #3eb489 !important;
    text-transform: none;
    font-weight: 500;
}</style>
