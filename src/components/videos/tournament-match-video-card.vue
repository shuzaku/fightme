<!-- @format -->
<template>
    <div ref="videoList" class="tournament-match-video-card">
        <div class="match-card card">
            <div
                :id="video.matchId"
                v-waypoint="{
                    active: true,
                    callback: onWaypoint,
                    options: intersectionOptions,
                }"
                class="video-container"
            >
                <youtube-media
                    v-if="video.videoType === 'youtube'"
                    ref="youtubeRef"
                    :video-id="video.videoUrl"
                    :player-width="556"
                    :player-height="313"
                    :player-vars="{
                        rel: 0,
                        start: video.match.startTime,
                        end: video.match.endTime,
                    }"
                    :mute="true"
                    :playsinline="1"
                    @ready="ready"
                />
            </div>
            <div class="card-label">Match</div>
            <div v-if="!video.isEditing" class="aside">
                <div class="info">
                    <div class="top">
                        <div class="game">
                            <div class="game-title" @click="queryGame(video.game.id)">
                                <p>
                                    <span>
                                        <div class="img-container">
                                            <img :src="video.game.logoUrl" />
                                        </div>
                                        {{ video.game.title }}</span
                                    >
                                </p>
                            </div>
                        </div>
                        <div class="players">
                            <div class="team1">
                                <div
                                    v-for="team1Player in video.match.team1Players"
                                    :key="team1Player.id"
                                    class="player"
                                >
                                    <div
                                        class="heavy-weight player-name"
                                        @click="queryPlayer(team1Player.id)"
                                    >
                                        <p>{{ team1Player.name }}</p>
                                    </div>
                                    <div class="characters">
                                        <div
                                            v-for="(character, index) in team1Player.characters"
                                            :key="index"
                                            class="character"
                                        >
                                            <div
                                                class="character-name"
                                                @click="queryCharacter(character.id)"
                                            >
                                                <p>
                                                    <span>
                                                        <div class="img-container">
                                                            <img :src="character.imageUrl" />
                                                        </div>
                                                        {{ character.name }}</span
                                                    >
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="team2">
                                <div
                                    v-for="team2Player in video.match.team2Players"
                                    :key="team2Player.id"
                                    class="player"
                                >
                                    <div
                                        class="heavy-weight player-name"
                                        @click="queryPlayer(team2Player.id)"
                                    >
                                        <p>{{ team2Player.name }}</p>
                                    </div>
                                    <div class="characters">
                                        <div
                                            v-for="(character, index) in team2Player.characters"
                                            :key="index"
                                            class="character"
                                        >
                                            <div
                                                class="character-name"
                                                @click="queryCharacter(character.id)"
                                            >
                                                <p>
                                                    <span>
                                                        <div class="img-container">
                                                            <img :src="character.imageUrl" />
                                                        </div>
                                                        {{ character.name }}</span
                                                    >
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tournament-section">
                        <img class="tournament-image" :src="video.tournament.logoUrl" />
                        <p>{{ video.tournament.name }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    name: 'TournamentMatchVideoCard',
    components: {},

    props: {
        video: {
            type: Object,
            default: null,
        },

        isFirst: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            videoCurrentTime: 0,
            isLoading: true,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
            player: null,
            collections: null,
            showCollections: false,
            isPlaying: false,
        };
    },

    computed: {
        isAdmin() {
            return this.account ? this.account.role === 'Admin User' : null;
        },
    },

    watch: {
        isPlaying() {
            if (this.video.videoType === 'uploaded') {
                if (this.isPlaying === true) {
                    this.$refs.videoRef.play();
                } else {
                    this.$refs.videoRef.pause();
                }
            } else if (this.video.videoType === 'youtube' && this.player) {
                if (this.isPlaying === true) {
                    this.player.playVideo();
                } else {
                    this.player.pauseVideo();
                }
            }

            if (this.value === true && this.video.match.startTime) {
                this.setTimer();
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > parseInt(this.video.match.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.match.startTime);
            }
        },
    },

    created() {
        this.isPlaying = this.video.isPlaying;
        // this.playVideo();
    },

    methods: {
        seekToTimestamp(seconds) {
            this.$refs.youtubeRef.player.seekTo(seconds);
        },

        playVideo() {
            if (this.video.videoType === 'uploaded') {
                if (this.isPlaying) {
                    this.$refs.videoRef.play();
                }
            } else if (this.video.videoType === 'youtube') {
                if (this.isPlaying) {
                    this.player.playVideo();
                }
            }
        },

        ready(event) {
            this.player = event.target;
            if (this.isPlaying || this.isFirst) {
                this.player.playVideo();
                if (this.isPlaying && this.video.startTime) {
                    this.setTimer();
                }
            }
        },

        queryPlayer(playerId) {
            this.$router.push(`/player/${playerId}`);
        },

        queryCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        },

        queryGame(gameId) {
            this.$router.push(`/game/${gameId}`);
        },

        setTimer() {
            this.$nextTick(function () {
                window.setInterval(() => {
                    this.getTimeStamp();
                }, 1000);
            });
        },

        getTimeStamp() {
            this.videoCurrentTime = this.$refs.youtubeRef.player.getCurrentTime();
        },

        // copyLink() {
        //     this.$copyText(`https://fighters-edge.com/match/${this.video.id}`).then(() => {
        //         alert('match copied');
        //     });
        // },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            if (objectId) {
                if (going === this.$waypointMap.GOING_IN && direction) {
                    this.isPlaying = true;
                }
                if (going === this.$waypointMap.GOING_OUT && direction) {
                    this.isPlaying = false;
                }
            }
        },
    },
};
</script>

