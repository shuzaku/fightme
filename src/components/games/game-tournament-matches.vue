<!-- @format -->
<template>
    <div class="game-tournament-matches">
        <div v-if="videos.length > 0">
            <div v-for="(video, index) in videos" :key="index" :class="{ selected: video.selected }">
                <!-- team filter active: show lean card -->
                <match-video-card
                    v-if="teamFilterActive"
                    v-model="video.isPlaying"
                    :matchId="video.matchId"
                    :account="account"
                />
                <!-- normal: show full tournament card -->
                <tournament-match-video-card
                    v-else
                    :video="video"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :account="account"
                    :matchId="video.matchId"
                />
            </div>
        </div>
    </div>
</template>

<script>
import TournamentMatchService from '@/services/tournament-match-service';
import MatchesService from '@/services/matches-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import MatchVideoCard from '@/components/videos/match-video-card';
import Loading from '@/components/common/loading';

export default {
    name: 'TournamentMatchVideoCard',

    components: {
        'tournament-match-video-card': TournamentMatchVideoCard,
        'match-video-card': MatchVideoCard,
        loading: Loading,
    },

    props: {
        account: { type: Object, default: null },
        teamChar1: { type: String, default: null },
        teamChar2: { type: String, default: null },
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

        gameId: function () {
            return this.$route.params.id;
        },

        isTeamGame() {
            return this.gameId === '68cba126f261500022897969';
        },

        teamFilterActive() {
            return this.isTeamGame && (this.teamChar1 || this.teamChar2);
        },
    },

    watch: {
        gameId() {
            this.videos = [];
            this.queryVideos();
        },
        teamChar1() { this.videos = []; this.isLast = false; this.queryVideos(); },
        teamChar2() { this.videos = []; this.isLast = false; this.queryVideos(); },
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
            this.isLast = false;
            this.queryVideos();
        },

        async queryVideos() {
            if (!this.isLast && !this.loading) {
                this.loading = true;
                try {
                    if (this.teamFilterActive) {
                        const response = await MatchesService.queryMatchesByTeam({
                            skip: this.skip,
                            gameId: this.gameId,
                            char1: this.teamChar1 || undefined,
                            char2: this.teamChar2 || undefined,
                        });
                        if (response.data.matches.length === 0) this.isLast = true;
                        response.data.matches.forEach((m) => {
                            this.videos.push({ matchId: m._id, isPlaying: false, contentType: 'Match' });
                        });
                    } else {
                        const response = await TournamentMatchService.queryTournamentMatches({
                            skip: this.skip,
                            searchQuery: [{ queryName: 'GameId', queryValue: this.gameId }],
                        });
                        this.hydrateVideos(response);
                        if (this.videos.length > 0 && this.videos.length < 6) {
                            this.playFirstVideo();
                        }
                        this.isLast = true;
                    }
                } catch (e) {
                    console.error('queryVideos error:', e);
                }
                this.loading = false;
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
                        title: video.Game && video.Game[0] ? video.Game[0].Title : '',
                        logoUrl: video.Game && video.Game[0] ? video.Game[0].LogoUrl : '',
                        id: video.Game && video.Game[0] ? video.Game[0]._id : '',
                    },
                    match: {
                        team1Players: video.Team1Players.map((player) => {
                            const matchedPlayer =
                                video.Team1Player && video.Team1Player.length > 0
                                    ? video.Team1Player.find(
                                          (searchPlayer) => searchPlayer._id === player.Id
                                      )
                                    : null;
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: matchedPlayer ? matchedPlayer.Name : 'Unknown',
                                characters: this.hydrateCharacters(
                                    player.CharacterIds,
                                    video.Team1PlayerCharacters
                                ),
                            };
                        }),
                        team2Players: video.Team2Players.map((player) => {
                            const matchedPlayer =
                                video.Team2Player && video.Team2Player.length > 0
                                    ? video.Team2Player.find(
                                          (searchPlayer) => searchPlayer._id === player.Id
                                      )
                                    : null;
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: matchedPlayer ? matchedPlayer.Name : 'Unknown',
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
                        name:
                            video.Tournament && video.Tournament[0] ? video.Tournament[0].Name : '',
                        logoUrl:
                            video.Tournament && video.Tournament[0]
                                ? video.Tournament[0].Image
                                : '',
                    },
                });
            });
        },

        hydrateCharacters(characterIds, characters) {
            if (
                !characterIds ||
                !characters ||
                !Array.isArray(characterIds) ||
                !Array.isArray(characters)
            ) {
                return [];
            }

            var playerCharacters = [];
            characterIds.forEach((id) => {
                var filteredCharacter = characters.find((char) => char._id === id);
                if (filteredCharacter) {
                    playerCharacters.push({
                        name: filteredCharacter.Name || null,
                        id: filteredCharacter._id,
                        imageUrl: filteredCharacter.AvatarUrl || filteredCharacter.ImageUrl || null,
                    });
                }
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

        playFirstVideo() {
            this.videos[0].isPlaying = true;
            this.loading = false;
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
                if (this.isTournament) {
                    this.queryTournamentMatches();
                } else {
                    this.queryVideos();
                }
            }
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },
    },
};
</script>

<style>
.game-tournament-matches {
    position: relative;
    width: 100%;
    max-width: 1100px;
}

.game-tournament-matches video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
