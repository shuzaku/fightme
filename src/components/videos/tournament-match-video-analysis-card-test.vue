<!-- @format -->
<template>
    <div ref="videoList">
        <div class="match-card card">
            <div :id="video.matchId" class="video-container">
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
                <div class="nav">
                    <div
                        :class="[currentNav === 'general' ? 'active' : '']"
                        class="navItem"
                        @click="setNav('general')"
                    >
                        General
                    </div>
                    <div
                        :class="[currentNav === 'player1' ? 'active' : '']"
                        class="navItem"
                        @click="setNav('player1')"
                    >
                        Player 1
                    </div>
                    <div
                        :class="[currentNav === 'player2' ? 'active' : '']"
                        class="navItem"
                        @click="setNav('player2')"
                    >
                        Player 2
                    </div>
                    <div
                        :class="[currentNav === 'stats' ? 'active' : '']"
                        class="navItem"
                        @click="setNav('stats')"
                    >
                        Stats
                    </div>
                </div>
                <div v-if="currentNav === 'general'" class="general">
                    <div class="info">
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
                </div>
                <div v-if="currentNav === 'player1'" class="player1">
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
                    <div v-if="player1Counter.length > 0" class="trigger">
                        <h4>Counters</h4>
                        <div class="counters label">
                            <div v-for="(timestamp, index) in player1Counter" :key="index">
                                <a @click="seekToTimeStamp(timestamp.timestamp)">{{
                                    timestamp.formattedTime
                                }}</a>
                            </div>
                        </div>
                    </div>
                    <div v-if="player1Reversal.length > 0" class="trigger">
                        <h4>Reversal</h4>
                        <div class="reversals label">
                            <div v-for="(timestamp, index) in player1Reversal" :key="index">
                                <a @click="seekToTimeStamp(timestamp.timestamp)">{{
                                    timestamp.formattedTime
                                }}</a>
                            </div>
                        </div>
                    </div>
                    <div v-if="player1Punish.length > 0" class="trigger">
                        <h4>Punish</h4>
                        <div class="punishes label">
                            <div v-for="(timestamp, index) in player1Punish" :key="index">
                                <a @click="seekToTimeStamp(timestamp.timestamp)">{{
                                    timestamp.formattedTime
                                }}</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="currentNav === 'player2'" class="player2">
                    <div class="team1">
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
                    <div v-if="player2Counter.length > 0" class="trigger">
                        <h4>Counters</h4>
                        <div class="counters label">
                            <div v-for="(timestamp, index) in player2Counter" :key="index">
                                <a @click="seekToTimeStamp(timestamp.timestamp)">{{
                                    timestamp.formattedTime
                                }}</a>
                            </div>
                        </div>
                    </div>
                    <div v-if="player2Reversal.length > 0" class="trigger">
                        <h4>Reversal</h4>
                        <div class="reversals label">
                            <div v-for="(timestamp, index) in player2Reversal" :key="index">
                                <a @click="seekToTimeStamp(timestamp.timestamp)">{{
                                    timestamp.formattedTime
                                }}</a>
                            </div>
                        </div>
                    </div>
                    <div v-if="player2Punish.length > 0" class="trigger">
                        <h4>Punish</h4>
                        <div class="punishes label">
                            <div v-for="(timestamp, index) in player2Punish" :key="index">
                                <a @click="seekToTimeStamp(timestamp.timestamp)">{{
                                    timestamp.formattedTime
                                }}</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="currentNav === 'stats'" class="stats">
                    <table>
                        <tr>
                            <th></th>
                            <th>Player1</th>
                            <th>Player2</th>
                        </tr>
                        <tr>
                            <td>Counters</td>
                            <td class="value">{{ player1Counter.length }}</td>
                            <td class="value">{{ player2Counter.length }}</td>
                        </tr>
                        <tr>
                            <td>Reversals</td>
                            <td class="value">{{ player1Reversal.length }}</td>
                            <td class="value">{{ player2Reversal.length }}</td>
                        </tr>
                        <tr>
                            <td>Punishes</td>
                            <td class="value">{{ player1Punish.length }}</td>
                            <td class="value">{{ player2Punish.length }}</td>
                        </tr>
                    </table>
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
                    <v-btn v-if="isAdmin" @click="deleteVideo(video.match)">
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
import MatchesService from '@/services/matches-service';
import CollectionSearch from '@/components/collection/collection-search';
import CollectionsService from '@/services/collections-service';
import { eventbus } from '@/main';
import moment from 'moment';

export default {
    name: 'TournamentMatchAnalysisCard',
    components: {
        'collection-search': CollectionSearch,
    },

    props: {
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

        video: {
            type: Object,
            default: null,
        },

        analysis: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            videoCurrentTime: 0,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
            player: null,
            collections: null,
            showCollections: false,
            isPlaying: false,
            currentNav: 'general',
            isPlaying: true,
        };
    },

    computed: {
        isAdmin() {
            return this.account ? this.account.role === 'Admin User' : null;
        },

        player1Detections() {
            return this.analysis.detection.filter((t) => t.player === 'p1');
        },
        player2Detections() {
            return this.analysis.detection.filter((t) => t.player === 'p2');
        },
        player1Counter() {
            return this.player1Detections.filter(
                (t) => t.label === 'punish_counter' || t.label === 'counter'
            );
        },
        player2Counter() {
            return this.player2Detections.filter(
                (t) => t.label === 'punish_counter' || t.label === 'counter'
            );
        },
        player1Reversal() {
            return this.player1Detections.filter((t) => t.label === 'reversal');
        },
        player2Reversal() {
            return this.player2Detections.filter((t) => t.label === 'reversal');
        },

        player1Punish() {
            return this.player1Detections.filter((t) => t.label === 'punish_counter');
        },
        player2Punish() {
            return this.player2Detections.filter((t) => t.label === 'punish_counter');
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
    },

    created() {
        if (this.account && this.account.id) {
            this.getCollections();
        }
        this.playVideo();
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

        setNav(item) {
            this.currentNav = item;
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

        seekToTimeStamp(seconds) {
            this.$refs.youtubeRef.player.seekTo(seconds);
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
    justify-content: start;
}

.notes {
    display: flex;
}

.notes .note-section {
    margin: 10px 0;
    background: #242832;
    border: 5px solid #242832;
    border-radius: 15px;
    margin-bottom: 30px;
    position: relative;
    cursor: pointer;
    width: 100%;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
    justify-content: start;
    color: #fff;
    padding: 20px;
}

.pre-match-notes {
    margin-right: 20px;
}

.notes .stack {
    display: flex;
    margin-bottom: 2px;
}

.notes h3 {
    margin-bottom: 10px;
}

.notes li {
    font-weight: 400;
}

.match-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 25%;
    width: 100%;
    position: relative;
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

.match-card .nav {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.match-card .navItem {
    border: 2px solid #3eb489;
    color: #fff;
    width: 65px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-size: 11px;
}

.match-card .navItem:hover,
.match-card .navItem.active {
    background: #3eb489;
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
    position: absolute;
    bottom: 0;
    width: 100%;
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

.match-card .admin-controls button.share-button {
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

.match-card h4 {
    color: #fff;
}

.match-card .label {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.match-card .label div,
.mental-stack a {
    margin-right: 5px;
    color: #4447e2;
    text-decoration: underline;
}

.match-card .player1 .player,
.match-card .player2 .player {
    margin-bottom: 20px;
    margin-top: 20px;
}

.match-card .stats table {
    color: #fff;
    width: 100%;
}

.match-card .stats table .value {
    text-align: center;
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
</style>