<style>
.tournament-match-video-card .match-card {
    margin: 60px 0;
    display: flex;
    /* background-image: linear-gradient(#515b89, #171b33); */
    background: #242832;
    border: 5px solid #242832;
    border-radius: 15px;
    margin-bottom: 30px;
    position: relative;
    cursor: pointer;
    width: 100%;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.tournament-match-video-card .match-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 25%;
    width: 100%;
}

.tournament-match-video-card .match-card .versus {
    font-size: 25px;
    color: #3eb489;
    text-transform: uppercase;
}

.tournament-match-video-card .match-card .card-label {
    position: absolute;
    width: 70px;
    border-radius: 30px;
    top: -15px;
    left: 50%;
    margin-left: -35px;
    background: #db8c10;
    text-align: center;
    padding: 5px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
}

.tournament-match-video-card .match-card .card-label {
    background: #3c73a8;
}

.tournament-match-video-card .match-card video {
    width: 100%;
}

.tournament-match-video-card .match-card .character-name span,
.tournament-match-video-card .match-card .game-title span {
    padding: 6px 20px;
    color: #242832;
    font-size: 20px;
    background: #3eb489;
    font-size: 14px;
    border-radius: 15px;
    display: inline-block;
    position: relative;
    padding-left: 40px;
    overflow: hidden;
}

.tournament-match-video-card .match-card .team2 .character-name span {
    color: #fff;
    background: #4447e2;
}

.tournament-match-video-card .match-card .player-name {
    color: #fff;
    font-size: 20px;
    background: #131419;
    display: inline-block;
    padding: 2px 20px;
    border-radius: 15px;
    position: absolute;
    top: -15px;
    left: 10px;
}

.tournament-match-video-card .match-card .player-name p {
    font-weight: 400;
    font-size: 18px;
}

.tournament-match-video-card .match-card .character-name {
    padding-top: 0px;
    font-size: 13px;
}

.tournament-match-video-card .match-card .character-name p {
    font-size: 14px;
    color: #242832;
    font-weight: 300;
    margin-top: 3px;
}

.tournament-match-video-card .match-card .character {
    padding: 5px;
}

.tournament-match-video-card .match-card .game {
    margin-bottom: 20px;
    text-align: right;
}

.tournament-match-video-card .match-card .game .img-container img,
.tournament-match-video-card .match-card .character .img-container img {
    width: 30px;
}

.tournament-match-video-card .match-card .game .img-container,
.tournament-match-video-card .match-card .character .img-container {
    position: absolute;
    left: 0;
    top: 0;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    height: 30px;
    display: flex;
    align-items: center;
}

.tournament-match-video-card .match-card .video-ghost {
    height: 313px;
    width: 556px;
}

.tournament-match-video-card .match-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
}

.tournament-match-video-card .match-card.card .edit-btn-container {
    padding: 10px;
}

.tournament-match-video-card .match-card.card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #4447e2 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.tournament-match-video-card .match-card .video-container {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    position: relative;
    padding-bottom: 42.25%;
    height: 0;
    overflow: hidden;
    min-width: 75%;
}

.video-container iframe,
.video-container object,
.video-container embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.tournament-match-video-card .match-card .character-2 {
    top: 40px;
}

.tournament-match-video-card .match-card .character-3 {
    top: 120px;
}

.tournament-match-video-card .match-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

#app .tournament-match-video-card .match-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .tournament-match-video-card .match-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .tournament-match-video-card .match-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.tournament-match-video-card .match-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

.tournament-match-video-card .match-card .player {
    border: 1px dashed #3eb489;
    position: relative;
    padding-top: 10px;
    margin-bottom: 40px;
}

.tournament-match-video-card .match-card .team2 .player {
    border: 1px dashed #4447e2;
}

.tournament-match-video-card .match-card .characters {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
}

.tournament-match-video-card .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    color: #fff;
}

.tournament-match-video-card .tournament-section {
    display: flex;
    align-items: center;
}

.tournament-match-video-card .tournament-image {
    width: 75px;
    margin-right: 16px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card {
    flex-direction: column;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .players {
    display: flex;
    width: 100%;
    flex-direction: column;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .players .player {
    margin-bottom: 0;
    max-width: 100%;
    width: 100%;
    margin-bottom: 20px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .player-name {
    top: -9px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .characters {
    padding: 0 5px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .character-name span {
    padding: 3px 20px 3px 40px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .game {
    margin-bottom: 0px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .admin-controls button {
    height: 10px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .player-name p {
    font-size: 12px;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .video-container {
    padding-bottom: 56.25%;
}

#app.mobile.small-mobile .tournament-match-video-card .match-card .aside {
    max-width: 100%;
}
</style>
