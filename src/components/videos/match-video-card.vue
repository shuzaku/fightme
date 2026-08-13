<!-- @format -->
<template>
    <div ref="videoList" class="match-video-card">
        <transition name="toast-fade">
            <div v-if="toastMessage" class="share-toast">
                <i class="fas fa-check-circle"></i> {{ toastMessage }}
            </div>
        </transition>
        <div v-if="isLoading"></div>
        <div v-else class="match-card card">
            <div
                :id="matchId"
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
                    :player-vars="{
                        rel: 0,
                        autoplay: 0,
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
                    <div class="game">
                        <div class="game-title" @click="video.game && queryGame(video.game)">
                            <img :src="video.game.logoUrl" />
                        </div>
                    </div>
                    <div class="players">
                        <div class="team team1">
                            <div
                                v-for="team1Player in video.match.team1Players"
                                :key="team1Player.id"
                                class="player"
                            >
                                <div class="player-name" @click="queryPlayer(team1Player)">
                                    <span>{{ team1Player.name }}</span>
                                </div>
                                <div class="characters">
                                    <div
                                        v-for="(character, index) in team1Player.characters"
                                        :key="index"
                                        class="character"
                                        :title="character.name"
                                        @click="queryCharacter(character)"
                                    >
                                        <img
                                            class="character-img"
                                            :src="character.imageUrl"
                                            :alt="character.name"
                                        />
                                        <span class="character-label">{{ character.name }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="team team2">
                            <div
                                v-for="team2Player in video.match.team2Players"
                                :key="team2Player.id"
                                class="player"
                            >
                                <div class="player-name" @click="queryPlayer(team2Player)">
                                    <span>{{ team2Player.name }}</span>
                                </div>
                                <div class="characters">
                                    <div
                                        v-for="(character, index) in team2Player.characters"
                                        :key="index"
                                        class="character"
                                        :title="character.name"
                                        @click="queryCharacter(character)"
                                    >
                                        <img
                                            class="character-img"
                                            :src="character.imageUrl"
                                            :alt="character.name"
                                        />
                                        <span class="character-label">{{ character.name }}</span>
                                    </div>
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
                    <v-btn v-if="isAdmin" @click="showDeleteConfirm = true">
                        <v-icon dark> mdi-delete </v-icon>
                    </v-btn>
                    <div v-if="showDeleteConfirm" class="delete-confirm-popout">
                        <p>Delete this match?</p>
                        <div class="delete-confirm-actions">
                            <button class="dc-cancel" @click="showDeleteConfirm = false">Cancel</button>
                            <button class="dc-confirm" @click="confirmDelete()">Delete</button>
                        </div>
                    </div>
                    <v-btn
                        v-if="account && !video.isFavorited"
                        class="favorite-button"
                        @click="favoriteVideo()"
                    >
                        <v-icon light> mdi-heart-outline </v-icon>
                    </v-btn>
                    <v-btn v-else-if="account" class="unfavorite-button" @click="unfavoriteVideo()">
                        <v-icon> mdi-heart </v-icon>
                    </v-btn>
                    <v-btn class="share-button" @click="copyLink()">
                        <v-icon light> mdi-link </v-icon>
                    </v-btn>
                    <v-btn class="view-match-button" @click="goToMatchPage()">
                        <v-icon light> mdi-open-in-new </v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MatchesService from '@/services/matches-service';
import CollectionSearch from '@/components/collection/collection-search';
import CollectionsService from '@/services/collections-service';

import { eventbus } from '@/main';
import { pauseWaypointMedia } from '@/utils/pause-waypoint-media';
import { gameHrefFromLike, characterPagePath, playerPagePath } from '@/utils/game-character-routes';

export default {
    name: 'VideoCard',
    components: {
        'collection-search': CollectionSearch,
    },
    inheritAttrs: false,

    props: {
        matchId: {
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
            toastMessage: '',
            toastTimer: null,
            video: {
                videoType: null,
                isPlaying: false,
                url: null,
                isFavorited: false,
                game: { title: '', logoUrl: '', id: null, abbreviation: null },
            },
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
            player: null,
            collections: null,
            showCollections: false,
            showDeleteConfirm: false,
        };
    },

    computed: {
        isAdmin() {
            return this.account ? this.account.role === 'admin' : null;
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
        if (this.account && this.account.id) {
            this.getCollections();
        }
        this.getMatch();
    },

    methods: {
        extractYoutubeId(url) {
            if (!url || typeof url !== 'string') return null;
            var s = url.trim();
            if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
            var m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            return m ? m[1] : null;
        },

        inferVideoType(url) {
            if (!url) return null;
            var u = url.trim().toLowerCase();
            if (u.includes('youtube') || u.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return 'youtube';
            if (u.includes('twitter') || u.includes('x.com')) return 'twitter';
            return 'uploaded';
        },

        seekToTimestamp(seconds) {
            this.$refs.youtubeRef.player.seekTo(seconds);
        },

        async getMatch() {
            this.isLoading = true;
            const response = await MatchesService.getMatch(this.matchId);
            var matchResponse = response.data && response.data.matches && response.data.matches[0];
            if (!matchResponse) {
                this.isLoading = false;
                return;
            }
            this.video.match = {
                team1Players: matchResponse.Team1Players.map((player) => {
                    const team1 = matchResponse.Team1Player.find(
                        (searchPlayer) => String(searchPlayer._id) === String(player.Id)
                    );
                    return {
                        id: player.Id,
                        slot: player.Slot,
                        name: team1 ? team1.Name : '',
                        slug: team1 ? team1.Slug || null : null,
                        characters: this.hydrateCharacters(
                            player.CharacterIds,
                            matchResponse.Team1PlayerCharacters
                        ),
                    };
                }),
                team2Players: matchResponse.Team2Players.map((player) => {
                    const team2 = matchResponse.Team2Player.find(
                        (searchPlayer) => String(searchPlayer._id) === String(player.Id)
                    );
                    return {
                        id: player.Id,
                        slot: player.Slot,
                        name: team2 ? team2.Name : '',
                        slug: team2 ? team2.Slug || null : null,
                        characters: this.hydrateCharacters(
                            player.CharacterIds,
                            matchResponse.Team2PlayerCharacters
                        ),
                    };
                }),
                collections: this.assignCollection(this.matchId),
                startTime: matchResponse.StartTime
                    ? this.convertTime(matchResponse.StartTime)
                    : null,
                endTime: matchResponse.StartTime ? this.convertTime(matchResponse.EndTime) : null,
            };
            this.video.url = this.extractYoutubeId(matchResponse.VideoUrl) || matchResponse.VideoUrl;
            this.video.videoType = this.inferVideoType(matchResponse.VideoUrl);
            this.video.isFavorited = this.favoriteVideos
                ? this.favoriteVideos.some((v) => v.id === this.matchId)
                : null;
            var gFromMatch =
                matchResponse.Game && matchResponse.Game.length ? matchResponse.Game[0] : null;
            if (gFromMatch) {
                this.video.game = {
                    title: gFromMatch.Title || '',
                    logoUrl: gFromMatch.LogoUrl || '',
                    id: gFromMatch._id,
                    abbreviation: gFromMatch.Abbreviation || null,
                };
            }
            this.isLoading = false;
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

        hydrateCharacters(characterIds, characters) {
            var playerCharacters = [];
            if (!characterIds || !characters) return playerCharacters;

            characterIds.forEach((id) => {
                var filteredCharacter = characters.find(
                    (character) => String(character._id) === String(id)
                );
                if (filteredCharacter) {
                    playerCharacters.push({
                        name: filteredCharacter.Name ? filteredCharacter.Name : null,
                        id: filteredCharacter._id,
                        slug: filteredCharacter.Slug || null,
                        imageUrl: filteredCharacter.AvatarUrl,
                    });
                }
            });
            return playerCharacters;
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
            if (this.video.isPlaying) {
                this.player.playVideo();
                if (this.video.startTime) {
                    this.setTimer();
                }
            }
        },

        async confirmDelete() {
            this.showDeleteConfirm = false;
            var matchResponse = await MatchesService.deleteMatch(this.matchId);
            this.$emit('video:delete', matchResponse);
        },

        async deleteVideo() {
            var matchResponse = await MatchesService.deleteMatch(this.matchId);
            this.$emit('video:delete', matchResponse);
        },

        queryPlayer(player) {
            var path = playerPagePath(player);
            if (path) { this.$router.push(path); }
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
                window.setInterval(() => {
                    this.getTimeStamp();
                }, 1000);
            });
        },

        getTimeStamp() {
            if (this.$refs.youtubeRef && this.$refs.youtubeRef.player) {
                this.videoCurrentTime = this.$refs.youtubeRef.player.getCurrentTime();
            }
        },

        getVideoPlayer() {
            if (this.video.videoType === 'youtube' && this.player) {
                return this.player;
            }
            return null;
        },

        getCurrentTimestamp() {
            if (this.video.videoType === 'youtube' && this.player) {
                return this.player.getCurrentTime();
            }
            return null;
        },

        editVideo() {
            this.video.isEditing = true;
            eventbus.$emit('open:widget', {
                name: 'match',
                matchId: this.matchId,
            });
        },

        showToast(msg) {
            this.toastMessage = msg;
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 2500);
        },

        buildMatchUrl(seconds) {
            const base = `https://fighters-edge.com/match/${this.matchId}`;
            return seconds ? `${base}?t=${Math.floor(seconds)}` : base;
        },

        copyLink() {
            const url = this.buildMatchUrl();
            if (navigator.share) {
                navigator.share({ title: 'Fighters Edge', url }).catch(() => {});
            } else {
                this.$copyText(url).then(() => this.showToast('Link copied!'));
            }
        },

        goToMatchPage() {
            if (this.matchId) {
                this.$router.push(`/match/${this.matchId}`);
            }
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
            if (!objectId) {
                return;
            }
            const vt = this.video && this.video.videoType;
            const isYoutube = typeof vt === 'string' && vt.toLowerCase() === 'youtube';

            if (going === this.$waypointMap.GOING_OUT) {
                this.video.isPlaying = false;
                this.$emit('input', false);
                pauseWaypointMedia({
                    videoType: this.video.videoType,
                    videoRef: this.$refs.videoRef,
                    youtubePlayer:
                        this.player ||
                        (this.$refs.youtubeRef && this.$refs.youtubeRef.player) ||
                        null,
                });
                return;
            }
            if (going === this.$waypointMap.GOING_IN && direction && !isYoutube) {
                this.video.isPlaying = true;
            }
        },

        updateCollections(collections) {
            var collectionIds = collections.map((collection) => {
                return collection.id;
            });

            var matchObject = { id: this.matchId, contentType: 'Match' };

            this.collections.forEach((collection) => {
                var collectionHasVideo = collection.videos.some((videos) => {
                    return videos.id === this.matchId;
                });

                var collectionShouldHaveVideo = collectionIds.some((collectionId) => {
                    return collectionId === collection.id;
                });

                if (collectionShouldHaveVideo && !collectionHasVideo) {
                    collection.videos.push(matchObject);
                    this.patchCollection(collection);
                } else if (!collectionShouldHaveVideo && collectionHasVideo) {
                    collection.videos = collection.videos.splice(
                        collection.videos.indexOf(matchObject),
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
                        return video.id === this.matchId;
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
.match-card {
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

.match-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 25%;
    width: 100%;
}

.match-card .versus {
    font-size: 25px;
    color: #3eb489;
    text-transform: uppercase;
}

.match-card .card-label {
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

.match-card .card-label {
    background: #3c73a8;
}

.match-card video {
    width: 100%;
}

.match-card .character-name span,
.match-card .game-title span {
    padding: 3px 20px;
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

.match-card .game-title img {
    max-width: 100px;
}

.match-card .team2 .character-name span {
    color: #fff;
    background: #4447e2;
}

.match-card .player-name {
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

.match-card .player-name p {
    font-weight: 400;
    font-size: 18px;
}

.match-card .character-name {
    padding-top: 0px;
    font-size: 13px;
}

.match-card .character-name p {
    font-size: 14px;
    color: #242832;
    font-weight: 300;
    margin-top: 3px;
}

.match-card .character {
    padding: 5px;
}

.match-card .game {
    margin-bottom: 20px;
    text-align: right;
}

.match-card .game .img-container img,
.match-card .character .img-container img {
    width: 30px;
}

.match-card .game .img-container,
.match-card .character .img-container {
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

.match-card .video-ghost {
    height: 313px;
    width: 556px;
}

.match-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
}

.match-card.card .edit-btn-container {
    padding: 10px;
}

.match-card.card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #4447e2 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.match-card .video-container {
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

.match-card .character-2 {
    top: 40px;
}

.match-card .character-3 {
    top: 120px;
}

.match-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    bottom: 5px;
}

#app .match-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .match-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .match-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.match-card .admin-controls {
    position: relative;
}

.match-card .delete-confirm-popout {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    background: #1c1c28;
    border: 1px solid #ff525280;
    border-radius: 12px;
    padding: 12px 16px;
    min-width: 180px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
}

.match-card .delete-confirm-popout p {
    color: #fff;
    font-size: 13px;
    margin: 0 0 10px;
    text-align: center;
}

.match-card .delete-confirm-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.match-card .delete-confirm-actions button {
    padding: 5px 14px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}

.match-card .dc-cancel {
    background: #ffffff20;
    color: #fff;
}

.match-card .dc-cancel:hover {
    background: #ffffff30;
}

.match-card .dc-confirm {
    background: #ff5252;
    color: #fff;
}

.match-card .dc-confirm:hover {
    opacity: 0.85;
}

.match-card .admin-controls button.share-button,
.match-card .admin-controls button.view-match-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

.match-card .player {
    border: 1px dashed #3eb489;
    position: relative;
    padding-top: 10px;
    margin-bottom: 40px;
}

.match-card .team2 .player {
    border: 1px dashed #4447e2;
}

.match-card .characters {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
}

#app.mobile.small-mobile .match-card {
    flex-direction: column;
}

#app.mobile.small-mobile .match-card .players {
    display: flex;
    width: 100%;
    flex-direction: column;
}

#app.mobile.small-mobile .match-card .players .player {
    margin-bottom: 0;
    max-width: 100%;
    width: 100%;
    margin-bottom: 20px;
}

#app.mobile.small-mobile .match-card .player-name {
    top: -9px;
}

#app.mobile.small-mobile .match-card .characters {
    padding: 0 5px;
}

#app.mobile.small-mobile .match-card .character-name span {
    padding: 3px 20px 3px 40px;
}

#app.mobile.small-mobile .match-card .game {
    margin-bottom: 0px;
}

#app.mobile.small-mobile .match-card .admin-controls button {
    height: 10px;
}

#app.mobile.small-mobile .match-card .player-name p {
    font-size: 12px;
}

