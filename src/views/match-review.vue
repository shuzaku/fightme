<!-- @format -->
<template>
    <div ref="videoViewRef" class="match-view">
        <loading v-if="loading"></loading>
        <tournament-match-video-analysis-card-test
            v-if="!loading && video.contentType === 'Tournament Match'"
            :video="video"
            v-model="video.isPlaying"
            :favoriteVideos="account ? account.favoriteVideos : null"
            :account="account"
            :matchId="video.matchId"
            :analysis="analyses[0]"
        />
    </div>
</template>

<script>
import TournamentMatchVideoAnalysisCard from '@/components/videos/tournament-match-video-analysis-card-test';
import TournamentMatchService from '@/services/tournament-match-service';
import AnalysesService from '@/services/analyses-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import Loading from '@/components/common/loading';
import moment from 'moment';

export default {
    name: 'Match',

    components: {
        'tournament-match-video-analysis-card-test': TournamentMatchVideoAnalysisCard,
        'tournament-match-video-card': TournamentMatchVideoCard,
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
            video: null,
            loading: true,
            query: null,
            savedQuery: null,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },

            hasTimeStamp: true,
            analyses: [],
        };
    },

    computed: {
        videoId: function () {
            return this.$route.params.id;
        },
    },

    mounted() {
        this.queryVideos();
        this.queryAnalysis();
    },

    created() {},

    beforeDestroy() {},

    methods: {
        async queryVideos() {
            this.loading = true;

            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                filter: this.filter,
                searchQuery: [
                    {
                        queryName: 'Id',
                        queryValue: this.videoId,
                    },
                ],
                id: this.tournamentId,
            };

            const response = await TournamentMatchService.queryTournamentMatches(queryParameter);

            this.hydrateVideos(response);
            this.playFirstVideo();
            this.loading = false;
        },

        hydrateVideos(response) {
            var responseData = response.data.matches[0];
            this.video = {
                matchId: responseData._id,
                contentType: 'Tournament Match',
                isEditing: false,
                isPlaying: false,
                videoUrl: responseData.VideoUrl,
                videoType: 'youtube',
                game: {
                    title: responseData.Game[0].Title,
                    logoUrl: responseData.Game[0].LogoUrl,
                    id: responseData.Game[0]._id,
                },
                match: {
                    team1Players: responseData.Team1Players.map((player) => {
                        return {
                            id: player.Id,
                            slot: player.Slot,
                            name: responseData.Team1Player.filter(
                                (searchPlayer) => searchPlayer._id === player.Id
                            )[0].Name,
                            characters: this.hydrateCharacters(
                                player.CharacterIds,
                                responseData.Team1PlayerCharacters
                            ),
                        };
                    }),
                    team2Players: responseData.Team2Players.map((player) => {
                        return {
                            id: player.Id,
                            slot: player.Slot,
                            name: responseData.Team2Player.filter(
                                (searchPlayer) => searchPlayer._id === player.Id
                            )[0].Name,
                            characters: this.hydrateCharacters(
                                player.CharacterIds,
                                responseData.Team2PlayerCharacters
                            ),
                        };
                    }),
                    startTime: responseData.ClipStart
                        ? this.convertTime(responseData.ClipStart)
                        : null,
                    endTime: responseData.ClipEnd ? this.convertTime(responseData.ClipEnd) : null,
                    notes: responseData.Notes || null,
                    secondaryNotes: responseData.SecondaryNotes || null,
                },
                tournament: {
                    name: responseData.Tournament[0].Name,
                    logoUrl: responseData.Tournament[0].Image,
                },
            };
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

        playFirstVideo() {
            this.video.isPlaying = true;
            this.loading = false;
        },

        async queryAnalysis() {
            var queryParameter = {
                skip: this.skip,
                sortOption: this.sort,
                searchQuery: [
                    {
                        queryName: 'MatchId',
                        queryValue: this.videoId,
                    },
                ],
                filter: this.filter,
            };

            const response = await AnalysesService.queryAnalysis(queryParameter);
            response.data.analyses.map((analysis) => {
                this.analyses.push({
                    matchId: analysis.MatchId,
                    matchType: analysis.MatchType,
                    detection: analysis.Detections,
                });
            });

            this.analyses[0].detection.forEach((detection) => {
                detection.formattedTime = this.formatSeconds(detection.timestamp);
            });
        },

        formatSeconds(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
    },
};
</script>

<style>
.match-view {
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.match-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.match-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.match-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.match-view .videos-container {
    position: relative;
    width: 100%;
}

.match-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
