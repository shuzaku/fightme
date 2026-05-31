<!-- @format -->
<template>
    <div
        ref="videoList"
        class="combo-video-card"
    >
        <div v-if="isLoading" />
        <div v-else class="combo-card card">

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
                    }"
                    :mute="true"
                    :playsinline="1"
                    @ready="ready"
                    @playing="onYoutubePlaying"
                    @paused="onYoutubePaused"
                    @ended="onYoutubeEnded"
                />

                <video
                    v-else-if="video.combo.videoType === 'twitter' && twitterVideoUrl"
                    ref="twitterVideoRef"
                    controls
                    muted
                    class="twitter-video"
                    :poster="twitterPosterUrl || undefined"
                    :src="twitterVideoUrl"
                    @ended="onVideoEnded"
                    @timeupdate="onVideoTimeUpdate"
                ></video>

                <div v-else-if="video.combo.videoType === 'twitter' && !twitterVideoUrl" class="twitter-loading">
                    <loading></loading>
                </div>

                <video v-else ref="videoRef" controls muted
                    @ended="onVideoEnded"
                    @timeupdate="onVideoTimeUpdate"
                >
                    <source :src="video.combo.clipUrl" type="video/mp4" />
                </video>
            </div>
            <div class="card-label">Combo</div>
            <div v-if="!video.isEditing" class="aside">
                <div class="combo-info">
                    <div class="game-character-row">
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
                        <div class="game">
                            <div class="game-title" @click="queryGame(video.game)">
                                <img :src="video.game.logoUrl" />
                            </div>
                        </div>
                    </div>
                    <div class="combo-stats">
                        <p v-if="video.combo.hits">{{ video.combo.hits }} Hits</p>
                        <p v-if="video.combo.damage">{{ video.combo.damage }} Damage</p>
                    </div>
                    <div class="combo-input">
                        <div class="inputs combo-inputs-icons">
                            <div
                                v-for="(row, rowIndex) in parsedInputRows"
                                :key="rowIndex"
                                class="input-row"
                            >
                                <div
                                    v-for="(input, inputIndex) in row"
                                    :key="inputIndex"
                                    class="input-item"
                                    :style="{ zIndex: row.length - inputIndex }"
                                    :class="{
                                        bracketed: input.bracketed,
                                        'input-even': getGlobalInputIndex(rowIndex, inputIndex) % 2 === 0,
                                        'input-odd': getGlobalInputIndex(rowIndex, inputIndex) % 2 === 1,
                                    }"
                                >
                                    <template v-for="(part, partIndex) in getInputParts(input.text)">
                                        <img
                                            v-if="part.type === 'icon'"
                                            :key="'icon-' + partIndex"
                                            :src="part.value"
                                            :alt="part.label"
                                            class="input-icon"
                                        />
                                        <span v-else :key="'text-' + partIndex" class="input-text">{{ part.value }}</span>
                                    </template>                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="video.combo.tags" class="combo-tags">
                    <p v-for="tag in video.combo.tags" :key="tag.id" class="tag">#{{ tag.name }}</p>
                </div>
                <div v-if="twitterText" class="tweet-message">
                    <a
                        :href="`https://x.com/i/status/${video.combo.clipUrl}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="tweet-message-link"
                    >
                        <p v-if="twitterAuthor" class="tweet-author">
                            <span class="tweet-author-name">{{ twitterAuthor }}</span>
                            <span v-if="twitterAuthorHandle" class="tweet-author-handle">@{{ twitterAuthorHandle }}</span>
                        </p>
                        <p class="tweet-text">{{ twitterText }}</p>
                    </a>
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
<script>
import CombosService from '@/services/combos-service';
import { resolveApiBaseURL } from '@/services/Api';
import CollectionsService from '@/services/collections-service';
import CollectionSearch from '@/components/collection/collection-search';
import { Tweet, Moment, Timeline } from 'vue-tweet-embed';import Loading from '@/components/common/loading';