#app.mobile.small-mobile .match-card .video-container {
    padding-bottom: 56.25%;
}

#app.mobile.small-mobile .match-card .aside {
    max-width: 100%;
}

.share-toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #3eb489;
    color: #131419;
    font-weight: 700;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 30px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(62,180,137,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}

.toast-fade-enter-active, .toast-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-fade-enter, .toast-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
}

/* ══ Stylized match card ═══════════════════════════════════════════
   Scoped under .match-video-card so the legacy unprefixed .match-card
   rules above keep applying to the other components that share them.
   The aside is built to stay SHORTER than the video for any roster
   size, so the card height is driven by the video and there is no
   dead space under it — which is what went wrong on 4-character
   games like Marvel Tokon.
   ══════════════════════════════════════════════════════════════════ */
.match-video-card .match-card {
    margin: 26px 0;
    display: flex;
    align-items: stretch;
    background: linear-gradient(180deg, #1b1e2b 0%, #16181f 100%);
    border: 1px solid #ffffff1f;
    /* Square: the video is full-bleed on the left edge, so a corner radius
       here would just peek out from behind it. The clipped top-right corner
       carries the angular treatment instead. */
    border-radius: 0;
    clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

/* Width stays at 75% to match the legacy 42.25% padding-bottom, which is
   the 16:9 height of a 75%-wide box measured against the card width. */
.match-video-card .match-card .video-container {
    border-radius: 0;
}

/* "Match" tag — skewed, tucked against the top-left of the card. */
.match-video-card .match-card .card-label {
    position: absolute;
    top: 10px;
    left: 12px;
    width: auto;
    margin-left: 0;
    padding: 3px 14px;
    border-radius: 0;
    transform: skewX(-8deg);
    background: #3c73a8;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    z-index: 3;
}

.match-video-card .match-card .aside {
    padding: 12px 12px 6px;
    gap: 8px;
}

.match-video-card .match-card .game {
    margin-bottom: 10px;
    text-align: right;
}

.match-video-card .match-card .game-title img {
    max-width: 76px;
    max-height: 46px;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: pointer;
}

.match-video-card .match-card .players {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Player panel — reset the legacy absolute-positioned name badge that
   forced 40px of margin under every player. */
.match-video-card .match-card .player {
    border: 1px solid #ffffff1a;
    border-left: 3px solid #3eb489;
    border-radius: 3px;
    background: #ffffff08;
    position: static;
    padding: 8px 10px 10px;
    margin-bottom: 0;
}

.match-video-card .match-card .team2 .player {
    border: 1px solid #ffffff1a;
    border-left: 3px solid #6a6ef5;
}

.match-video-card .match-card .player-name {
    position: static;
    display: inline-block;
    top: auto;
    left: auto;
    padding: 2px 10px;
    margin-bottom: 7px;
    border-radius: 0;
    background: #3eb489;
    transform: skewX(-8deg);
    cursor: pointer;
    max-width: 100%;
}

.match-video-card .match-card .team2 .player-name {
    background: #6a6ef5;
}

.match-video-card .match-card .player-name span {
    display: block;
    transform: skewX(8deg);
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 14px;
    line-height: 1.25;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #06231a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.match-video-card .match-card .team2 .player-name span {
    color: #0d0f2b;
}

/* Compact wrapping chips — two per row in the aside column. */
.match-video-card .match-card .characters {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 0;
}

.match-video-card .match-card .character {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    max-width: 100%;
    padding: 2px 8px 2px 2px;
    border-radius: 20px;
    background: #3eb4891f;
    border: 1px solid #3eb48959;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
}

.match-video-card .match-card .team2 .character {
    background: #6a6ef51f;
    border-color: #6a6ef559;
}

.match-video-card .match-card .character:hover {
    background: #3eb48938;
    border-color: #3eb489;
}

.match-video-card .match-card .team2 .character:hover {
    background: #6a6ef538;
    border-color: #6a6ef5;
}

.match-video-card .match-card .character-img {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    background: #0e1018;
}

.match-video-card .match-card .character-label {
    font-size: 11.5px;
    font-weight: 600;
    line-height: 1.3;
    color: #d8f5ea;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.match-video-card .match-card .team2 .character-label {
    color: #dcddff;
}

.match-video-card .match-card .admin-controls {
    padding: 0;
    justify-content: flex-end;
    flex-wrap: wrap;
}

#app .match-video-card .match-card .admin-controls button,
#app .match-video-card .match-card .admin-controls button.share-button,
#app .match-video-card .match-card .admin-controls button.view-match-button {
    width: 32px;
    height: 36px;
}

/* ── Mobile ─────────────────────────────────────── */
#app.mobile.small-mobile .match-video-card .match-card {
    flex-direction: column;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}

#app.mobile.small-mobile .match-video-card .match-card .aside {
    max-width: 100%;
}

#app.mobile.small-mobile .match-video-card .match-card .players {
    flex-direction: column;
}

#app.mobile.small-mobile .match-video-card .match-card .players .player {
    margin-bottom: 0;
    max-width: 100%;
    width: 100%;
}

#app.mobile.small-mobile .match-video-card .match-card .player-name {
    top: auto;
}

#app.mobile.small-mobile .match-video-card .match-card .characters {
    padding: 0;
}
</style>
