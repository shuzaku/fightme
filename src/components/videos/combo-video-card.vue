<!-- @format -->
<template>
    <div
        ref="videoList"
        class="combo-video-card"
        :class="{ 'twitter-card': video.combo.videoType === 'twitter' }"
    >
        <div v-if="isLoading" />
        <div v-else class="combo-card card">
            <div v-if="video.combo.videoType === 'twitter'" class="character-image">
                <img :src="video.combo.character.imageUrl" />
            </div>
            <div
                :id="waypointDomId"
                v-waypoint="{
                    active: true,
                    callback: onComboWaypoint,
                    options: intersectionOptions,
                }"
                class="video-container"
            >
                <youtube-media
                    v-if="video.combo.videoType === 'youtube'"
                    ref="youtubeRef"
                    :videoId="video.combo.clipUrl"
                    :player-width="556"
                    :player-height="313"
                    :player-vars="{
                        rel: 0,
                        autoplay: 0,
                        start: video.combo.startTime,
                        end: video.combo.endTime,
                    }"
                    :mute="true"
                    :playsinline="1"
                    @ready="ready"
                />

                <tweet v-else-if="video.combo.videoType === 'twitter'" id="1971339379064152483"
                    ><loading></loading
                ></tweet>

                <video v-else ref="videoRef" loop controls muted>
                    <source :src="video.combo.url" type="video/mp4" />
                </video>
            </div>
            <div class="card-label">Combo</div>
            <div v-if="!video.isEditing" class="aside">
                <div class="combo-info">
                    <div class="game">
                        <div class="game-title" @click="queryGame(video.game)">
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
                    <div class="character-name" @click="queryCharacter(video.combo.character)">
                        <p>
                            <span>
                                <div class="img-container">
                                    <img :src="video.combo.character.avatarUrl" />
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
                    <v-btn v-if="isAdmin" @click="deleteVideo">
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
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
<script>
import VideosService from '@/services/videos-service';
import CombosService from '@/services/combos-service';
import CollectionsService from '@/services/collections-service';
import CollectionSearch from '@/components/collection/collection-search';
import { Tweet, Moment, Timeline } from 'vue-tweet-embed';
import Loading from '@/components/common/loading';

import { eventbus } from '@/main';
import { pauseWaypointMedia } from '@/utils/pause-waypoint-media';
import { gameHrefFromLike, characterPagePath } from '@/utils/game-character-routes';

function mongoIdToString(val) {
    if (val == null || val === '') {
        return '';
    }
    if (typeof val === 'string' || typeof val === 'number') {
        return String(val);
    }
    if (typeof val === 'object') {
        if (val.$oid != null) {
            return String(val.$oid);
        }
        if (val._id != null) {
            return mongoIdToString(val._id);
        }
    }
    return String(val);
}

