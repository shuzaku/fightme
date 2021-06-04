<!-- @format -->
<template>
    <div ref="videoList" class="video-card">
        <div class="match-card card">
            <youtube-media
                v-if="video.videoType === 'youtube'"
                ref="youtubeRef"
                :video-id="video.url"
                :player-width="556"
                :player-height="313"
                :player-vars="{ rel: 0, start: video.startTime, end: video.endTime }"
                :mute="true"
                @ready="ready"
            />
            <div class="card-label">{{ video.contentType }}</div>
            <div
                v-for="(character, index) in video.match.team1Players[0].characters"
                :key="character.id"
            >
                <div
                    :class="[
                        'character-bubble',
                        `character-${index + 1}`,
                        character.name.toLowerCase()
                    ]"
                    :style="{ backgroundImage: `url('${character.imageUrl}')` }"
                />
            </div>
            <div
                v-for="(character, index) in video.match.team2Players[0].characters"
                :key="character.id"
            >
                <div
                    :class="[
                        'character-bubble',
                        'player2',
                        `character-${index}`,
                        character.name.toLowerCase()
                    ]"
                    :style="{ backgroundImage: `url('${character.imageUrl}')` }"
                />
            </div>
            <div v-if="!video.isEditing" class="characters">
                <div class="player1">
                    <div
                        class="heavy-weight player-name"
                        @click="queryPlayer(video.match.team1Players[0].id)"
                    >
                        <p>{{ video.match.team1Players[0].name }}</p>
                    </div>
                    <div
                        v-for="(character, index) in video.match.team1Players[0].characters"
                        :key="index"
                    >
                        <div class="character-name" @click="queryCharacter(character.id)">
                            <p>
                                <span>{{ character.name }}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="versus heavy-weight">vs</div>
                <div class="player2">
                    <div
                        class="heavy-weight player-name"
                        @click="queryPlayer(video.match.team2Players[0].id)"
                    >
                        <p>{{ video.match.team2Players[0].name }}</p>
                    </div>
                    <div
                        v-for="(character, index) in video.match.team2Players[0].characters"
                        :key="index"
                    >
                        <div class="character-name" @click="queryCharacter(character.id)">
                            <p>
                                <span>{{ character.name }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="admin-controls">
            <!-- <v-btn @click="editVideo()">
                <v-icon dark>
                    mdi-wrench
                </v-icon>
            </v-btn>
            <v-btn @click="deleteVideo()">
                <v-icon dark>
                    mdi-delete
                </v-icon>
            </v-btn> -->
            <v-btn class="share-button" @click="copyLink()">
                <v-icon dark>
                    mdi-link
                </v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import { eventbus } from '@/main';

export default {
    name: 'VideoCard',
    components: {},

    props: {
        video: {
            type: Object,
            default: null
        },
        value: {
            type: Boolean
        }
    },

    provide() {
        return {
            video: this.video
        };
    },

    data() {
        return {
            videoId: null,
            startTime: null,
            videoCurrentTime: 0
        };
    },

    computed: {
        formattedInputs() {
            return this.video.combo.inputs.join(' > ');
        }
    },

    watch: {
        value() {
            if (this.video.videoType === 'uploaded') {
                if (this.video.isPlaying) {
                    this.$refs.videoRef.play();
                } else {
                    this.$refs.videoRef.pause();
                }
            } else if (this.video.videoType === 'youtube') {
                if (this.video.isPlaying) {
                    this.player.playVideo();
                } else {
                    this.player.pauseVideo();
                }
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > parseInt(this.video.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.startTime);
            }
        },

        'video.isPlaying'() {
            if (this.video.isPlaying && this.video.startTime) {
                this.setTimer();
            }
        }
    },

    mounted() {
        if (this.video.videoType === 'uploaded') {
            if (this.video.isPlaying) {
                this.$refs.videoRef.play();
            }
        } else if (this.video.videoType === 'youtube') {
            if (this.video.isPlaying) {
                // this.player.playVideo();
            }
        }
    },

    methods: {
        ready(event) {
            this.player = event.target;
            if (this.video.isPlaying) {
                this.player.playVideo();
                if (this.video.isPlaying && this.video.startTime) {
                    this.setTimer();
                }
            }
        },

        async deleteVideo() {
            await VideosService.deleteVideo(this.video.id);
            this.$emit('video:delete', this.video);
        },

        queryPlayer(playerId) {
            this.$router.push(`/player/${playerId}`);
        },

        queryCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        },

        setTimer() {
            this.$nextTick(function() {
                window.setInterval(() => {
                    this.getTimeStamp();
                }, 1000);
            });
        },

        getTimeStamp() {
            this.videoCurrentTime = this.$refs.youtubeRef.player.getCurrentTime();
        },

        editVideo() {
            this.video.isEditing = true;
            eventbus.$emit('open:videoWidget', {
                name: 'video',
                videoId: this.video.id
            });
        },

        copyLink() {
            this.$copyText(`https://fighters-edge.com/match/${this.video.id}`).then(() => {
                alert('match copied');
            });
        }
    }
};
</script>

