<!-- @format -->
<template>
    <div ref="videoList">
        <div v-if="isLoading"></div>
        <div v-else class="match-analysis-card card">
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
                <div class="general">
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
        <div v-if="!video.isEditing" class="match-analysis-details">
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
            <div v-if="currentNav === 'player1'" class="player1">
                <div class="team2">
                    <div
                        v-for="team2Player in video.match.team2Players"
                        :key="team2Player.id"
                        class="player"
                    >
                        <div class="heavy-weight player-name" @click="queryPlayer(team2Player.id)">
                            <p>{{ team2Player.name }}</p>
                        </div>
                        <div class="characters">
                            <div
                                v-for="(character, index) in team2Player.characters"
                                :key="index"
                                class="character"
                            >
                                <div class="character-name" @click="queryCharacter(character.id)">
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
                    <h4 @click="toggleCategory('p1-counter')">
                        <span class="category-icon">{{
                            collapsedCategories['p1-counter'] ? '▶' : '▼'
                        }}</span>
                        Counters
                        <span class="count-badge">{{ player1Counter.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p1-counter']" class="counters label">
                        <div v-for="(timestamp, index) in player1Counter" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player1Reversal.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p1-reversal')">
                        <span class="category-icon">{{
                            collapsedCategories['p1-reversal'] ? '▶' : '▼'
                        }}</span>
                        Reversal
                        <span class="count-badge">{{ player1Reversal.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p1-reversal']" class="reversals label">
                        <div v-for="(timestamp, index) in player1Reversal" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player1Punish.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p1-punish')">
                        <span class="category-icon">{{
                            collapsedCategories['p1-punish'] ? '▶' : '▼'
                        }}</span>
                        Punish
                        <span class="count-badge">{{ player1Punish.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p1-punish']" class="punishes label">
                        <div v-for="(timestamp, index) in player1Punish" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player1HardKnockdown.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p1-hardknockdown')">
                        <span class="category-icon">{{
                            collapsedCategories['p1-hardknockdown'] ? '▶' : '▼'
                        }}</span>
                        Hard Knockdown
                        <span class="count-badge">{{ player1HardKnockdown.length }}</span>
                    </h4>
                    <div
                        v-show="!collapsedCategories['p1-hardknockdown']"
                        class="hard-knockdowns label"
                    >
                        <div v-for="(timestamp, index) in player1HardKnockdown" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player1ThrowEscape.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p1-throwescape')">
                        <span class="category-icon">{{
                            collapsedCategories['p1-throwescape'] ? '▶' : '▼'
                        }}</span>
                        Throw Escape
                        <span class="count-badge">{{ player1ThrowEscape.length }}</span>
                    </h4>
                    <div
                        v-show="!collapsedCategories['p1-throwescape']"
                        class="throw-escapes label"
                    >
                        <div v-for="(timestamp, index) in player1ThrowEscape" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player1Just.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p1-just')">
                        <span class="category-icon">{{
                            collapsedCategories['p1-just'] ? '▶' : '▼'
                        }}</span>
                        Just
                        <span class="count-badge">{{ player1Just.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p1-just']" class="just label">
                        <div v-for="(timestamp, index) in player1Just" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="currentNav === 'player2'" class="player2">
                <div class="team1">
                    <div
                        v-for="team1Player in video.match.team1Players"
                        :key="team1Player.id"
                        class="player"
                    >
                        <div class="heavy-weight player-name" @click="queryPlayer(team1Player.id)">
                            <p>{{ team1Player.name }}</p>
                        </div>
                        <div class="characters">
                            <div
                                v-for="(character, index) in team1Player.characters"
                                :key="index"
                                class="character"
                            >
                                <div class="character-name" @click="queryCharacter(character.id)">
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
                    <h4 @click="toggleCategory('p2-counter')">
                        <span class="category-icon">{{
                            collapsedCategories['p2-counter'] ? '▶' : '▼'
                        }}</span>
                        Counters
                        <span class="count-badge">{{ player2Counter.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p2-counter']" class="counters label">
                        <div v-for="(timestamp, index) in player2Counter" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player2Reversal.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p2-reversal')">
                        <span class="category-icon">{{
                            collapsedCategories['p2-reversal'] ? '▶' : '▼'
                        }}</span>
                        Reversal
                        <span class="count-badge">{{ player2Reversal.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p2-reversal']" class="reversals label">
                        <div v-for="(timestamp, index) in player2Reversal" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player2Punish.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p2-punish')">
                        <span class="category-icon">{{
                            collapsedCategories['p2-punish'] ? '▶' : '▼'
                        }}</span>
                        Punish
                        <span class="count-badge">{{ player2Punish.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p2-punish']" class="punishes label">
                        <div v-for="(timestamp, index) in player2Punish" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player2HardKnockdown.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p2-hardknockdown')">
                        <span class="category-icon">{{
                            collapsedCategories['p2-hardknockdown'] ? '▶' : '▼'
                        }}</span>
                        Hard Knockdown
                        <span class="count-badge">{{ player2HardKnockdown.length }}</span>
                    </h4>
                    <div
                        v-show="!collapsedCategories['p2-hardknockdown']"
                        class="hard-knockdowns label"
                    >
                        <div v-for="(timestamp, index) in player2HardKnockdown" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player2ThrowEscape.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p2-throwescape')">
                        <span class="category-icon">{{
                            collapsedCategories['p2-throwescape'] ? '▶' : '▼'
                        }}</span>
                        Throw Escape
                        <span class="count-badge">{{ player2ThrowEscape.length }}</span>
                    </h4>
                    <div
                        v-show="!collapsedCategories['p2-throwescape']"
                        class="throw-escapes label"
                    >
                        <div v-for="(timestamp, index) in player2ThrowEscape" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div v-if="player2Just.length > 0" class="trigger">
                    <h4 @click="toggleCategory('p2-just')">
                        <span class="category-icon">{{
                            collapsedCategories['p2-just'] ? '▶' : '▼'
                        }}</span>
                        Just
                        <span class="count-badge">{{ player2Just.length }}</span>
                    </h4>
                    <div v-show="!collapsedCategories['p2-just']" class="just label">
                        <div v-for="(timestamp, index) in player2Just" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="currentNav === 'stats'" class="stats">
                <div v-if="analysisSummary" class="analysis-summary">
                    <div class="summary-item">
                        <span class="summary-label">Duration</span>
                        <span class="summary-value">{{
                            analysisSummary.video_duration_timestamp
                        }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Events</span>
                        <span class="summary-value">{{ analysisSummary.total_events }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Events / Min</span>
                        <span class="summary-value">{{ analysisSummary.events_per_minute }}</span>
                    </div>
                </div>
                <table>
                    <tr>
                        <th></th>
                        <th>P1</th>
                        <th>P2</th>
                    </tr>
                    <tr>
                        <td>Counters</td>
                        <td class="value">{{ player1Counter.length }}</td>
                        <td class="value">{{ player2Counter.length }}</td>
                    </tr>
                    <tr>
                        <td>Punish Counters</td>
                        <td class="value">{{ player1Punish.length }}</td>
                        <td class="value">{{ player2Punish.length }}</td>
                    </tr>
                    <tr>
                        <td>Reversals</td>
                        <td class="value">{{ player1Reversal.length }}</td>
                        <td class="value">{{ player2Reversal.length }}</td>
                    </tr>
                    <tr>
                        <td>Hard Knockdowns</td>
                        <td class="value">{{ player1HardKnockdown.length }}</td>
                        <td class="value">{{ player2HardKnockdown.length }}</td>
                    </tr>
                    <tr>
                        <td>Throw Escapes</td>
                        <td class="value">{{ player1ThrowEscape.length }}</td>
                        <td class="value">{{ player2ThrowEscape.length }}</td>
                    </tr>
                </table>
            </div>
            <div v-if="currentNav === 'general'" class="general-info">
                <p>Select Player 1, Player 2, or Stats to view detailed analysis.</p>
            </div>
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchesService from '@/services/matches-service';
import AnalysesService from '@/services/analyses-service';
import CollectionSearch from '@/components/collection/collection-search';
import CollectionsService from '@/services/collections-service';
import { eventbus } from '@/main';
import moment from 'moment';

export default {
    name: 'VideoCard',
    components: {
        'collection-search': CollectionSearch,
    },

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
            currentNav: 'general',
            timestamps: [],
            analysisSummary: null,
            collapsedCategories: {},
        };
    },

    computed: {
        isAdmin() {
            return this.account ? this.account.role === 'admin' : null;
        },

        player1Counter() {
            return this.player1TimeStamps.filter((t) => t.label === 'counter');
        },
        player1Punish() {
            return this.player1TimeStamps.filter((t) => t.label === 'punish_counter');
        },
        player1Reversal() {
            return this.player1TimeStamps.filter((t) => t.label === 'reversal');
        },
        player1HardKnockdown() {
            return this.player1TimeStamps.filter((t) => t.label === 'hard_knockdown');
        },
        player1ThrowEscape() {
            return this.player1TimeStamps.filter((t) => t.label === 'throw_escape');
        },
        player1Just() {
            return this.player1TimeStamps.filter((t) => t.label === 'just');
        },
        player2Counter() {
            return this.player2TimeStamps.filter((t) => t.label === 'counter');
        },
        player2Punish() {
            return this.player2TimeStamps.filter((t) => t.label === 'punish_counter');
        },
        player2Reversal() {
            return this.player2TimeStamps.filter((t) => t.label === 'reversal');
        },
        player2HardKnockdown() {
            return this.player2TimeStamps.filter((t) => t.label === 'hard_knockdown');
        },
        player2ThrowEscape() {
            return this.player2TimeStamps.filter((t) => t.label === 'throw_escape');
        },
        player2Just() {
            return this.player2TimeStamps.filter((t) => t.label === 'just');
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
        this.getAnalysis();
        this.playVideo();
    },

    methods: {
        seekToTimeStamp(seconds) {
            this.$refs.youtubeRef.player.seekTo(seconds);
            this.$el.querySelector('.video-container').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        },

        async getMatch() {
            const response = await MatchesService.getMatch(this.matchId);
            var matchResponse = response.data.matches[0];
            this.video.match = {
                team1Players: matchResponse.Team1Players.map((player) => {
                    return {
                        id: player.Id,
                        slot: player.Slot,
                        name: matchResponse.Team1Player.filter(
                            (searchPlayer) => searchPlayer._id === player.Id
                        )[0].Name,
                        characters: this.hydrateCharacters(
                            player.CharacterIds,
                            matchResponse.Team1PlayerCharacters
                        ),
                    };
                }),
                team2Players: matchResponse.Team2Players.map((player) => {
                    return {
                        id: player.Id,
                        slot: player.Slot,
                        name: matchResponse.Team2Player.filter(
                            (searchPlayer) => searchPlayer._id === player.Id
                        )[0].Name,
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
            this.video.url = matchResponse.VideoUrl;
            this.getVideo();
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

            characterIds.forEach((id) => {
                var filteredCharacter = characters.filter((character) => character._id === id);
                playerCharacters.push({
                    name: filteredCharacter[0].Name ? filteredCharacter[0].Name : null,
                    id: filteredCharacter[0]._id,
                    imageUrl: filteredCharacter[0].AvatarUrl,
                });
            });
            return playerCharacters;
        },

        async getVideo() {
            this.isLoading = true;

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
            this.video.match.id = this.matchId;
            this.video.contentType = 'Match';
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
            var matchResponse = await MatchesService.deleteMatch(this.video.match.id);

            this.$emit('video:delete', matchResponse);
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

        editVideo() {
            this.video.isEditing = true;
            eventbus.$emit('open:widget', {
                name: 'video',
                videoId: this.video.id,
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

        async getAnalysis() {
            try {
                const response = await AnalysesService.queryAnalysis({
                    searchQuery: [{ queryName: 'MatchId', queryValue: this.matchId }],
                });
                const analyses = (response.data && response.data.analyses) || response.data || [];
                const analysis = Array.isArray(analyses) ? analyses[0] : analyses;
                if (!analysis) return;

                this.analysisSummary = analysis.summary || null;

                const detections = analysis.Detections || [];
                this.timestamps = detections.map((d) => ({
                    player: d.player === 'p1' ? 1 : 2,
                    label: d.label,
                    s: parseFloat(d.timestamp),
                    formattedTime: moment.utc(parseFloat(d.timestamp) * 1000).format('mm:ss'),
                }));

                this.setTimestamps();
            } catch (e) {
                console.error('[analysis] failed to load:', e);
            }
        },

        convertSeconds() {
            this.timestamps.forEach((t) => {
                t.formattedTime = moment.utc(t.s * 1000).format('mm:ss');
            });
        },

        setTimestamps() {
            this.player1TimeStamps = this.timestamps.filter((t) => t.player === 1);
            this.player2TimeStamps = this.timestamps.filter((t) => t.player === 2);
        },

        setNav(item) {
            this.currentNav = item;
        },

        toggleCategory(categoryId) {
            this.$set(this.collapsedCategories, categoryId, !this.collapsedCategories[categoryId]);
        },
    },
};
</script>

<style>
.match-analysis-card {
    margin: 60px 0 20px 0;
    display: flex;
    background: #242832;
    border: 5px solid #242832;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    width: 100%;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
    justify-content: start;
}

.match-analysis-details {
    background: #242832;
    border: 5px solid #242832;
    border-radius: 15px;
    margin-bottom: 30px;
    padding: 20px;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.match-analysis-details .nav {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 10px;
}

.match-analysis-details .navItem {
    border: 2px solid #3eb489;
    color: #fff;
    flex: 1;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
}

.match-analysis-details .navItem:hover {
    background: rgba(62, 180, 137, 0.2);
}

.match-analysis-details .navItem.active {
    background: #3eb489;
    box-shadow: 0 4px 12px rgba(62, 180, 137, 0.3);
}

.match-analysis-details .general-info {
    color: #888;
    text-align: center;
    padding: 40px 20px;
    font-size: 14px;
}

.match-analysis-details .player1,
.match-analysis-details .player2,
.match-analysis-details .stats {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.match-analysis-card .aside {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 25%;
    width: 100%;
    position: relative;
}

.match-analysis-card .general {
    overflow-y: auto;
    max-height: 100%;
}

.match-analysis-card .general::-webkit-scrollbar {
    width: 8px;
}

.match-analysis-card .general::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.match-analysis-card .general::-webkit-scrollbar-thumb {
    background: #3eb489;
    border-radius: 10px;
}

.match-analysis-card .general::-webkit-scrollbar-thumb:hover {
    background: #4ecfa3;
}

.match-analysis-card .versus {
    font-size: 25px;
    color: #3eb489;
    text-transform: uppercase;
}

.match-analysis-card .card-label {
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

.match-analysis-card .card-label {
    background: #3c73a8;
}

.match-analysis-card video {
    width: 100%;
}

.match-analysis-card .character-name span,
.match-analysis-card .game-title span {
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

.match-analysis-card .team2 .character-name span {
    color: #fff;
    background: #4447e2;
}

.match-analysis-card .player-name {
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

.match-analysis-card .player-name p {
    font-weight: 400;
    font-size: 18px;
}

.match-analysis-card .character-name {
    padding-top: 0px;
    font-size: 13px;
}

.match-analysis-card .character-name p {
    font-size: 14px;
    color: #242832;
    font-weight: 300;
    margin-top: 3px;
}

.match-analysis-card .character {
    padding: 5px;
}

.match-analysis-card .game {
    margin-bottom: 20px;
    text-align: right;
}

.match-analysis-card .game .img-container img,
.match-analysis-card .character .img-container img {
    width: 30px;
}

.match-analysis-card .game .img-container,
.match-analysis-card .character .img-container {
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

.match-analysis-card .video-ghost {
    height: 313px;
    width: 556px;
}

.match-analysis-details .player1 .player,
.match-analysis-details .player2 .player {
    margin-bottom: 20px;
    margin-top: 0;
}

.match-analysis-card .inputs {
    border-radius: 3px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #4a5689;
}

.match-analysis-card.card .edit-btn-container {
    padding: 10px;
}

.match-analysis-card.card .edit-btn-container button {
    padding: 20px 10px;
    background-color: #4447e2 !important;
    border-radius: 50%;
    min-width: 0px;
    color: #fff;
}

.match-analysis-card .video-container {
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

.match-analysis-card .character-2 {
    top: 40px;
}

.match-analysis-card .character-3 {
    top: 120px;
}

.match-analysis-card .admin-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    position: absolute;
    bottom: 0;
    width: 100%;
}

#app .match-analysis-card .admin-controls button {
    width: 35px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

#app .match-analysis-card .admin-controls button:hover i::before {
    opacity: 1;
}

#app .match-analysis-card .admin-controls button i::before {
    color: #3eb489;
    opacity: 0.9;
}

.match-analysis-card .admin-controls button.share-button {
    width: 50px;
    height: 50px;
    min-width: initial;
    background-color: transparent;
    box-shadow: none;
    border-radius: 50%;
}

.match-analysis-card .player {
    border: 1px dashed #3eb489;
    position: relative;
    padding-top: 10px;
    margin-bottom: 40px;
}

.match-analysis-card .team2 .player {
    border: 1px dashed #4447e2;
}

.match-analysis-card .characters {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
}

.match-analysis-details h4 {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #3eb489;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
}

.match-analysis-details h4:hover {
    color: #3eb489;
}

.match-analysis-details h4 .category-icon {
    font-size: 10px;
    transition: transform 0.3s ease;
    display: inline-block;
}

.match-analysis-details h4 .count-badge {
    margin-left: auto;
    background: #3eb489;
    color: #242832;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 700;
}

.match-analysis-details .trigger {
    margin-bottom: 20px;
}

.match-analysis-details .trigger .label {
    animation: slideDown 0.3s ease;
    overflow: hidden;
}

@keyframes slideDown {
    from {
        opacity: 0;
        max-height: 0;
    }
    to {
        opacity: 1;
        max-height: 1000px;
    }
}

.match-analysis-details .label {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.match-analysis-details .label div {
    margin-right: 0;
}

.match-analysis-details .label div a {
    display: inline-block;
    padding: 6px 12px;
    background: linear-gradient(135deg, #4447e2 0%, #3c73a8 100%);
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}

.match-analysis-details .label div a:hover {
    background: linear-gradient(135deg, #5558ff 0%, #4a8fd6 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(68, 71, 226, 0.4);
}

.match-analysis-details .label div a:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.match-analysis-details .counters.label div a {
    background: linear-gradient(135deg, #e2447e 0%, #c73866 100%);
    color: #fff;
}

.match-analysis-details .counters.label div a:hover {
    background: linear-gradient(135deg, #ff5591 0%, #e04777 100%);
    box-shadow: 0 4px 8px rgba(226, 68, 126, 0.4);
}

.match-analysis-details .reversals.label div a {
    background: linear-gradient(135deg, #db8c10 0%, #b97409 100%);
}

.match-analysis-details .reversals.label div a:hover {
    background: linear-gradient(135deg, #ffa318 0%, #d79b0f 100%);
    box-shadow: 0 4px 8px rgba(219, 140, 16, 0.4);
}

.match-analysis-details .punishes.label div a {
    background: linear-gradient(135deg, #a144e2 0%, #8736c7 100%);
}

.match-analysis-details .punishes.label div a:hover {
    background: linear-gradient(135deg, #b855ff 0%, #9f47e8 100%);
    box-shadow: 0 4px 8px rgba(161, 68, 226, 0.4);
}

.match-analysis-details .throw-escapes.label div a {
    background: linear-gradient(135deg, #3eb489 0%, #2d9370 100%);
}

.match-analysis-details .throw-escapes.label div a:hover {
    background: linear-gradient(135deg, #4ecfa3 0%, #3aad86 100%);
    box-shadow: 0 4px 8px rgba(62, 180, 137, 0.4);
}

.match-analysis-details .hard-knockdowns.label div a {
    background: linear-gradient(135deg, #e24444 0%, #c73636 100%);
}

.match-analysis-details .hard-knockdowns.label div a:hover {
    background: linear-gradient(135deg, #ff5555 0%, #e04040 100%);
    box-shadow: 0 4px 8px rgba(226, 68, 68, 0.4);
}

.match-analysis-details .just.label div a {
    background: linear-gradient(135deg, #44c7e2 0%, #36a8c7 100%);
}

.match-analysis-details .just.label div a:hover {
    background: linear-gradient(135deg, #55ddff 0%, #40bfe0 100%);
    box-shadow: 0 4px 8px rgba(68, 199, 226, 0.4);
}

.match-analysis-details .player1 .player,
.match-analysis-details .player2 .player {
    margin-bottom: 20px;
    margin-top: 0;
}

.match-analysis-details .team1,
.match-analysis-details .team2 {
    margin-bottom: 30px;
}

.match-analysis-details .player {
    background: linear-gradient(135deg, #2a2d3a 0%, #1a1d2a 100%);
    border: 2px solid #3eb489;
    border-radius: 12px;
    padding: 20px 15px 15px 15px;
    position: relative;
}

.match-analysis-details .team2 .player {
    border-color: #4447e2;
}

.match-analysis-details .player-name {
    color: #fff;
    font-size: 18px;
    background: linear-gradient(135deg, #3eb489 0%, #2d9370 100%);
    display: inline-block;
    padding: 6px 20px;
    border-radius: 20px;
    position: absolute;
    top: -15px;
    left: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
}

.match-analysis-details .player-name:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(62, 180, 137, 0.4);
}

.match-analysis-details .team2 .player-name {
    background: linear-gradient(135deg, #4447e2 0%, #3c73a8 100%);
}

.match-analysis-details .team2 .player-name:hover {
    box-shadow: 0 6px 12px rgba(68, 71, 226, 0.4);
}

.match-analysis-details .player-name p {
    font-weight: 600;
    font-size: 16px;
    margin: 0;
}

.match-analysis-details .characters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.match-analysis-details .character {
    flex: 0 0 auto;
}

.match-analysis-details .character-name {
    cursor: pointer;
    transition: all 0.3s ease;
}

.match-analysis-details .character-name:hover {
    transform: translateY(-2px);
}

.match-analysis-details .character-name span {
    padding: 8px 20px 8px 50px;
    color: #242832;
    font-size: 14px;
    background: #3eb489;
    border-radius: 25px;
    display: inline-block;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    font-weight: 600;
}

.match-analysis-details .character-name:hover span {
    box-shadow: 0 4px 12px rgba(62, 180, 137, 0.4);
    background: #4ecfa3;
}

.match-analysis-details .team2 .character-name span {
    color: #fff;
    background: #4447e2;
}

.match-analysis-details .team2 .character-name:hover span {
    background: #5558ff;
    box-shadow: 0 4px 12px rgba(68, 71, 226, 0.4);
}

.match-analysis-details .character-name p {
    margin: 0;
}

.match-analysis-details .character .img-container {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    height: 35px;
    width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.match-analysis-details .character .img-container img {
    width: 35px;
    height: 35px;
    object-fit: cover;
}

.match-analysis-details .stats {
    padding: 10px;
}

.match-analysis-details .stats table {
    color: #fff;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 20px;
    background: #131419;
    border-radius: 12px;
    overflow: hidden;
}

.match-analysis-details .stats table th {
    background: linear-gradient(135deg, #3eb489 0%, #2d9370 100%);
    color: #fff;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 12px;
    padding: 12px 8px;
    border-bottom: 2px solid #242832;
}

.match-analysis-details .stats table th:first-child {
    text-align: left;
    padding-left: 16px;
}

.match-analysis-details .stats table tr {
    transition: background 0.2s ease;
}

.match-analysis-details .stats table tr:not(:first-child):hover {
    background: rgba(62, 180, 137, 0.1);
}

.match-analysis-details .stats table td {
    padding: 12px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 13px;
}

.match-analysis-details .stats table td:first-child {
    text-align: left;
    padding-left: 16px;
    font-weight: 500;
    color: #aaa;
}

.match-analysis-details .stats table tr:last-child td {
    border-bottom: none;
}

.match-analysis-details .stats table .value {
    text-align: center;
    font-weight: 700;
    font-size: 16px;
    color: #3eb489;
}

.match-analysis-details .analysis-summary {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.match-analysis-details .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, #2a2d3a 0%, #1a1d2a 100%);
    border-radius: 12px;
    padding: 16px 12px;
    flex: 1;
    min-width: 80px;
    border: 1px solid rgba(62, 180, 137, 0.2);
    transition: all 0.3s ease;
    cursor: default;
}

.match-analysis-details .summary-item:hover {
    border-color: #3eb489;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(62, 180, 137, 0.2);
}

.match-analysis-details .summary-label {
    font-size: 10px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
    font-weight: 600;
}

.match-analysis-details .summary-value {
    font-size: 18px;
    font-weight: 700;
    color: #3eb489;
    text-shadow: 0 0 10px rgba(62, 180, 137, 0.3);
}

#app.mobile.small-mobile .match-analysis-card {
    flex-direction: column;
}

#app.mobile.small-mobile .match-analysis-card .players {
    display: flex;
    width: 100%;
    flex-direction: column;
}

#app.mobile.small-mobile .match-analysis-card .players .player {
    margin-bottom: 0;
    max-width: 100%;
    width: 100%;
    margin-bottom: 20px;
}

#app.mobile.small-mobile .match-analysis-card .player-name {
    top: -9px;
}

#app.mobile.small-mobile .match-analysis-card .characters {
    padding: 0 5px;
}

#app.mobile.small-mobile .match-analysis-card .character-name span {
    padding: 3px 20px 3px 40px;
}

#app.mobile.small-mobile .match-analysis-card .game {
    margin-bottom: 0px;
}

#app.mobile.small-mobile .match-analysis-card .admin-controls button {
    height: 10px;
}

#app.mobile.small-mobile .match-analysis-card .player-name p {
    font-size: 12px;
}

#app.mobile.small-mobile .match-analysis-card .video-container {
    padding-bottom: 56.25%;
}

#app.mobile.small-mobile .match-analysis-card .aside {
    max-width: 100%;
}
</style>
