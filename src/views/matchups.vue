<!-- @format -->
<template>
    <div ref="videoViewRef" class="matchups-view">
        <loading v-if="isLoading"></loading>
        <div v-else>
            <div class="header">
                <h1>Character Matchup</h1>
                <div class="character-pills">
                    <div @click="navigateToCharacter(character1Id)">
                        <character-nav :characterId="character1Id" :showMenu="false" />
                    </div>
                    <p class="versus">Vs.</p>
                    <div @click="navigateToCharacter(character2Id)">
                        <character-nav :characterId="character2Id" :showMenu="false" />
                    </div>
                </div>
            </div>
            <div v-if="videos.length > 0" class="videos-container">
                <div
                    v-for="(video, index) in videos"
                    :key="index"
                    :class="{ selected: video.selected }"
                >
                    <match-video-card
                        v-if="video.contentType === 'Match'"
                        v-model="video.isPlaying"
                        :matchId="video.matchId"
                        :account="account"
                        @video:delete="refreshDelete()"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import CharacterMatchupService from '@/services/character-matchup-service';
import CharactersService from '@/services/characters-service';
import NewMatchVideoCard from '@/components/videos/match-video-card';
import CharacterNav from '@/components/character/character-nav';
import Loading from '@/components/common/loading';

import { eventbus } from '@/main';

export default {
    name: 'Matchups',

    components: {
        'match-video-card': NewMatchVideoCard,
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
            isLoading: true,
            query: null,
            savedQuery: null,
            favorites: [],
            filter: 'Match',
            sort: null,
            character1Id: this.$route.params ? this.$route.params.id : null,
            character2Id: this.$route.params ? this.$route.params.id2 : null,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        path: function () {
            return this.$route.path;
        },

        character1Slug: function () {
            return this.$route.params.slug1;
        },

        character2Slug: function () {
            return this.$route.params.slug2;
        },
    },

    watch: {
        path() {
            this.videos = [];
            this.character1Id = this.$route.params.id;
            this.character2Id = this.$route.params.id2;
            this.queryVideos();
        },
    },

    mounted() {
        if (this.account && this.account.id) {
            this.updateFavorites();
        }
        if (
            (this.character1Id && this.character2Id) ||
            (this.character1Slug && this.character2Slug)
        ) {
            this.queryVideos();
        }
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('account:update', this.updateFavorites);
        eventbus.$on('matchup-character1', this.addCharacter1);
        eventbus.$on('matchup-character2', this.addCharacter2);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('account:update', this.updateFavorites);
        eventbus.$off('matchup-character1', this.addCharacter1);
        eventbus.$off('matchup-character2', this.addCharacter2);
    },

    methods: {
        async queryVideos() {
            var searchQuery = [
                {
                    characters: { character1: this.character1Id, character2: this.character2Id },
                },
            ];

            if (this.character1Slug && this.character2Slug) {
                searchQuery[0].characters.character1 = this.character1Slug.toUpperCase();
                searchQuery[0].characters.character2 = this.character2Slug.toUpperCase();
            }

            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
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

            this.hydrateVideos(response);
            // this.checkFavorites();
            if (this.videos.length < 6) {
                this.playFirstVideo();
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((match) => {
                this.videos.push({
                    matchId: match._id,
                    contentType: 'Match',
                    isEditing: false,
                    isPlaying: false,
                });
            });
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

        playFirstVideo() {
            if (this.videos) {
                this.videos[0].isPlaying = true;
                this.isLoading = false;
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

        addCharacter1(characterId) {
            if (this.character2Id) {
                this.$router.push(`/matchups/${characterId}/${this.character2Id}`);
            } else {
                this.character1Id = characterId;
            }
        },

        addCharacter2(characterId) {
            if (this.character1Id) {
                this.$router.push(`/matchups/${this.character1Id}/${characterId}`);
            } else {
                this.character2Id = characterId;
            }
        },

        navigateToCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        },
    },
};
</script>

<style>
.matchups-view {
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.matchups-view h1 {
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.matchups-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.matchups-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.matchups-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.matchups-view .videos-container {
    position: relative;
    width: 100%;
}

.matchups-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.matchups-view .character-pills {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.matchups-view .character-pills .character-nav {
    width: 250px;
    min-width: initial;
    cursor: pointer;
}

.matchups-view .character-pills .character-header {
    height: 50px;
}

.matchups-view .header {
    width: 100%;
    max-width: 600px;
}

.matchups-view .versus {
    font-size: 30px;
    color: #fff;
}

#app.mobile.small-mobile .matchups-view .character-pills .character-nav {
    width: 200px;
}

#app.mobile.small-mobile .matchups-view h1 {
    text-align: center;
}
</style>
