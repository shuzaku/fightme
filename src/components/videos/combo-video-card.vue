<!-- @format -->
<template>
    <div ref="videoList">
        <div v-if="isLoading" />
        <div v-else class="combo-card card">
            <div
                :id="comboClipId"
                v-waypoint="{
                    active: true,
                    callback: onComboWaypoint,
                    options: intersectionOptions,
                }"
                class="video-container"
            >
                <youtube-media
                    v-if="video.videoType === 'youtube'"
                    ref="youtubeRef"
                    :videoId="video.combo.clipUrl"
                    :player-width="556"
                    :player-height="313"
                    :player-vars="{
                        rel: 0,
                        start: video.combo.startTime,
                        end: video.combo.endTime,
                    }"
                    :mute="true"
                    :playsinline="1"
                    @ready="ready"
                />
                <video v-else ref="videoRef" loop controls muted>
                    <source :src="video.url" type="video/mp4" />
                </video>
            </div>
            <div class="card-label">Combo</div>
            <div v-if="!video.isEditing" class="aside">
                <div class="combo-info">
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
                    <div class="character-name" @click="queryCharacter(video.combo.character.id)">
                        <p>
                            <span>
                                <div class="img-container">
                                    <img :src="video.combo.character.imageUrl" />
                                </div>
                                {{ video.combo.character.name }}</span
                            >
                        </p>
                    </div>
                    <div class="combo-stats">
                        <p v-if="video.combo.hits">{{ video.combo.hits }} Hits</p>
                        <p v-if="video.combo.damage">{{ video.combo.damage }} Damage</p>
                    </div>
                    <div class="combo-input">
                        <p class="inputs">{{ video.combo.inputs }}</p>
                    </div>
                </div>
                <div v-if="video.combo.tags" class="combo-tags">
                    <p v-for="tag in video.combo.tags" :key="tag.id" class="tag">#{{ tag.name }}</p>
                </div>
                <div class="admin-controls">
                    <collection-search
                        v-if="showCollections"
                        v-model="video.collections"
                        :account="account"
                        multiple
                        @update:collection="updateCollections($event, video)"
                    />
                    <v-btn
                        v-if="account"
                        class="favorite-button"
                        @click="showCollections = !showCollections"
                    >
                        <v-icon light> mdi-plus </v-icon>
                    </v-btn>
                    <v-btn v-if="isAdmin" @click="editVideo()">
                        <v-icon dark> mdi-wrench </v-icon>
                    </v-btn>
                    <v-btn v-if="isAdmin" @click="deleteVideo(video.combo)">
                        <v-icon dark> mdi-delete </v-icon>
                    </v-btn>
                    <v-btn
                        v-if="!video.isFavorited"
                        class="favorite-button"
                        @click="favoriteVideo()"
                    >
                        <v-icon light> mdi-heart-outline </v-icon>
                    </v-btn>
                    <v-btn v-else class="unfavorite-button" @click="unfavoriteVideo()">
                        <v-icon> mdi-heart </v-icon>
                    </v-btn>
                    <v-btn class="share-button" @click="copyLink()">
                        <v-icon light> mdi-link </v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';
import CollectionsService from '@/services/collections-service';
import CollectionSearch from '@/components/collection/collection-search';

import { eventbus } from '@/main';

