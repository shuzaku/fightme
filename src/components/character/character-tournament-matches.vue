<!-- @format -->
<template>
    <div class="character-tournament-matches">
        <point-character-toggle
            v-if="isPointGame"
            :value="pointOnly"
            @input="$emit('update:pointOnly', $event)"
        />
        <div v-if="pointOnly && !loading && videos.length === 0" class="feed-empty-note">
            No tournament matches with this character on point yet.
        </div>
        <div v-if="videos.length > 0">
            <div v-for="(video, index) in videos" :key="index" :class="{ selected: video.selected }">
                <tournament-match-video-card
                    v-model="video.isPlaying"
                    :video="video"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
            </div>
            <div v-if="isLast" class="feed-end">
                <v-icon class="feed-end-icon">mdi-check-circle-outline</v-icon>
                <p class="feed-end-title">You're all caught up</p>
                <p class="feed-end-subtitle">No more tournament matches for this character. Try a different character or check out their online matches.</p>
                <div class="feed-end-actions">
                    <v-btn small outlined class="feed-end-btn" @click="$router.push('/explore')">Explore Characters</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TournamentMatchService from '@/services/tournament-match-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';
import { isPointCharacterGame } from '@/utils/team-games';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import PointCharacterToggle from '@/components/character/point-character-toggle';
import Loading from '@/components/common/loading';

export default {
    name: 'CharacterOnlineMatches',

    components: {
        'tournament-match-video-card': TournamentMatchVideoCard,
        'point-character-toggle': PointCharacterToggle,

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

        gameId: {
            type: String,
            default: null,
        },

        // Owned by the character view so the setting survives tab switches.
        pointOnly: {
            type: Boolean,
            default: false,
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

        // Point characters only mean something in games that record several
        // characters per player (Marvel Tokon).
        isPointGame: function () {
            return isPointCharacterGame(this.gameId);
        },
    },

    watch: {
        characterId: function () {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },

        pointOnly: function () {
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

        async queryVideos() {
            if (!this.isLast && !this.loading) {
                this.loading = true;
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

                    if (this.isPointGame && this.pointOnly && this.characterId) {
                        queryParameter.pointChar = this.characterId;
                    }

                    const response = await TournamentMatchService.queryTournamentMatches(
                        queryParameter
                    );

                    const batch = response.data.matches || [];
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
            }
        },

        hydrateVideos(response) {
            response.data.matches.forEach((video) => {
                this.videos.push({
                    matchId: video._id,
                    contentType: 'Tournament Match',
                    isEditing: false,
                    isPlaying: false,
                    videoUrl: video.VideoUrl,
                    videoType: video.VideoPlatform,
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
                        notes: video.Notes || null,
                        secondaryNotes: video.SecondaryNotes || null,
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
.character-tournament-matches {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.character-tournament-matches video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