import { eventbus } from '@/main';
import { pauseWaypointMedia } from '@/utils/pause-waypoint-media';
import { gameHrefFromLike, characterPagePath } from '@/utils/game-character-routes';

// Input icons
import arrow1 from '@/assets/icons/inputs/arrows/1.png';
import arrow2 from '@/assets/icons/inputs/arrows/2.png';
import arrow3 from '@/assets/icons/inputs/arrows/3.png';
import arrow4 from '@/assets/icons/inputs/arrows/4.png';
import arrow6 from '@/assets/icons/inputs/arrows/6.png';
import arrow7 from '@/assets/icons/inputs/arrows/7.png';
import arrow8 from '@/assets/icons/inputs/arrows/8.png';
import arrow9 from '@/assets/icons/inputs/arrows/9.png';
import sf6Lp from '@/assets/icons/inputs/sf6/lp.png';
import sf6Mp from '@/assets/icons/inputs/sf6/mp.png';
import sf6Hp from '@/assets/icons/inputs/sf6/hp.png';
import sf6Lk from '@/assets/icons/inputs/sf6/lk.png';
import sf6Mk from '@/assets/icons/inputs/sf6/mk.png';
import sf6Hk from '@/assets/icons/inputs/sf6/hk.png';
import ggstP from '@/assets/icons/inputs/ggst/P.png';
import ggstK from '@/assets/icons/inputs/ggst/K.png';
import ggstS from '@/assets/icons/inputs/ggst/S.png';
import ggstHS from '@/assets/icons/inputs/ggst/HS.png';
import ggstD from '@/assets/icons/inputs/ggst/D.png';
import xko2H from '@/assets/icons/inputs/2xko/H.png';
import xko2L from '@/assets/icons/inputs/2xko/L.png';
import xko2M from '@/assets/icons/inputs/2xko/M.png';
import xko2S1 from '@/assets/icons/inputs/2xko/S1.png';
import xko2S2 from '@/assets/icons/inputs/2xko/s2.png';
import xko2T from '@/assets/icons/inputs/2xko/T.png';
import cotwA from '@/assets/icons/inputs/cotw/a.png';
import cotwB from '@/assets/icons/inputs/cotw/b.png';
import cotwBr from '@/assets/icons/inputs/cotw/br.png';
import cotwC from '@/assets/icons/inputs/cotw/c.png';
import cotwD from '@/assets/icons/inputs/cotw/d.png';
import cotwFe from '@/assets/icons/inputs/cotw/fe.png';
import cotwRev from '@/assets/icons/inputs/cotw/rev.png';
import gbvsrH from '@/assets/icons/inputs/gbvsr/H.png';
import gbvsrL from '@/assets/icons/inputs/gbvsr/L.png';
import gbvsrM from '@/assets/icons/inputs/gbvsr/M.png';
import gbvsrU from '@/assets/icons/inputs/gbvsr/U.png';
import t8_1 from '@/assets/icons/inputs/t8/1.png';
import t8_2 from '@/assets/icons/inputs/t8/2.png';
import t8_3 from '@/assets/icons/inputs/t8/3.png';
import t8_4 from '@/assets/icons/inputs/t8/4.png';
import t8_12 from '@/assets/icons/inputs/t8/12.png';
import t8_13 from '@/assets/icons/inputs/t8/13.png';
import t8_14 from '@/assets/icons/inputs/t8/14.png';
import t8_23 from '@/assets/icons/inputs/t8/23.png';
import t8_24 from '@/assets/icons/inputs/t8/24.png';
import t8_34 from '@/assets/icons/inputs/t8/34.png';
import qcf from '@/assets/icons/inputs/directional/qcf.png';
import qcb from '@/assets/icons/inputs/directional/qcb.png';
import dp from '@/assets/icons/inputs/directional/dp.png';
import motion421 from '@/assets/icons/inputs/directional/421.png';
import motion360 from '@/assets/icons/inputs/directional/360.png';
import r360 from '@/assets/icons/inputs/directional/r360.png';
import motion180f from '@/assets/icons/inputs/directional/180f.png';
import motion180b from '@/assets/icons/inputs/directional/180b.png';
import holdBack from '@/assets/icons/inputs/directional/hold back.png';
import holdDownIcon from '@/assets/icons/inputs/directional/hold down.png';
import dashIcon from '@/assets/icons/inputs/ggst/dash.png';

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
            _timerId: null,
            twitterVideoUrl: null,
            twitterPosterUrl: null,
            twitterText: null,
            twitterAuthor: null,
            twitterAuthorHandle: null,
            arrowIcons: {
                '1': arrow1, '2': arrow2, '3': arrow3, '4': arrow4,
                '6': arrow6, '7': arrow7, '8': arrow8, '9': arrow9,
            },
            allGameIcons: {
                sf6: { lp: sf6Lp, mp: sf6Mp, hp: sf6Hp, lk: sf6Lk, mk: sf6Mk, hk: sf6Hk },
                ggst: { P: ggstP, K: ggstK, S: ggstS, HS: ggstHS, D: ggstD },
                '2xko': { H: xko2H, L: xko2L, M: xko2M, S1: xko2S1, S2: xko2S2, T: xko2T },
                cotw: { a: cotwA, b: cotwB, br: cotwBr, c: cotwC, d: cotwD, fe: cotwFe, rev: cotwRev },
                gbvsr: { H: gbvsrH, L: gbvsrL, M: gbvsrM, U: gbvsrU },
                t8: { '1': t8_1, '2': t8_2, '3': t8_3, '4': t8_4, '12': t8_12, '13': t8_13, '14': t8_14, '23': t8_23, '24': t8_24, '34': t8_34 },
            },
            motionIcons: {
                qcf, qcb, dp, '421': motion421, '360': motion360, r360,
                '180f': motion180f, '180b': motion180b,
                'hold back': holdBack, 'hold down': holdDownIcon,
            },
            specialIcons: { dash: dashIcon },
        };
    },

    computed: {
        isAdmin() {
            return this.account && this.account.role === 'admin';
        },

        waypointDomId() {
            return mongoIdToString(this.comboClipId);
        },

        attackIcons() {
            var abbrev = this.video.game && this.video.game.abbreviation
                ? this.video.game.abbreviation.toLowerCase()
                : null;
            return (abbrev && this.allGameIcons[abbrev]) || this.allGameIcons.sf6;
        },

        parsedInputRows() {
            if (!this.video.combo.inputs) return [];
            var inputs = this.parseInputs(this.video.combo.inputs);
            var rows = [];
            var itemsPerRow = 4;
            for (var i = 0; i < inputs.length; i += itemsPerRow) {
                rows.push(inputs.slice(i, i + itemsPerRow));
            }
            return rows;
        },
    },

    watch: {
        isPlaying() {
            if (this.video.combo.videoType === 'uploaded') {
                if (this.isPlaying === true) {
                    this.$refs.videoRef.currentTime = this.video.combo.startTime || 0;
                    this.$refs.videoRef.play();
                    this.setTimer();
                } else {
                    this.$refs.videoRef.pause();
                    this.clearTimer();
                }
            } else if (this.video.combo.videoType === 'youtube' && this.player) {
                if (this.isPlaying === false) {
                    this.player.pauseVideo();
                    this.clearTimer();
                }
                // play + timer are started via onYoutubePlaying once YouTube confirms it's playing
            }
        },

        videoCurrentTime() {
            const endTime = this.video.combo.endTime;
            if (endTime && this.videoCurrentTime >= endTime) {
                const startTime = this.video.combo.startTime || 0;
                this.player.seekTo(startTime, true);
                this.player.playVideo();
            }
        },
    },

    async created() {
        if (this.account && this.account.id) {
            this.getCollections();
        }
        await this.getCombo();
        eventbus.$on('newVideoPosted', this.resetEditing);
    },

    beforeDestroy() {
        eventbus.$off('newVideoPosted', this.resetEditing);
        this.clearTimer();
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
                damage: comboResponse.Damage,
                hits: comboResponse.Hits,
                inputs: comboResponse.Inputs && comboResponse.Inputs[0],
                startTime: comboResponse.StartTime ? this.convertTime(comboResponse.StartTime) : null,
                endTime: comboResponse.EndTime ? this.convertTime(comboResponse.EndTime) : null,
                clipUrl: comboResponse.Url,
                videoType: comboResponse.VideoType ? comboResponse.VideoType.toLowerCase() : null,
                isFavorited: false,
            };

            if (this.video.combo.videoType === 'twitter' && this.video.combo.clipUrl) {
                try {
                    const tvResponse = await CombosService.getTwitterVideo(this.video.combo.clipUrl);
                    console.log('[twitter-video] response:', tvResponse.data);
                    if (tvResponse.data.videoUrl) {
                        // Use resolveApiBaseURL() so we pick the right host
                        // at runtime — `process.env.VUE_APP_API_URL` is baked
                        // in at build time and points at localhost in the
                        // repo's .env, which leaks into production bundles.
                        this.twitterVideoUrl =
                            resolveApiBaseURL() +
                            '/twitter-video-stream?tweetId=' +
                            this.video.combo.clipUrl;
                        this.twitterPosterUrl = tvResponse.data.posterUrl || null;
                        this.twitterText = tvResponse.data.text || null;
                        this.twitterAuthor = tvResponse.data.author || null;
                        this.twitterAuthorHandle = tvResponse.data.authorHandle || null;
                    }
                } catch (e) {
                    console.error('Failed to fetch Twitter video URL', e);
                }
            }

            if (comboResponse.Game) {
                this.video.game = {
                    title: comboResponse.Game.Title,
                    logoUrl: comboResponse.Game.LogoUrl,
                    id: comboResponse.Game._id,
                    abbreviation: comboResponse.Game.Abbreviation || null,
                };
            }

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

        async deleteVideo() {
            if (!window.confirm('Delete this combo clip? This cannot be undone.')) {
                return;
            }
            var clipId = mongoIdToString(this.comboClipId);
            if (!clipId) {
                console.error('deleteVideo: missing comboClipId');
                return;
            }
            try {
                var comboDel = await CombosService.deleteComboClip(clipId);
                this.$emit('video:delete', comboDel);
            } catch (e) {
                console.error('deleteVideo failed', e);
            }
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
                this.setTimer();
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
            this.clearTimer();
            this._timerId = window.setInterval(() => {
                this.getTimeStamp();
            }, 250);
        },

        clearTimer() {
            if (this._timerId) {
                clearInterval(this._timerId);
                this._timerId = null;
            }
        },

        getTimeStamp() {
            if (this.player) {
                this.videoCurrentTime = this.player.getCurrentTime();
            }
        },

        onYoutubePlaying() {
            this.isPlaying = true;
            this.setTimer();
        },

        onYoutubePaused() {
            this.clearTimer();
        },

        onYoutubeEnded() {
            const startTime = this.video.combo.startTime || 0;
            this.player.seekTo(startTime, true);
            this.player.playVideo();
        },

        onVideoEnded() {
            const startTime = this.video.combo.startTime || 0;
            this.$refs.videoRef.currentTime = startTime;
            this.$refs.videoRef.play();
        },

        onVideoTimeUpdate() {
            const endTime = this.video.combo.endTime;
            if (endTime && this.$refs.videoRef.currentTime >= endTime) {
                const startTime = this.video.combo.startTime || 0;
                this.$refs.videoRef.currentTime = startTime;
                this.$refs.videoRef.play();
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

        parseInputs(inputString) {
            if (!inputString) return [];
            return inputString
                .split('>')
                .map(function(s) { return s.trim(); })
                .filter(function(s) { return s.length > 0; })
                .map(function(s) {
                    var bracketed = s.startsWith('[') && s.endsWith(']');
                    var text = bracketed ? s.slice(1, -1).trim() : s;
                    return { text: text, bracketed: bracketed };
                });
        },

        getInputIcon(notation) {
            if (!notation) return null;
            if (/^[1-9]$/.test(notation)) return this.arrowIcons[notation] || null;
            if (this.motionIcons[notation]) return this.motionIcons[notation];
            var motionMap = { '236': 'qcf', '214': 'qcb', '623': 'dp', '41236': '421', '63214': '421' };
            if (motionMap[notation] && this.motionIcons[motionMap[notation]]) return this.motionIcons[motionMap[notation]];
            if (notation === 'dash') return this.specialIcons.dash;

            var lower = notation.toLowerCase();
            var upper = notation.toUpperCase();
            var candidates = [notation, upper, lower];

            for (var i = 0; i < candidates.length; i++) {
                if (this.attackIcons[candidates[i]]) return this.attackIcons[candidates[i]];
            }

            var sets = Object.values(this.allGameIcons);
            for (var s = 0; s < sets.length; s++) {
                for (var c = 0; c < candidates.length; c++) {
                    if (sets[s][candidates[c]]) return sets[s][candidates[c]];
                }
            }

            return null;
        },

        getInputParts(text) {
            if (!text) return [{ type: 'text', value: text }];

            var trimmed = text.trim();
            if (!trimmed) return [];

            // Split simultaneous inputs on '+' first (e.g. MK+HK, MP+HP)
            if (trimmed.indexOf('+') !== -1) {
                var combined = [];
                var plusParts = trimmed.split('+');
                for (var p = 0; p < plusParts.length; p++) {
                    if (plusParts[p].trim()) {
                        var subParts = this.getInputParts(plusParts[p]);
                        combined = combined.concat(subParts);
                        if (p < plusParts.length - 1) {
                            combined.push({ type: 'text', value: '+' });
                        }
                    }
                }
                return combined;
            }

            var parts = [];
            var remaining = trimmed;

            // j. / c. prefix
            if (/^[jJcC]\./i.test(remaining)) {
                parts.push({ type: 'text', value: remaining.slice(0, 2) });
                remaining = remaining.slice(2).trim();
            } else if (/^CH/i.test(remaining) && remaining.length > 2) {
                parts.push({ type: 'text', value: 'CH' });
                remaining = remaining.slice(2).trim();
            }

            // Motion prefix, longest match first — recursive to handle e.g. "236236K"
            var motions = ['41236', '63214', 'r360', '360', '180f', '180b', 'qcf', 'qcb', 'dp', '421', '236', '214', '623'];
            for (var m = 0; m < motions.length; m++) {
                if (remaining.toLowerCase().startsWith(motions[m].toLowerCase())) {
                    var mIcon = this.getInputIcon(motions[m]);
                    parts.push(mIcon
                        ? { type: 'icon', value: mIcon, label: motions[m] }
                        : { type: 'text', value: motions[m] });
                    remaining = remaining.slice(motions[m].length).trim();
                    if (remaining) {
                        return parts.concat(this.getInputParts(remaining));
                    }
                    return parts;
                }
            }

            // Single direction digit prefix (e.g. "2" in "2MP") when followed by non-digit
            if (remaining.length > 1 && /^[1-9]/.test(remaining) && /^[1-9][^0-9]/.test(remaining)) {
                var digit = remaining[0];
                var dIcon = this.getInputIcon(digit);
                parts.push(dIcon ? { type: 'icon', value: dIcon, label: digit } : { type: 'text', value: digit });
                remaining = remaining.slice(1).trim();
            }

            // Remaining is the button
            if (remaining) {
                var bIcon = this.getInputIcon(remaining);
                parts.push(bIcon
                    ? { type: 'icon', value: bIcon, label: remaining }
                    : { type: 'text', value: remaining });
            }

            return parts.length ? parts : [{ type: 'text', value: trimmed }];
        },

        getGlobalInputIndex(rowIndex, inputIndex) {
            var globalIndex = 0;
            for (var i = 0; i < rowIndex; i++) {
                if (this.parsedInputRows[i]) globalIndex += this.parsedInputRows[i].length;
            }
            return globalIndex + inputIndex;
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

.combo-video-card .combo-card .game-character-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.combo-video-card .combo-card .character-name {
    padding-top: 0px;
    font-size: 13px;
    margin-bottom: 0;
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
    margin-bottom: 0;
    text-align: right;
}

.combo-video-card .combo-card .game .img-container img,
.combo-video-card .combo-card .character-name .img-container img {
    width: 30px;
}

.combo-video-card .combo-card .game-title img {
    max-width: 100px;
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

.combo-video-card .combo-card .combo-inputs-icons .input-row {
    display: flex;
    gap: 0;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 3px;
}

.combo-video-card .combo-card .combo-inputs-icons .input-row:last-child {
    margin-bottom: 0;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item {
    position: relative;
    box-sizing: border-box;
    background: rgb(128, 128, 128);
    border: 1px solid rgb(128, 128, 128);
    border-radius: 4px;
    padding: 4px 12px 4px 8px;
    min-width: 0;
    min-height: 35px;
    height: 35px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    clip-path: polygon(0% 0%, calc(100% - 6px) 0%, 100% 50%, calc(100% - 6px) 100%, 0% 100%);
    margin-left: -7px;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item:first-child {
    margin-left: 0;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item:not(:first-child) {
    padding-left: 12px;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.input-even {
    background: rgb(100, 150, 200);
    border-color: rgb(100, 150, 200);
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.input-odd {
    background: rgb(200, 120, 150);
    border-color: rgb(200, 120, 150);
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.bracketed {
    border: 2px solid rgb(255, 255, 255) !important;
    background: rgb(128, 128, 128) !important;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.bracketed.input-even {
    background: rgb(100, 150, 200) !important;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.bracketed.input-odd {
    background: rgb(200, 120, 150) !important;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.bracketed::before {
    content: '[';
    position: absolute;
    left: -5px;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
}

.combo-video-card .combo-card .combo-inputs-icons .input-item.bracketed::after {
    content: ']';
    position: absolute;
    right: -5px;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
}

.combo-video-card .combo-card .combo-inputs-icons .input-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.combo-video-card .combo-card .combo-inputs-icons .input-text {
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    line-height: 1.2;
}

.combo-video-card .combo-card .combo-inputs-icons .input-text:only-child {
    padding: 0 2px;
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

.combo-video-card .combo-card .twitter-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.combo-video-card .combo-card .tweet-message {
    margin-top: 12px;
}

.combo-video-card .combo-card .tweet-message-link {
    display: block;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-left: 3px solid rgba(255, 255, 255, 0.15);
    border-radius: 0 6px 6px 0;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;
}

.combo-video-card .combo-card .tweet-message-link:hover {
    background: rgba(255, 255, 255, 0.09);
    border-left-color: rgba(255, 255, 255, 0.4);
}

.combo-video-card .combo-card .tweet-author {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 5px;
}

.combo-video-card .combo-card .tweet-author-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
}

.combo-video-card .combo-card .tweet-author-handle {
    font-size: 12px;
    color: #ffffff60;
}

.combo-video-card .combo-card .tweet-text {
    font-size: 13px;
    color: #ffffffcc;
    line-height: 1.5;
    word-break: break-word;
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