export default {
    name: 'ComboCard',
    components: {
        'collection-search': CollectionSearch,
        tweet: Tweet,
        loading: Loading,
    },

    props: {
        comboClipId: {
            type: [String, Number, Object],
            default: null,
        },
        /** Parent list row often has Video _id before comboClip GET returns (faster delete/patch). */
        backingVideoId: {
            type: [String, Number, Object],
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
                combo: {
                    id: null,
                    character: null,
                    damage: null,
                    hits: null,
                    inputs: null,
                    startTime: null,
                    endTime: null,
                    clipUrl: null,
                    videoType: null,
                    isFavorited: false,
                },
                isFavorited: false,
                isEditing: false,
            },
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
            player: null,
            collections: null,
            showCollections: false,
            isPlaying: false,
            /** Video.Combos[].Id — distinct from ComboClip _id (comboClipId). */
            comboDefinitionId: null,
        };
    },

    computed: {
        isAdmin() {
            return this.account && this.account.role === 'admin';
        },

        waypointDomId() {
            return mongoIdToString(this.comboClipId);
        },
    },

    watch: {
        isPlaying() {
            if (this.video.combo.videoType === 'uploaded') {
                if (this.isPlaying === true) {
                    this.$refs.videoRef.play();
                } else {
                    this.$refs.videoRef.pause();
                }
            } else if (this.video.combo.videoType === 'youtube' && this.player) {
                if (this.isPlaying === true) {
                    this.player.playVideo();
                } else {
                    this.player.pauseVideo();
                }
            }

            if (this.isPlaying && this.video.combo.startTime) {
                this.setTimer();
            }
        },

        videoCurrentTime() {
            if (this.videoCurrentTime > this.video.combo.endTime) {
                this.$refs.youtubeRef.player.seekTo(this.video.combo.startTime);
            }
        },
    },

    async created() {
        var initialVid = mongoIdToString(this.backingVideoId);
        if (initialVid) {
            this.video.id = initialVid;
        }
        if (this.account && this.account.id) {
            this.getCollections();
        }
        await this.getCombo();
        eventbus.$on('newVideoPosted', this.resetEditing);
    },

    beforeDestroy() {
        eventbus.$off('newVideoPosted', this.resetEditing);
    },

    methods: {
        async getCombo() {
            var clipParam = mongoIdToString(this.comboClipId);
            if (!clipParam) {
                this.isLoading = false;
                return;
            }
            const response = await CombosService.getComboClip(clipParam);
            var comboResponse = response.data.comboClip[0];
            if (!comboResponse) {
                this.isLoading = false;
                return;
            }

            this.video.combo = {
                id: comboResponse._id,
                character: {
                    id: comboResponse.Character._id,
                    name: comboResponse.Character.Name,
                    avatarUrl: comboResponse.Character.AvatarUrl,
                    imageUrl: comboResponse.Character.ImageUrl,
                    slug: comboResponse.Character.Slug || null,
                },
                damage: comboResponse.Combo.Damage,
                hits: comboResponse.Combo.Hits,
                inputs: comboResponse.Combo.Inputs[0],
                startTime: this.convertTime(comboResponse.StartTime),
                endTime: this.convertTime(comboResponse.EndTime),
                clipUrl: comboResponse.Url,
                videoType: comboResponse.VideoType.toLowerCase(),
                isFavorited: false,
            };

            // // Extract game data from combo-clip response if available
            if (comboResponse.Game) {
                this.video.game = {
                    title: comboResponse.Game.Title,
                    logoUrl: comboResponse.Game.LogoUrl,
                    id: comboResponse.Game._id,
                    abbreviation: comboResponse.Game.Abbreviation || null,
                };
            }

            var fromClip =
                (comboResponse.Video &&
                    (comboResponse.Video._id || comboResponse.Video.Id)) ||
                comboResponse.VideoId ||
                comboResponse.videoId;

            this.video.id =
                mongoIdToString(this.backingVideoId) || mongoIdToString(fromClip) || this.video.id;

            this.isPlaying = false;
            this.video.combo.id = clipParam;
            var rawComboDefId =
                comboResponse.ComboId ||
                (comboResponse.Combo && comboResponse.Combo._id) ||
                null;
            this.comboDefinitionId =
                rawComboDefId != null ? mongoIdToString(rawComboDefId) : null;
            this.video.contentType = 'Combo';
            this.video.isFavorited = this.favoriteVideos
                ? this.favoriteVideos.some((video) => video.id === this.video.id)
                : null;
            this.isLoading = false;
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
            // This method is now deprecated but kept for backwards compatibility
            // The getCombo method now handles all data extraction
            const response = await VideosService.getComboVideo(this.video.combo.clipUrl);
            var videoResponse = response.data.videos[0];
            this.video.combo.videoType = videoResponse.VideoType;
            this.video.game = {
                title: videoResponse.Game.Title,
                logoUrl: videoResponse.Game.LogoUrl,
                id: videoResponse.Game._id,
            };
            this.isPlaying = false;
            this.video.id = videoResponse._id;
            this.isLoading = false;
            this.video.combo.id = this.comboClipId;
            this.video.contentType = 'Combo';
            this.video.isFavorited = this.favoriteVideos
                ? this.favoriteVideos.some((video) => video.id === this.video.id)
                : null;
        },

        playVideo() {
            if (this.video.combo.videoType === 'uploaded') {
                if (this.isPlaying) {
                    this.$refs.videoRef.play();
                }
            } else if (this.video.combo.videoType === 'youtube') {
                if (this.isPlaying) {
                    this.player.playVideo();
                }
            }
        },

        ready(event) {
            this.player = event.target;
            if (this.isPlaying) {
                this.player.playVideo();
                if (this.video.combo.startTime) {
                    this.setTimer();
                }
            }
        },

        async deleteVideo() {
            if (
                !window.confirm(
                    'Delete this combo clip? This cannot be undone.'
                )
            ) {
                return;
            }
            var clipId = mongoIdToString(this.comboClipId);
            var vid = mongoIdToString(this.video.id);
            if (!clipId || !vid) {
                console.error('deleteVideo: missing comboClipId or video id', {
                    clipId: clipId,
                    videoId: vid,
                });
                return;
            }
            var defId = this.comboDefinitionId;
            if (!defId) {
                console.error('deleteVideo: missing combo definition id');
                return;
            }

            var defS = mongoIdToString(defId);

            function slotComboDefId(slot) {
                if (!slot || typeof slot !== 'object') {
                    return '';
                }
                var raw =
                    slot.Id != null
                        ? slot.Id
                        : slot.id != null
                          ? slot.id
                          : slot.ComboId != null
                            ? slot.ComboId
                            : slot._id != null
                              ? slot._id
                              : slot.Combo && slot.Combo._id;
                return mongoIdToString(raw);
            }

            function comboDefIdFromRow(row) {
                var sub = row.Combos || row.combos;
                if (Array.isArray(sub)) {
                    if (sub.length === 1) {
                        sub = sub[0];
                    } else if (sub.length > 1 && defS) {
                        var subPick = null;
                        for (var si = 0; si < sub.length; si++) {
                            if (slotComboDefId(sub[si]) === defS) {
                                subPick = sub[si];
                                break;
                            }
                        }
                        sub = subPick;
                    } else {
                        sub = null;
                    }
                }
                var raw =
                    row.ComboId != null
                        ? row.ComboId
                        : row.comboId != null
                          ? row.comboId
                          : row.Combo && row.Combo._id
                            ? row.Combo._id
                            : sub &&
                                (sub.Id != null
                                    ? sub.Id
                                    : sub.id != null
                                      ? sub.id
                                      : sub.ComboId != null
                                        ? sub.ComboId
                                        : sub._id);
                return mongoIdToString(raw);
            }

            function comboTimesFromRow(row) {
                var sub = row.Combos || row.combos;
                if (Array.isArray(sub)) {
                    if (sub.length === 1) {
                        sub = sub[0];
                    } else if (sub.length > 1 && defS) {
                        var tPick = null;
                        for (var ti = 0; ti < sub.length; ti++) {
                            if (slotComboDefId(sub[ti]) === defS) {
                                tPick = sub[ti];
                                break;
                            }
                        }
                        sub = tPick;
                    } else {
                        sub = null;
                    }
                }
                var startVal =
                    row.Combo && row.Combo.StartTime != null
                        ? row.Combo.StartTime
                        : sub && sub.StartTime != null
                          ? sub.StartTime
                          : null;
                var endVal =
                    row.Combo && row.Combo.EndTime != null
                        ? row.Combo.EndTime
                        : sub &&
                            (sub.EndTime != null
                                ? sub.EndTime
                                : sub.Endtime);
                return { StartTime: startVal, EndTime: endVal != null ? endVal : null };
            }

            try {
                const response = await VideosService.getVideo(vid);
                var rawVideo = response.data.video;
                var rows = Array.isArray(rawVideo)
                    ? rawVideo
                    : rawVideo != null
                      ? [rawVideo]
                      : [];

                var base = rows[0];
                var slotsRaw = base && (base.Combos || base.combos);
                var slotsList = null;
                if (Array.isArray(slotsRaw) && slotsRaw.length > 0) {
                    slotsList = slotsRaw;
                } else if (
                    slotsRaw &&
                    typeof slotsRaw === 'object' &&
                    !Array.isArray(slotsRaw)
                ) {
                    slotsList = [slotsRaw];
                } else if (base && base.Combo) {
                    if (Array.isArray(base.Combo) && base.Combo.length > 0) {
                        slotsList = base.Combo.map(function (c) {
                            return {
                                Id: c._id,
                                StartTime: c.StartTime,
                                EndTime: c.EndTime,
                            };
                        });
                    } else if (typeof base.Combo === 'object' && base.Combo._id) {
                        slotsList = [
                            {
                                Id: base.Combo._id,
                                StartTime:
                                    base.StartTime != null
                                        ? base.StartTime
                                        : base.Combo.StartTime,
                                EndTime:
                                    base.EndTime != null ? base.EndTime : base.Combo.EndTime,
                            },
                        ];
                    }
                }
                var combosPayload = [];
                var shouldDeleteVideo = false;

                // API shape A: one document per video with Combos as array or single subdoc
                if (rows.length === 1 && base && slotsList && slotsList.length > 0) {
                    var remainingSlots = slotsList.filter(function (slot) {
                        return slotComboDefId(slot) !== defS;
                    });
                    if (remainingSlots.length === 0) {
                        shouldDeleteVideo = true;
                    } else {
                        for (var si = 0; si < remainingSlots.length; si++) {
                            var slot = remainingSlots[si];
                            var slotIdStr = slotComboDefId(slot);
                            if (!slotIdStr || !/^[0-9a-fA-F]{24}$/.test(slotIdStr)) {
                                console.error(
                                    'deleteVideo: invalid combo Id in Combos[] slot',
                                    slot
                                );
                                return;
                            }
                            combosPayload.push({
                                Id: slotIdStr,
                                StartTime: slot.StartTime,
                                EndTime:
                                    slot.EndTime != null
                                        ? slot.EndTime
                                        : slot.Endtime,
                            });
                        }
                    }
                } else if (
                    rows.length === 1 &&
                    base &&
                    (!slotsList || slotsList.length === 0) &&
                    defS &&
                    /^[0-9a-fA-F]{24}$/.test(defS)
                ) {
                    // GET video/:id often omits Combos[] but populates Combo; if still missing, removing
                    // this clip implies dropping the root video when we cannot PATCH remaining slots.
                    shouldDeleteVideo = true;
                } else {
                    // API shape B: unwound — one row per combo slot (Combos is a single subdoc or ComboId set)
                    var filteredRows = rows.filter(function (row) {
                        return comboDefIdFromRow(row) !== defS;
                    });

                    if (filteredRows.length === 0 || rows.length === 0) {
                        shouldDeleteVideo = true;
                    } else {
                        for (var ri = 0; ri < filteredRows.length; ri++) {
                            var row = filteredRows[ri];
                            var idStr = comboDefIdFromRow(row);
                            if (!idStr || !/^[0-9a-fA-F]{24}$/.test(idStr)) {
                                console.error(
                                    'deleteVideo: invalid combo Id on row (need 24-char hex)',
                                    row
                                );
                                return;
                            }
                            var times = comboTimesFromRow(row);
                            combosPayload.push({
                                Id: idStr,
                                StartTime: times.StartTime,
                                EndTime: times.EndTime,
                            });
                        }
                    }
                }

                if (shouldDeleteVideo || rows.length === 0) {
                    await VideosService.deleteVideo(vid);
                } else {
                    var gameIdRaw =
                        (base && base.GameId != null ? base.GameId : null) ||
                        (base && base.Game && base.Game._id) ||
                        (this.video.game && this.video.game.id) ||
                        null;
                    var gameIdStr = mongoIdToString(gameIdRaw);
                    if (!gameIdStr || !/^[0-9a-fA-F]{24}$/.test(gameIdStr)) {
                        console.error('deleteVideo: invalid game id for patch', gameIdRaw);
                        return;
                    }
                    await VideosService.patchVideo({
                        id: vid,
                        GameId: gameIdStr,
                        ContentCreatorId: base.ContentCreatorId,
                        Player1Id: base.Player1Id,
                        Player2Id: base.Player2Id,
                        Player1CharacterId: base.Player1CharacterId,
                        Player1Character2Id: base.Player1Character2Id,
                        Player1Character3Id: base.Player1Character3Id,
                        Player2CharacterId: base.Player2CharacterId,
                        Player2Character2Id: base.Player2Character2Id,
                        Player2Character3Id: base.Player2Character3Id,
                        WinnerId: base.WinnerId,
                        Tags: base.Tags,
                        Combos: combosPayload,
                    });
                }
                var comboDel = await CombosService.deleteComboClip(clipId);
                this.$emit('video:delete', comboDel);
            } catch (e) {
                console.error('deleteVideo failed', e);
            }
        },

        queryCharacter(characterOrId) {
            var ch =
                typeof characterOrId === 'object' && characterOrId != null
                    ? characterOrId
                    : { id: characterOrId };
            var path = characterPagePath(this.video.game, ch);
            if (path) {
                this.$router.push(path);
            }
        },

        queryGame(gameLike) {
            var path = gameHrefFromLike(gameLike);
            if (path) {
                this.$router.push(path);
            }
        },

        setTimer() {
            this.$nextTick(function () {
                var setTimer = window.setInterval(() => {
                    this.getTimeStamp();
                }, 1000);
                if (!this.isPlaying) {
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
            var cid = mongoIdToString(this.comboClipId);
            if (!cid) {
                console.error('Combo clip ID is not available for editing');
                return;
            }
            this.video.isEditing = true;
            eventbus.$emit('open:widget', {
                name: 'combo',
                comboClipId: cid,
                videoId: mongoIdToString(this.video.id),
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
            if (!objectId) {
                return;
            }
            const isYoutube =
                this.video.combo.videoType &&
                String(this.video.combo.videoType).toLowerCase() === 'youtube';

            if (going === this.$waypointMap.GOING_OUT) {
                this.isPlaying = false;
                this.$emit('input', false);
                pauseWaypointMedia({
                    videoType: this.video.combo.videoType,
                    videoRef: this.$refs.videoRef,
                    youtubePlayer:
                        this.player ||
                        (this.$refs.youtubeRef && this.$refs.youtubeRef.player) ||
                        null,
                });
                return;
            }
            if (going === this.$waypointMap.GOING_IN && direction && !isYoutube) {
                this.isPlaying = true;
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

        resetEditing() {
            this.video.isEditing = false;
        },
    },
};
</script>

<style>
.combo-video-card .combo-card {
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

.combo-video-card .combo-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 25%;
    width: 100%;
}

.combo-video-card .combo-card .versus {
    font-size: 25px;
    color: #3eb489;
    text-transform: uppercase;
}

.combo-video-card .combo-card .card-label {
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

.combo-video-card .combo-card .card-label {
    background: #3c73a8;
}

.combo-video-card .combo-card video {
    width: 100%;
}

.combo-video-card .combo-card .character-name span,
.combo-video-card .combo-card .game-title span {
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

.combo-video-card .combo-card .player-name {
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

.combo-video-card .combo-card .player-name p {
    font-weight: 400;
    font-size: 18px;
}

.combo-video-card .combo-card .character-name {
    padding-top: 0px;
    font-size: 13px;
    margin-bottom: 20px;
}

.combo-video-card .combo-card .character-name p {
    font-size: 14px;
    color: #242832;
    font-weight: 300;
    margin-top: 3px;
}

.combo-video-card .combo-card .character {
    padding: 5px;
}

.combo-video-card .combo-card .game {
    margin-bottom: 20px;
}

.combo-video-card .combo-card .game .img-container img,
.combo-video-card .combo-card .character-name .img-container img {
    width: 30px;
}

.combo-video-card .combo-card .game .img-container,
.combo-video-card .combo-card .character-name .img-container {
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

.combo-video-card .combo-card .video-ghost {
    height: 313px;
    width: 556px;
}

.combo-video-card .combo-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
    min-height: 12em;
    color: #fff;
}

.combo-video-card .combo-card.card .edit-btn-container {
    padding: 10px;
}

.combo-video-card .combo-card.card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #4447e2 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.combo-video-card .video-container {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    position: relative;
    padding-bottom: 42.25%;
    height: 0;
    overflow: hidden;
    min-width: 75%;
}

.combo-video-card.twitter-card .character-image {
    display: flex;
    align-items: center;
    justify-content: center;
}

.combo-video-card.twitter-card .character-image img {
    max-width: 300px;
}

.combo-video-card.twitter-card .combo-card .video-container {
    padding-bottom: 0;
    height: 610px;
    min-width: initial;
    width: 520px;
    display: flex;
    align-items: center;
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

.combo-video-card .combo-card .character-2 {
    top: 40px;
}

.combo-video-card .combo-card .character-3 {
    top: 120px;
}

.combo-video-card .combo-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}

#app .combo-video-card .combo-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .combo-video-card .combo-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .combo-video-card .combo-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.combo-video-card .combo-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

.combo-video-card .combo-card .combo-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.combo-video-card .combo-card .combo-stats p {
    font-size: 14px;
    color: #fff;
    font-weight: 600;
}

.combo-video-card .combo-card .player {
    border: 1px dashed #3eb489;
    position: relative;
    padding-top: 10px;
    margin-bottom: 40px;
}

.combo-video-card .twitter-tweet iframe {
    width: 450px !important;
}

#app.mobile.small-mobile .combo-video-card .combo-card {
    flex-direction: column;
}

#app.mobile.small-mobile .combo-video-card .combo-card .players {
    display: flex;
    width: 100%;
}

#app.mobile.small-mobile .combo-video-card .combo-card .players .player {
    margin-bottom: 0;
}

#app.mobile.small-mobile .combo-video-card .combo-card .video-container {
    padding-bottom: 56.25%;
}

#app.mobile.small-mobile .combo-video-card .combo-card .aside {
    max-width: 100%;
}
</style>
