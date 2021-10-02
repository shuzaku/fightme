<!-- @format -->
<template>
    <div class="channel-scrapper">
        <div class="search">
            <v-text-field
                v-model="creatorUrl"
                class="creator-input"
                type="text"
                placeholder="Creator Url"
            />
            <v-btn @click="getChannelId()">Search Creator</v-btn>
        </div>
        <div v-if="videos" class="video-list-container">
            <div class="assign-all">
                <h2>Assign All:</h2>
                <game-search @update:game="setGame($event)" />
            </div>

            <div v-for="video in videos" :key="video.id" class="video-container">
                <div class="title-row">
                    <input v-model="video.selected" type="checkbox" />
                    <img :src="video.thumbnail" />
                    <p class="title">{{ video.title }}</p>
                </div>

                <game-search v-model="video.gameId" @update:game="updateGame($event, video)" />

                <div class="players">
                    <div class="player1">
                        <player-search
                            v-model="video.player1.id"
                            @update:player="addPlayer1($event, video)"
                        />
                        <character-search
                            v-if="video.gameId"
                            v-model="video.player1.characters"
                            multiple
                            :gameId="video.gameId"
                            @update:character="setPlayer1Characters($event, video)"
                        />
                    </div>
                    <div class="player2">
                        <player-search
                            v-model="video.player2.id"
                            @update:player="addPlayer2($event, video)"
                        />
                        <character-search
                            v-if="video.gameId"
                            v-model="video.player1.characters"
                            multiple
                            :gameId="video.gameId"
                            @update:character="setPlayer2Characters($event, video)"
                        />
                    </div>
                </div>
            </div>
            <v-btn @click="submit">Submit</v-btn>
        </div>
    </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import PlayerSearch from '@/components/players/player-search';
import CharacterSearch from '@/components/character/character-search';
import MatchesService from '@/services/matches-service';
import VideosService from '@/services/videos-service';
import CreatorsService from '@/services/creators-service';

export default {
    name: 'Videos',

    components: {
        'game-search': GameSearch,
        'player-search': PlayerSearch,
        'character-search': CharacterSearch
    },

    data() {
        return {
            videos: null,
            error: null,
            creatorUrl: null,
            channelId: null,
            channelTitle: null,
            creators: null,
            creatorId: null,
            limit: 100
        };
    },

    mounted() {
        this.fetch();
    },

    methods: {
        async fetch() {
            try {
                const url = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyCYRdDi_twi0Xq-4W70LJoargI63fI6ljg&channelId=${this.channelId}&part=snippet,id&order=date&maxResults=${this.limit}`;
                const response = await this.axios.get(url);
                this.channelTitle = response.data.items[0].snippet.channelTitle;
                this.videos = response.data.items.map(item => {
                    return {
                        id: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.default.url,
                        selected: false,
                        player1: {
                            id: null,
                            characters: []
                        },
                        player2: {
                            id: null,
                            characters: []
                        },
                        gameId: null
                    };
                });
                this.getCreators();
            } catch (err) {
                this.error = err;
            }
        },

        setGame(game) {
            this.videos.forEach(video => {
                video.gameId = game.id;
            });
        },

        async getChannelId() {
            this.channelId = this.creatorUrl.substring(
                this.creatorUrl.indexOf('/channel/') + 9,
                this.creatorUrl.length
            );
            this.fetch();
        },

        async submit() {
            var selected = this.videos.filter(video => video.selected);
            var matchRequest = selected.map(video => {
                return {
                    VideoUrl: video.id,
                    GameId: video.gameId,
                    Team1Players: [
                        {
                            Slot: 1,
                            Id: video.player1.id,
                            CharacterIds: video.player1.characters
                        }
                    ],
                    Team2Players: [
                        {
                            Slot: 2,
                            Id: video.player2.id,
                            CharacterIds: video.player2.characters
                        }
                    ]
                };
            });

            await MatchesService.addMatches(matchRequest);

            this.postVideo();
        },

        async postVideo() {
            var selected = this.videos.filter(video => video.selected);
            var videoRequest = selected.map(video => {
                return {
                    Url: video.id,
                    ContentType: 'Match',
                    ContentCreatorId: this.creatorId,
                    VideoType: 'youtube',
                    GameId: video.gameId
                };
            });
            await VideosService.addVideos(videoRequest);
        },

        addPlayer1(player, video) {
            video.player1.id = player.id;
        },

        addPlayer2(player, video) {
            video.player2.id = player.id;
        },

        setPlayer1Characters(characters, video) {
            video.player1.characters = characters.map(character => {
                return character.id;
            });
        },

        setPlayer2Characters(characters, video) {
            video.player2.characters = characters.map(character => {
                return character.id;
            });
        },

        updateGame(game, video) {
            video.gameId = game.id;
        },

        getContentCreatorId() {
            var channelId = this.channelId;
            var creatorMatch = this.creators.filter(creator => {
                return creator.youtubeId === channelId;
            });

            if (creatorMatch.length > 0) {
                this.creatorId = creatorMatch[0].id;
            } else {
                this.addCreator();
            }
        },

        async getCreators() {
            const response = await CreatorsService.fetchCreators();

            this.creators = response.data.creators.map(creator => {
                return {
                    id: creator._id,
                    name: creator.Name,
                    youtubeId: creator.YoutubeId
                };
            });

            this.getContentCreatorId();
        },

        async addCreator() {
            var response = await CreatorsService.addCreator({
                Name: this.channelTitle,
                YoutubeId: this.channelId
            });
            this.creatorId = response.data.id;
        }
    }
};
</script>

<style>
.channel-scrapper {
    padding-top: 150px;
}

.channel-scrapper .search .v-input__slot {
    background: #fff;
    margin: 0 20px 0 0;
}

.channel-scrapper .search .v-input {
    max-width: 320px;
}

.channel-scrapper .search .v-input input {
    padding: 5px;
}

.channel-scrapper .title-row input {
    max-width: 30px;
    margin-right: 15px;
}

.channel-scrapper .title-row {
    display: flex;
    align-items: center;
    color: #fff;
    margin-bottom: 20px;
}

.channel-scrapper .players {
    display: flex;
    align-items: center;
    color: #fff;
    justify-content: space-between;
}

.channel-scrapper .title-row img {
    max-width: 120px;
    width: 100%;
    margin-right: 15px;
}

.channel-scrapper .players .player1,
.channel-scrapper .players .player2 {
    max-width: 49%;
    width: 100%;
}

.channel-scrapper .video-container {
    border-bottom: 1px solid #fff;
    margin-bottom: 30px;
    padding-bottom: 20px;
}

.channel-scrapper .assign-all {
    margin: 20px auto 50px;
    color: #fff;
}

.channel-scrapper .search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    align-items: center;
}

.channel-scrapper .search input {
    margin: 0;
}
</style>
