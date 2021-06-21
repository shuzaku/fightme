<!-- @format -->
<template>
    <div ref="videoList" class="video-card">
        <div v-if="isLoading"></div>
        <div v-else class="match-card card ">
            <div
                :id="matchId"
                v-waypoint="{
                    active: true,
                    callback: onWaypoint,
                    options: intersectionOptions
                }"
                class="video-container"
            >
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
            </div>
            <div class="card-label">Match</div>
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
            <span class="admin-only">
                <v-btn @click="editVideo()">
                    <v-icon dark>
                        mdi-wrench
                    </v-icon>
                </v-btn>
                <v-btn @click="deleteVideo()">
                    <v-icon dark>
                        mdi-delete
                    </v-icon>
                </v-btn>
            </span>
            <v-btn v-if="!video.isFavorited" class="favorite-button" @click="favoriteVideo()">
                <v-icon light>
                    mdi-heart-outline
                </v-icon>
            </v-btn>
            <v-btn v-else class="unfavorite-button" @click="unfavoriteVideo()">
                <v-icon>
                    mdi-heart
                </v-icon>
            </v-btn>
            <v-btn class="share-button" @click="copyLink()">
                <v-icon light>
                    mdi-link
                </v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchesService from '@/services/matches-service';
import { eventbus } from '@/main';

export default {
    name: 'VideoCard',
    components: {},

    props: {
        matchId: {
            type: String,
            default: null
        },
        value: {
            type: Boolean,
            default: false
        },
        isFirst: {
            type: Boolean,
            default: false
        },
        favoriteVideos: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            videoCurrentTime: 0,
            isLoading: true,
            video: {
                videoType: null,
                isPlaying: false,
                url: null,
                isFavorited: false
            },
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1
            },
            player: null
        };
    },

    computed: {
        formattedInputs() {
            return this.video.combo.inputs.join(' > ');
        }
    },

    watch: {
        'video.isPlaying'() {
            if (this.video.videoType === 'uploaded') {
                if (this.video.isPlaying === true) {
                    this.$refs.videoRef.play();
                } else {
                    this.$refs.videoRef.pause();
                }
            } else if (this.video.videoType === 'youtube' && this.player) {
                if (this.video.isPlaying === true) {
                    this.player.playVideo();
                } else {
                    this.player.pauseVideo();
                }
            }

            if (this.value === true && this.video.combo.startTime) {
                this.setTimer();
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > parseInt(this.video.combo.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.combo.startTime);
            }
        }
    },

    created() {
        this.getMatch();
        this.playVideo();
    },

    methods: {
        async getMatch() {
            const response = await MatchesService.getMatch(this.matchId);
            var matchResponse = response.data.matches[0];
            this.video.match = {
                team1Players: matchResponse.Team1Players.map(player => {
                    return {
                        id: player.Id,
                        slot: player.Slot,
                        name: matchResponse.Team1Player.filter(
                            searchPlayer => searchPlayer._id === player.Id
                        )[0].Name,
                        characters: this.hydrateCharacters(
                            player.CharacterIds,
                            matchResponse.Team1PlayerCharacters
                        )
                    };
                }),
                team2Players: matchResponse.Team2Players.map(player => {
                    return {
                        id: player.Id,
                        slot: player.Slot,
                        name: matchResponse.Team2Player.filter(
                            searchPlayer => searchPlayer._id === player.Id
                        )[0].Name,
                        characters: this.hydrateCharacters(
                            player.CharacterIds,
                            matchResponse.Team2PlayerCharacters
                        )
                    };
                })
            };
            this.video.url = matchResponse.VideoUrl;
            this.getVideo();
        },

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];

            characterIds.forEach(id => {
                var filteredCharacter = characters.filter(character => character._id === id);
                playerCharacters.push({
                    name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                    id: filteredCharacter[0]._id,
                    imageUrl: filteredCharacter[0].ImageUrl
                });
            });
            return playerCharacters;
        },

        async getVideo() {
            const response = await VideosService.getMatchVideo(this.video.url);

            var videoResponse = response.data.videos[0];
            this.video.videoType = videoResponse.VideoType;
            this.video.game = {
                title: videoResponse.Game.Title,
                logoUrl: videoResponse.Game.LogoUrl,
                id: videoResponse.Game._id
            };
            this.video.isPlaying = false;
            this.video.id = videoResponse._id;
            this.isLoading = false;
            this.video.match.id = this.matchId;
            this.video.contentType = 'Match';
            this.video.isFavorited = this.favoriteVideos.some(video => video.id === this.video.id);
        },

        playVideo() {
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

        ready(event) {
            this.player = event.target;
            if (this.video.isPlaying || this.isFirst) {
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
            eventbus.$emit('open:widget', {
                name: 'video',
                videoId: this.video.id
            });
        },

        copyLink() {
            this.$copyText(`https://fighters-edge.com/match/${this.video.id}`).then(() => {
                alert('match copied');
            });
        },

        favoriteVideo() {
            eventbus.$emit('video:favorite', this.video);
            this.video.isFavorited = true;
        },

        unfavoriteVideo() {
            eventbus.$emit('video:unfavorite', this.video);
            this.video.isFavorited = false;
        },

        onWaypoint({ el, going, direction }) {
            var objectId = el.id;
            if (objectId) {
                if (going === this.$waypointMap.GOING_IN && direction) {
                    this.video.isPlaying = true;
                }
                if (going === this.$waypointMap.GOING_OUT && direction) {
                    this.video.isPlaying = false;
                }
            }
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

#app .video-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}
</style>
