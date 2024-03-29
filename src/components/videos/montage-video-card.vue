<!-- @format -->
<template>
    <div ref="videoList" class="montage-video-card">
        <div v-if="isLoading"></div>
        <div v-else class="montage-card card">
            <div
                :id="montageId"
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
                    :video-id="video.url"
                    :player-width="556"
                    :player-height="313"
                    :player-vars="{ rel: 0, start: video.startTime, end: video.endTime }"
                    :mute="true"
                    :playsinline="1"
                    @ready="ready"
                />
            </div>
            <div class="card-label">Montage</div>
            <div v-for="(character, index) in video.montage.characters" :key="character.id">
                <div
                    :class="[
                        'character-bubble',
                        `character-${index + 1}`,
                        character.name.toLowerCase(),
                    ]"
                    :style="{ backgroundImage: `url('${character.imageUrl}')` }"
                />
            </div>
            <div v-if="!video.isEditing" class="characters">
                <div class="player">
                    <div
                        v-for="player in video.montage.players"
                        :key="player.id"
                        class="heavy-weight player-name"
                        @click="queryPlayer(player.id)"
                    >
                        <p>{{ player.name }}</p>
                    </div>
                    <div v-for="(character, index) in video.montage.characters" :key="index">
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
            <v-btn v-if="!video.isFavorited" class="favorite-button" @click="favoriteVideo()">
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
</template>

<script>
import VideosService from '@/services/videos-service';
import MontagesService from '@/services/montages-service';
import CollectionSearch from '@/components/collection/collection-search';
import CollectionsService from '@/services/collections-service';
import { eventbus } from '@/main';

export default {
    name: 'VideoCard',
    components: {
        'collection-search': CollectionSearch,
    },

    props: {
        montageId: {
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
                url: null,
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
        formattedInputs() {
            return this.video.combo.inputs.join(' > ');
        },
        isAdmin() {
            return this.account.role === 'Admin User';
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

            if (this.value === true && this.video.combo.startTime) {
                this.setTimer();
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > parseInt(this.video.combo.endTime)) {
                this.$refs.youtubeRef.player.seekTo(this.video.combo.startTime);
            }
        },
    },

    created() {
        if (this.account.id) {
            this.getCollections();
        }
        this.getMontage();
        this.playVideo();
    },

    methods: {
        async getMontage() {
            const response = await MontagesService.getMontage(this.montageId);
            var montageResponse = response.data.montages[0];
            this.video.montage = {
                players: montageResponse.Player.map((player) => {
                    return {
                        id: player._id,
                        name: player.Name,
                    };
                }),
                characters: montageResponse.Characters.map((character) => {
                    return {
                        id: character._id,
                        imageUrl: character.AvatarUrl,
                        name: character.Name,
                    };
                }),
                collections: this.assignCollection(this.montageId),
            };
            this.video.url = montageResponse.VideoUrl;
            this.getVideo();
        },

        async getVideo() {
            const response = await VideosService.getMatchVideo(this.video.url);

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
            this.video.montage.id = this.montageId;
            this.video.contentType = 'Montage';
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
                if (this.video.isPlaying && this.video.startTime) {
                    this.setTimer();
                }
            }
        },

        async deleteVideo() {
            await VideosService.deleteVideo(this.video.id);
            var montageResponse = await MontagesService.deleteMatch(this.video.montageId.id);

            this.$emit('video:delete', montageResponse);
        },

        queryPlayer(playerId) {
            this.$router.push(`/player/${playerId}`);
        },

        queryCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
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

        editVideo() {
            this.video.isEditing = true;
            eventbus.$emit('open:widget', {
                name: 'video',
                videoId: this.video.id,
            });
        },

        copyLink() {
            this.$copyText(`https://fighters-edge.com/montage/${this.video.id}`).then(() => {
                alert('montage copied');
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
        },

        updateCollections(collections) {
            var collectionIds = collections.map((collection) => {
                return collection.id;
            });

            var comboObject = { id: this.montageId, contentType: 'Montage' };

            this.collections.forEach((collection) => {
                var collectionHasVideo = collection.videos.some((videos) => {
                    return videos.id === this.montageId;
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
                        return video.id === this.montageId;
                    });
                    if (hasVideo) {
                        collections.push(collection.id);
                    }
                });
                return collections;
            } else {
                return [];
            }
        },
    },
};
</script>

<style>
.montage-video-card {
    margin: 60px 0;
}

.montage-video-card .character-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-position: top center;
    position: absolute;
    top: -15px;
    left: -25px;
    background-color: #e8e8e8;
    background-size: contain;
}

.montage-video-card {
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

.montage-video-card .card-label {
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

.montage-video-card .montage-card .card-label {
    background: #fc73c4;
}

.montage-video-card video {
    width: 100%;
}

.montage-video-card .character-name {
    padding: 20px 20px 0;
    color: #fff;
    font-size: 20px;
}

.montage-video-card .player-name {
    color: #fff;
    font-size: 20px;
    padding: 0 20px;
}

.montage-video-card .character-name {
    padding-top: 0px;
    font-size: 13px;
}

.montage-video-card .character-name p {
    font-size: 14px;
    color: #3eb489;
    font-weight: 300;
    margin-top: 3px;
}

.montage-video-card .characters {
    padding: 10px 10px 15px;
}

.montage-video-card .video-ghost {
    height: 313px;
    width: 556px;
}

.montage-video-card .card .edit-btn-container {
    padding: 10px;
}

.montage-video-card .card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #1ab097 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.montage-video-card .video-container {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
}

.montage-video-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

#app .montage-video-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .montage-video-card .admin-controls button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-radius: 50%;
}
</style>
