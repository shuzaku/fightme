<!-- @format -->
<template>
    <div ref="videoViewRef" class="match-view">
        <loading v-if="loading" />
        <div v-else-if="cardVideo" class="videos-container">
            <tournament-match-video-card
                ref="card"
                v-model="cardVideo.isPlaying"
                :video="cardVideo"
                :raw-match="rawMatchRow"
                :analysis="analyses[0] || null"
                :is-first="true"
                :account="account"
                @player-ready="onPlayerReady"
                @match-updated="fetchMatch"
            />
            <match-notes
                v-if="cardVideo.videoUrl"
                :match-id="''"
                :video-url="cardVideo.videoUrl"
                :account="account"
                :videoPlayer="videoPlayer"
                @capture-timestamp="captureTimestamp"
                @seek-to-timestamp="seekToTimestamp"
            />
        </div>
        <div v-else-if="loadError" class="tournament-match-error">
            <p>{{ loadError }}</p>
        </div>
        <div v-else class="tournament-match-error">
            <p>No match data found.</p>
        </div>
    </div>
</template>

<script>
import TournamentMatchService from '@/services/tournament-match-service';
import AnalysesService from '@/services/analyses-service';
import TournamentMatchVideoCard from '@/components/videos/tournament-match-video-card';
import MatchNotes from '@/components/match/match-notes';
import Loading from '@/components/common/loading';

export default {
    name: 'TournamentMatch',

    components: {
        'tournament-match-video-card': TournamentMatchVideoCard,
        'match-notes': MatchNotes,
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
            cardVideo: null,
            rawMatchRow: null,
            loading: true,
            loadError: null,
            videoPlayer: null,
            analyses: [],
        };
    },

    computed: {
        tournamentMatchId() {
            return this.$route.params.id;
        },
    },

    watch: {
        tournamentMatchId() {
            this.fetchMatch();
        },
    },

    mounted() {
        this.fetchMatch();
    },

    methods: {
        async fetchMatch() {
            this.loading = true;
            this.loadError = null;
            this.cardVideo = null;
            this.rawMatchRow = null;
            this.videoPlayer = null;
            this.analyses = [];

            if (!this.tournamentMatchId) {
                this.loadError = 'Missing tournament match id.';
                this.loading = false;
                return;
            }

            try {
                const response = await TournamentMatchService.getTournamentMatchById(
                    this.tournamentMatchId
                );
                const list = response.data && response.data.matches;
                if (!list || !list.length) {
                    this.loadError = 'This tournament match could not be found.';
                    return;
                }
                this.rawMatchRow = list[0];
                this.cardVideo = this.hydrateTournamentCardVideo(list[0]);
                this.queryAnalysisByVideoUrl(this.cardVideo.videoUrl);
                this.$nextTick(() => {
                    if (this.$refs.card && typeof this.$refs.card.getVideoPlayer === 'function') {
                        this.videoPlayer = this.$refs.card.getVideoPlayer();
                    }
                });
            } catch (e) {
                console.error('fetchMatch', e);
                this.loadError = 'Failed to load this tournament match.';
            } finally {
                this.loading = false;
            }
        },

        async queryAnalysisByVideoUrl(videoUrl) {
            var url = (videoUrl || '').trim();
            if (!url) return;
            try {
                const queryParameter = {
                    searchQuery: [{ queryName: 'videoUrl', queryValue: url }],
                };
                const response = await AnalysesService.queryAnalysis(queryParameter);
                var rows = response && response.data && response.data.analyses;
                if (!rows || !rows.length) {
                    this.analyses = [];
                    return;
                }
                this.analyses = rows.map((analysis) => ({
                    matchId: analysis.MatchId,
                    matchType: analysis.MatchType,
                    summary: analysis.summary || null,
                    timestamps: (analysis.Detections || []).map((d) => ({
                        player: d.player === 'p1' ? 1 : 2,
                        label: d.label,
                        s: parseFloat(d.timestamp),
                        formattedTime: this.formatSeconds(parseFloat(d.timestamp)),
                    })),
                }));
            } catch (e) {
                console.error('queryAnalysisByVideoUrl', e);
                this.analyses = [];
            }
        },

        formatSeconds(seconds) {
            if (seconds == null || Number.isNaN(seconds)) return '00:00';
            var whole = Math.floor(seconds);
            var minutes = Math.floor(whole / 60);
            var secs = whole % 60;
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        hydrateTournamentCardVideo(video) {
            return {
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
            };
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];
            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                if (filteredCharacter[0]) {
                    playerCharacters.push({
                        name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                        id: filteredCharacter[0]._id,
                        imageUrl: filteredCharacter[0].AvatarUrl,
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

        captureTimestamp() {
            if (this.$refs.card && typeof this.$refs.card.getCurrentTimestamp === 'function') {
                return this.$refs.card.getCurrentTimestamp();
            }
            return null;
        },

        seekToTimestamp(timestamp) {
            if (this.$refs.card && typeof this.$refs.card.seekToTimestamp === 'function') {
                this.$refs.card.seekToTimestamp(timestamp);
            }
        },

        onPlayerReady(player) {
            this.videoPlayer = player || null;
        },
    },
};
</script>

<style>
.match-view {
    position: relative;
    padding: 180px 20px;
    height: 100%;
    overflow: visible;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
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

.tournament-match-error {
    color: #fff;
    text-align: center;
    padding: 48px 24px;
    opacity: 0.85;
}
</style>
