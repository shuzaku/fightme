<!-- @format -->
<template>
    <div ref="videoList">
        <div class="combo-card card video-card">
            <div class="video-container">
                <youtube-media
                    v-if="video.videoType === 'youtube'"
                    ref="youtubeRef"
                    :video-id="video.url"
                    :player-width="556"
                    :player-height="313"
                    :player-vars="{
                        rel: 0,
                        start: video.combo.startTime,
                        end: video.combo.endTime
                    }"
                    :mute="true"
                    @ready="ready"
                />
                <video v-else ref="videoRef" loop controls muted>
                    <source :src="video.url" type="video/mp4" />
                </video>
            </div>
            <div class="card-label">{{ video.contentType }}</div>
            <div
                class="character-bubble"
                :style="{ backgroundImage: `url('${video.combo.character.imageUrl}')` }"
            />
            <div class="heavy-weight character-name">
                <p @click="queryCharacter(video.combo.character.id)">
                    {{ video.combo.character.name }}
                </p>
            </div>
            <div class="combo-stats">
                <p v-if="video.combo.hits">{{ video.combo.hits }} Hits</p>
                <p v-if="video.combo.damage">{{ video.combo.damage }} Damage</p>
            </div>
            <div class="combo-input">
                <p class="inputs">{{ video.combo.inputs.join(' > ') }}</p>
            </div>
            <div class="admin-controls">
                <v-btn @click="editVideo()">
                    <v-icon dark>
                        mdi-wrench
                    </v-icon>
                </v-btn>
                <v-btn @click="deleteVideo(video.combo, index)">
                    <v-icon dark>
                        mdi-delete
                    </v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';
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
            videoCurrentTime: 0
        };
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
            if (this.videoCurrentTime > parseInt(this.video.combo.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.combo.startTime);
            }
        },

        'video.isPlaying'() {
            if (this.video.isPlaying && this.video.combo.startTime) {
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
                if (this.video.isPlaying && this.video.combo.startTime) {
                    this.setTimer();
                }
            }
        },

        async deleteVideo(combo, index) {
            if (this.video.combos.length < 2) {
                await VideosService.deleteVideo(this.video.id);
            } else {
                this.videos.combos = this.videos.combos.splice(index, 1);
                var request = {
                    id: this.video.id,
                    ComboIds: this.video.combos.map(combo => {
                        return combo.id;
                    })
                };
                await VideosService.patchVideo(request);
                await CombosService.deleteComboo(combo.id);
            }
            this.$emit('closeModal');
            this.$emit('video:delete', this.video);
        },

        queryPlayer(playerId) {
            this.$router.push(`/players/${playerId}`);
        },

        queryCharacter(characterId) {
            this.$router.push(`/characters/${characterId}`);
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
    justify-content: space-between;
    padding: 0 20px;
}
</style>