<style>
.video-card {
    margin: 60px 0;
}

.video-card .character-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-size: 200%;
    background-position: top center;
    position: absolute;
    top: -15px;
    left: -25px;
    background-color: #e8e8e8;
}

.video-card .character-bubble.player2 {
    right: -25px;
    left: auto;
}

.video-card {
    /* background-image: linear-gradient(#515b89, #171b33); */
    background: #444;
    border: 5px solid #444;
    border-radius: 15px;
    margin-bottom: 30px;
    position: relative;
    cursor: pointer;
    width: 100%;
    max-width: 570px;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.video-card .combo-card .combo-stats {
    display: flex;
    justify-content: space-between;
}

.video-card .combo-card .combo-stats p {
    font-size: 14px;
    color: #1ab097;
    font-weight: 600;
}

.video-card .match-card .player2 .player-name p {
    text-align: right;
}

.video-card .match-card .characters {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.video-card .match-card .versus {
    font-size: 25px;
    color: #ffff00;
    text-transform: uppercase;
}

.video-card .card-label {
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

.video-card .match-card .card-label {
    background: #3c73a8;
}

.video-card video {
    width: 100%;
}

.video-card .character-name {
    padding: 20px 20px 0;
    color: #fff;
    font-size: 20px;
}

.video-card .player-name {
    color: #fff;
    font-size: 20px;
    padding: 0 20px;
}

.video-card .match-card .character-name {
    padding-top: 0px;
    font-size: 13px;
}

.video-card .match-card .character-name p {
    font-size: 14px;
    color: #3eb489;
    font-weight: 300;
    margin-top: 3px;
}

.video-card .match-card .player2 .character-name p {
    text-align: right;
}

.video-card .combo-stats {
    padding: 5px 20px 5px;
}

.video-card .characters {
    padding: 10px 10px 15px;
}

.video-card .video-ghost {
    height: 313px;
    width: 556px;
}

.video-card .combo-input {
    padding: 0 20px;
    margin: 10px 0;
    font-style: italic;
}

.video-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
}

.video-card .card .edit-btn-container {
    padding: 10px;
}

.video-card .card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #1ab097 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.video-card .video-container {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
}

.video-card .character-2 {
    top: 40px;
}

.video-card .character-3 {
    top: 120px;
}

.video-card .character-bubble.narmaya,
.video-card .character-bubble.vaseraga,
.video-card .character-bubble.charlotta,
.video-card .character-bubble.anre,
.video-card .character-bubble.arizona,
.video-card .character-bubble.jacqui {
    background-position-y: 25%;
}

.video-card .character-bubble.arizona {
    background-position-y: 65%;
}

.video-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

.video-card .admin-controls .share-button {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    min-width: initial;
}
</style>