export default {
    name: 'ComboCard',
    components: {
        'collection-search': CollectionSearch,
    },

    props: {
        comboClipId: {
            type: String,
            default: null,
        },
        value: {
            type: Boolean,
            default: false,
        },
        isFirst: {
            type: Boolean,
            default: false,
        },
        favoriteVideos: {
            type: Array,
            default: null,
        },
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            videoCurrentTime: 0,
            isLoading: true,
            video: {
                videoType: null,
                isPlaying: false,
                isFavorited: false,
            },
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
            player: null,
            collections: null,
            showCollections: false,
        };
    },

    computed: {
        isAdmin() {
            return this.account && this.account.role === 'Admin User';
        },
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

            if (this.video.isPlaying && this.video.combo.startTime) {
                this.setTimer();
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > this.video.combo.endTime) {
                this.$refs.youtubeRef.player.seekTo(this.video.combo.startTime);
            }
        },
    },

    created() {
        if (this.account && this.account.id) {
            this.getCollections();
        }
        this.getCombo();
        this.playVideo();
    },

    methods: {
        async getCombo() {
            const response = await CombosService.getComboClip(this.comboClipId);
            var comboResponse = response.data.comboClip[0];

            this.video.combo = {
                id: comboResponse._id,
                character: {
                    id: comboResponse.Character._id,
                    name: comboResponse.Character.Name,
                    imageUrl: comboResponse.Character.AvatarUrl,
                },
                damage: comboResponse.Combo.Damage,
                hits: comboResponse.Combo.Hits,
                inputs: comboResponse.Combo.ComboInputs,
                startTime: this.convertTime(comboResponse.StartTime),
                endTime: this.convertTime(comboResponse.EndTime),
                clipUrl: comboResponse.Url,
            };
            this.getVideo();
        },

        convertTime(time) {
            var a = time.split(':');
            var n = a.length;

            var seconds = 0;
            if (n > 0) {
                var minutesToSeconds = parseInt(a[0]) * 60;
                seconds = minutesToSeconds + parseInt(a[1]);
            } else {
                return parseInt(a[0]);
            }

            return seconds;
        },

        async getVideo() {
            const response = await VideosService.getComboVideo(this.video.combo.clipUrl);
            var videoResponse = response.data.videos[0];
            this.video.videoType = videoResponse.VideoType;
            this.video.game = {
                title: videoResponse.Game.Title,
                logoUrl: videoResponse.Game.LogoUrl,
                id: videoResponse.Game._id,
            };
            this.video.isPlaying = false;
            this.video.id = videoResponse._id;
            this.isLoading = false;
            this.video.combo.id = this.comboClipId;
            this.video.contentType = 'Combo';
            this.video.isFavorited = this.favoriteVideos
                ? this.favoriteVideos.some((video) => video.id === this.video.id)
                : null;
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
                if (this.video.isPlaying && this.video.combo.startTime) {
                    this.setTimer();
                }
            }
        },

        async deleteVideo() {
            const response = await VideosService.getVideo(this.video.id);

            var comboCount = response.data.video.length;
            if (comboCount < 1) {
                await VideosService.deleteVideo(this.video.id);
            } else {
                var videos = response.data.video;
                var filteredCombos = videos.filter((video) => {
                    return video.Combo._id != this.comboClipId;
                });

                filteredCombos = filteredCombos.map((combo) => {
                    return {
                        Id: combo.ComboId,
                        StartTime: combo.Combo.StartTime,
                        EndTime: combo.Combo.EndTime,
                    };
                });

                var request = {
                    id: this.video.id,
                    Combos: filteredCombos,
                    GameId: this.video.game.id,
                };
                await VideosService.patchVideo(request);
            }
            var comboResponse = await CombosService.deleteCombo(this.comboClipId);
            this.$emit('video:delete', comboResponse);
        },

        queryCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        },

        setTimer() {
            this.$nextTick(function () {
                var setTimer = window.setInterval(() => {
                    this.getTimeStamp();
                }, 1000);
                if (!this.video.isPlaying) {
                    clearInterval(setTimer);
                }
                setTimer;
            });
        },

        getTimeStamp() {
            if (this.player) {
                this.videoCurrentTime = this.player.getCurrentTime();
            }
        },

        editVideo() {
            this.video.isEditing = true;
            eventbus.$emit('open:widget', {
                name: 'video',
                videoId: this.video.id,
            });
        },

        copyLink() {
            this.$copyText(`https://fighters-edge.com/combo/${this.comboClipId}`).then(() => {
                alert('combo copied');
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

        onComboWaypoint({ el, going, direction }) {
            var objectId = el.id;
            if (objectId) {
                if (going === this.$waypointMap.GOING_IN && direction) {
                    this.video.isPlaying = true;
                }
                if (going === this.$waypointMap.GOING_OUT && direction) {
                    this.video.isPlaying = false;
                }
            }
        },

        updateCollections(collections) {
            var collectionIds = collections.map((collection) => {
                return collection.id;
            });

            var comboObject = { id: this.comboClipId, contentType: 'Combo' };

            this.collections.forEach((collection) => {
                var collectionHasVideo = collection.videos.some((videos) => {
                    return videos.id === this.comboClipId;
                });

                var collectionShouldHaveVideo = collectionIds.some((collectionId) => {
                    return collectionId === collection.id;
                });

                if (collectionShouldHaveVideo && !collectionHasVideo) {
                    collection.videos.push(comboObject);
                    this.patchCollection(collection);
                } else if (!collectionShouldHaveVideo && collectionHasVideo) {
                    collection.videos = collection.videos.splice(
                        collection.videos.indexOf(comboObject),
                        1
                    );
                    this.patchCollection(collection);
                }
            });
            this.showCollections = false;
        },

        async patchCollection(collection) {
            var patchRequest = {
                id: collection.id,
                Videos: collection.videos,
                Name: collection.name,
            };

            await CollectionsService.updateCollection(patchRequest);
        },

        async getCollections() {
            var searchQuery = [
                {
                    queryName: 'OwnerId',
                    queryValue: this.account.id,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await CollectionsService.queryCollections(queryParameter);
            this.collections = response.data.collections.map((collection) => {
                return {
                    id: collection._id,
                    name: collection.Name,
                    ownerId: collection.OwnerId,
                    videos: collection.Videos.map((video) => {
                        return {
                            id: video.Id,
                            contentType: video.ContentType,
                        };
                    }),
                };
            });
        },

        assignCollection() {
            if (this.collections) {
                var collections = [];
                this.collections.forEach((collection) => {
                    var hasVideo = collection.videos.some((video) => {
                        return video.id === this.comboClipId;
                    });
                    if (hasVideo) {
                        collections.push(collection.id);
                    }
                });
                return collections;
            }
        },

        openCollections(video) {
            eventbus.$emit('open:widget', {
                name: 'collections',
                video: video,
            });
        },
    },
};
</script>

<style>
/* .combo-card {
    margin: 60px 0;
    min-height: 446px;
}

.combo-card .character-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-size: cover;
    background-position: top center;
    position: absolute;
    top: -15px;
    left: -25px;
    background-color: #e8e8e8;
}

.combo-card .character-bubble.player2 {
    right: -25px;
    left: auto;
}

.combo-card {
    background: #444;
    border: 5px solid #444;
    margin-bottom: 30px;
    position: relative;
    cursor: pointer;
    width: 100%;
    max-width: 570px;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.combo-card .combo-card .combo-stats {
    display: flex;
    justify-content: space-between;
}

.combo-card .combo-card .combo-stats p {
    font-size: 14px;
    color: #1ab097;
    font-weight: 600;
}

.combo-card .card-label {
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

.combo-card video {
    width: 100%;
}

.combo-card .character-name {
    margin-top: 20px;
}

.combo-card .character-name p {
    color: #fff;
    font-size: 20px;
    padding: 0 20px;
}

.combo-card .combo-stats {
    padding: 5px 20px 5px;
    display: flex;
    justify-content: space-between;
}

.combo-card .characters {
    padding: 10px 10px 15px;
}

.combo-card .video-ghost {
    height: 313px;
    width: 556px;
}

.combo-card .combo-input {
    padding: 0 20px;
    margin: 10px 0;
    font-style: italic;
}

.combo-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
}

.combo-card .card .edit-btn-container {
    padding: 10px;
}

.combo-card .card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #1ab097 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.combo-card .video-container {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
}

.combo-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

#app .combo-card .admin-controls button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .combo-card .mdi-heart {
    color: #fff;
}

#app .combo-card .tag {
    background: #3eb489;
    color: #fff;
    border-radius: 10px;
    padding: 3px 10px;
}

#app .combo-card .combo-tags {
    display: flex;
    width: 100%;
    padding: 5px 20px;
}

#app .combo-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .combo-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
} */

.combo-card {
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

.combo-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 25%;
    width: 100%;
}

.combo-card .versus {
    font-size: 25px;
    color: #3eb489;
    text-transform: uppercase;
}

.combo-card .card-label {
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

.combo-card .card-label {
    background: #3c73a8;
}

.combo-card video {
    width: 100%;
}

.combo-card .character-name span,
.combo-card .game-title span {
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

.combo-card .player-name {
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

.combo-card .player-name p {
    font-weight: 400;
    font-size: 18px;
}

.combo-card .character-name {
    padding-top: 0px;
    font-size: 13px;
    margin-bottom: 20px;
}

.combo-card .character-name p {
    font-size: 14px;
    color: #242832;
    font-weight: 300;
    margin-top: 3px;
}

.combo-card .character {
    padding: 5px;
}

.combo-card .game {
    margin-bottom: 20px;
}

.combo-card .game .img-container img,
.combo-card .character-name .img-container img {
    width: 30px;
}

.combo-card .game .img-container,
.combo-card .character-name .img-container {
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

.combo-card .video-ghost {
    height: 313px;
    width: 556px;
}

.combo-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
    min-height: 12em;
    color: #fff;
}

.combo-card.card .edit-btn-container {
    padding: 10px;
}

.combo-card.card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #4447e2 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.combo-card .video-container {
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

.combo-card .character-2 {
    top: 40px;
}

.combo-card .character-3 {
    top: 120px;
}

.combo-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

#app .combo-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .combo-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .combo-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.combo-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

.combo-card .combo-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.combo-card .combo-stats p {
    font-size: 14px;
    color: #fff;
    font-weight: 600;
}

.combo-card .player {
    border: 1px dashed #3eb489;
    position: relative;
    padding-top: 10px;
    margin-bottom: 40px;
}

#app.mobile.small-mobile .combo-card {
    flex-direction: column;
}

#app.mobile.small-mobile .combo-card .players {
    display: flex;
    width: 100%;
}

#app.mobile.small-mobile .combo-card .players .player {
    margin-bottom: 0;
}

#app.mobile.small-mobile .combo-card .video-container {
    padding-bottom: 56.25%;
}

#app.mobile.small-mobile .combo-card .aside {
    max-width: 100%;
}
</style>
