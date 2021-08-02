<!-- @format -->
<template>
    <div ref="videoList">
        <div v-if="isLoading" />
        <div v-else class="combo-card card video-card">
            <div
                :id="comboId"
                v-waypoint="{
                    active: true,
                    callback: onComboWaypoint,
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
            <div class="card-label">Combo</div>
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
            <div class="combo-tags" v-if="video.combo.tags">
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
                    <v-icon light>
                        mdi-plus
                    </v-icon>
                </v-btn>
                <!-- <v-btn @click="editVideo()">
                    <v-icon dark>
                        mdi-wrench
                    </v-icon>
                </v-btn>
                <v-btn @click="deleteVideo(video.combo, index)">
                    <v-icon dark>
                        mdi-delete
                    </v-icon>
                </v-btn> -->
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
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';
import CollectionsService from '@/services/collections-service';
import CollectionSearch from '@/components/collection/collection-search';

import { eventbus } from '@/main';

export default {
    name: 'NewVideoCard',
    components: {
        'collection-search': CollectionSearch
    },

    props: {
        comboId: {
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
        },
        account: {
            type: Object,
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
                isFavorited: false
            },
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1
            },
            player: null,
            collections: null,
            showCollections: false
        };
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
            if (this.videoCurrentTime > parseInt(this.video.combo.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.combo.startTime);
            }
        }
    },

    created() {
        this.getCollections();
        this.getCombo();
        this.playVideo();
    },

    methods: {
        async getCombo() {
            const response = await CombosService.getCombo(this.comboId);
            var comboResponse = response.data.combos[0];
            this.video.combo = {
                character: {
                    id: comboResponse.Character._id,
                    name: comboResponse.Character.Name,
                    imageUrl: comboResponse.Character.ImageUrl
                },
                damage: comboResponse.Damage,
                hits: comboResponse.Hits,
                tags:
                    comboResponse.Tags.length > 0
                        ? comboResponse.Tags.map(tag => {
                              return {
                                  name: tag.TagName,
                                  id: tag._id
                              };
                          })
                        : null,
                inputs: comboResponse.Inputs,
                startTime: null,
                endtime: null
            };
            this.getVideo();
        },

        async getVideo() {
            const response = await VideosService.getComboVideo(this.comboId);

            var videoResponse = response.data.videos[0];
            this.video.url = videoResponse.Url;
            this.video.videoType = videoResponse.VideoType;
            this.video.game = {
                title: videoResponse.Game.Title,
                logoUrl: videoResponse.Game.LogoUrl,
                id: videoResponse.Game._id
            };

            this.video.combo.startTime = parseInt(videoResponse.Combos.StartTime);
            this.video.combo.endTime = parseInt(videoResponse.Combos.Endtime);
            this.video.combo.id = this.comboId;
            this.video.isPlaying = false;
            this.video.contentType = 'Combo';
            this.video.isFavorited = this.favoriteVideos
                ? this.favoriteVideos.some(video => video.id === this.comboId)
                : null;
            this.video.collections = this.assignCollection(this.comboId);
            this.isLoading = false;
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

        queryCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        },

        setTimer() {
            this.$nextTick(function() {
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
            eventbus.$emit('open:videoWidget', {
                name: 'video',
                videoId: this.video.id
            });
        },

        copyLink() {
            this.$copyText(`https://fighters-edge.com/combo/${this.comboId}`).then(() => {
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
            var collectionIds = collections.map(collection => {
                return collection.id;
            });

            var comboObject = { id: this.comboId, contentType: 'Combo' };

            this.collections.forEach(collection => {
                var collectionHasVideo = collection.videos.some(videos => {
                    return videos.id === this.comboId;
                });

                var collectionShouldHaveVideo = collectionIds.some(collectionId => {
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
        },

        async patchCollection(collection) {
            var patchRequest = {
                id: collection.id,
                Videos: collection.videos,
                Name: collection.name
            };

            await CollectionsService.updateCollection(patchRequest);
        },

        async getCollections() {
            var searchQuery = [
                {
                    queryName: 'OwnerId',
                    queryValue: this.account.id
                }
            ];

            var queryParameter = {
                skip: this.skip,
                searchQuery: searchQuery
            };

            const response = await CollectionsService.queryCollections(queryParameter);
            this.collections = response.data.collections.map(collection => {
                return {
                    id: collection._id,
                    name: collection.Name,
                    ownerId: collection.OwnerId,
                    videos: collection.Videos.map(video => {
                        return {
                            id: video.Id,
                            contentType: video.ContentType
                        };
                    })
                };
            });
        },

        assignCollection() {
            if (this.collections) {
                var collections = [];
                this.collections.forEach(collection => {
                    var hasVideo = collection.videos.some(video => {
                        return video.id === this.comboId;
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
                video: video
            });
        }
    }
};
</script>

<style>
.video-card {
    margin: 60px 0;
    min-height: 446px;
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

#app .video-card .admin-controls button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .video-card .mdi-heart {
    color: #fff;
}

#app .video-card .tag {
    background: #3eb489;
    color: #fff;
    border-radius: 10px;
    padding: 3px 10px;
}

#app .video-card .combo-tags {
    display: flex;
    width: 100%;
    padding: 5px 20px;
}
</style>
