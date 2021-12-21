<!-- @format -->
<template>
    <div id="app" :class="{ mobile: isMobile, 'small-mobile': isSmallMobile }">
        <div class="content">
            <div class="side-panel" :class="{ menuActive: showMobileMenu }">
                <new-nav v-if="!isLoading" :account="account" />
                <div class="mobile-bar" v-if="isSmallMobile">
                    <v-list-item-avatar>
                        <v-img
                            src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                        ></v-img>
                    </v-list-item-avatar>
                    <v-icon @click="showMobileMenu = !showMobileMenu">mdi-menu</v-icon>
                </div>
            </div>
            <div ref="mainPanel" class="main-panel">
                <modal
                    v-if="isWidgetOpen"
                    :options="options"
                    :account="account"
                    @closeModal="closeModal()"
                />
                <div class="content-container">
                    <div v-if="!isLoading" class="main-content-container">
                        <router-view :account="account" />
                    </div>
                </div>
            </div>
        </div>
        <div class="svg-container"></div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import NewNav from '@/components/common/new-nav';
import Modal from '@/components/common/modal';
// import Trending from '@/components/trending/trending';
import firebase from 'firebase';
import AccountsService from '@/services/accounts-service';
import moment from 'moment';

export default {
    name: 'App',

    components: {
        'new-nav': NewNav,
        modal: Modal
        // trending: Trending
    },

    data() {
        return {
            options: null,
            isWidgetOpen: false,
            screenWidth: 0,
            isMobile: false,
            isSmallMobile: false,
            account: null,
            isLoading: true,
            showMobileMenu: false,
            request: null,
            followedPlayers: [],
            followedGames: [],
            followedCharacters: [],
            collections: []
        };
    },

    watch: {
        account() {
            eventbus.$emit('account:update', this.account);
        }
    },

    created() {
        this.account = {
            id: null,
            role: 'unregistered user'
        };
        this.getPersistantUser();
        eventbus.$on('open:widget', this.openModal);
        eventbus.$on('account:login', this.setAccount);
        eventbus.$on('video:favorite', this.addFavoriteVideo);
        eventbus.$on('player:follow', this.followPlayer);
        eventbus.$on('player:unfollow', this.unfollowPlayer);
        eventbus.$on('game:follow', this.followgame);
        eventbus.$on('game:unfollow', this.unfollowgame);
        eventbus.$on('character:follow', this.followCharacter);
        eventbus.$on('character:unfollow', this.unfollowCharacter);
        eventbus.$on('game:follow', this.followGame);
        eventbus.$on('game:unfollow', this.unfollowGame);
        eventbus.$on('video:unfavorite', this.removeFavoriteVideo);
        eventbus.$on('account:logout', this.logout);
        window.addEventListener('resize', this.calculateScreenWidth);
    },

    beforeDestroy() {
        eventbus.$off('open:widget', this.openModal);
        eventbus.$off('account:login', this.setAccount);
        eventbus.$off('video:favorite', this.addFavoriteVideo);
        eventbus.$off('game:follow', this.followgame);
        eventbus.$off('game:unfollow', this.unfollowgame);
        eventbus.$off('player:follow', this.followPlayer);
        eventbus.$off('player:unfollow', this.unfollowPlayer);
        eventbus.$off('character:follow', this.followCharacter);
        eventbus.$off('character:unfollow', this.unfollowCharacter);
        eventbus.$off('video:unfavorite', this.removeFavoriteVideo);
        eventbus.$off('game:follow', this.followGame);
        eventbus.$off('game:unfollow', this.unfollowGame);
        eventbus.$off('account:logout', this.logout);
        window.removeEventListener('resize', this.calculateScreenWidth);
    },

    mounted() {
        this.calculateScreenWidth();
    },

    methods: {
        openModal(options) {
            this.options = options;
            this.isWidgetOpen = true;
        },

        closeModal() {
            this.isWidgetOpen = false;
        },

        calculateScreenWidth() {
            this.screenWidth = this.$refs.mainPanel.clientWidth;
            if (this.screenWidth < 900) {
                this.isSmallMobile = true;
                this.isMobile = true;
            } else if (this.screenWidth < 900) {
                this.isMobile = true;
                this.isSmallMobile = false;
            } else {
                this.isMobile = false;
                this.isSmallMobile = false;
            }
            // eventbus.$emit('screen-size:update', this.screenWidth);
        },

        async fetchAccount(id) {
            this.loading = true;
            if (id) {
                const response = await AccountsService.getAccount({ id: id });
                console.log(response.data)
                this.account = {
                    id: response.data.account[0]._id,
                    uid: id,
                    displayName: response.data.account[0].DisplayName,
                    email: response.data.account[0].Email,
                    favoriteVideos: response.data.account[0].FavoriteVideos
                        ? response.data.account[0].FavoriteVideos.map(video => {
                              return {
                                  contentType: video.ContentType,
                                  id: video.Id
                              };
                          })
                        : [],
                    followedPlayers:
                        response.data.account[0].FollowedPlayersDetails.map(player => {
                            return {
                                id: player._id,
                                name: player.Name,
                                imageUrl: player.PlayerImg,
                                type:"player",
                                addedDate: this.getAddedDate("player" , player._id, response.data.account[0]),
                            };
                        }) || [],
                    followedCharacters:
                        response.data.account[0].FollowedCharactersDetails.map(character => {
                            return {
                                id: character._id,
                                name: character.Name,
                                imageUrl: character.AvatarUrl,
                                type:"character",
                                addedDate: this.getAddedDate("character" , character._id, response.data.account[0]),

                            };
                        }) || [],
                    followedGames:
                        response.data.account[0].FollowedGamesDetails.map(game => {
                            return {
                                id: game._id,
                                name: game.Title,
                                imageUrl: game.LogoUrl,
                                type:"game",
                                addedDate: this.getAddedDate("game" , game._id, response.data.account[0]),

                            };
                        }) || [],
                    collections:
                        response.data.account[0].Collections.map(collection => {
                            return {
                                id: collection._id,
                                title: collection.Name
                            };
                        }) || [],
                    role: response.data.account[0].AccountType
                };
            }
            eventbus.$emit('account:update', this.account);
            this.isLoading = false;
        },

        getAddedDate(type, id, response) {
            switch(type) {
                case 'player':
                    var date = response.FollowedPlayers.filter(player => player.PlayerId === id)[0].AddedDate;
                    return date;
                    break;
                case 'game':
                    var date = response.FollowedGames.filter(game => game.GameId === id)[0].AddedDate;
                    return date;                    
                    break;
                case 'character':
                    var date = response.FollowedCharacters.filter(character => character.CharacterId === id)[0].AddedDate;
                    return date;                    
                    break;
                default :
                    return null;
                    break
            }
        },

        getPersistantUser() {
            var globalScope = this;
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    globalScope.fetchAccount(user.uid);
                } else {
                    globalScope.isLoading = false;
                }
            });
        },

        logout() {
            firebase
                .auth()
                .signOut()
                .then(() => {
                    this.account = null;
                })
                .catch(() => {});
        },

        getRequest() {
            this.request = {
                id: this.account.id,
                FavoriteVideos: this.account.favoriteVideos,
                Collections: this.mapCollections(),
                FollowedPlayers: this.mapPlayers(),
                FollowedGames: this.mapGames(),
                FollowedCharacters: this.mapCharacters()
            };
        },

        addFavoriteVideo(video) {
            var targetId = null;

            if (video.contentType === 'Combo') {
                targetId = video.combo.id;
            } else {
                targetId = video.id;
            }

            var favoriteVideos = this.createFavoriteVideoRequest(targetId, video);
            this.request.FavoriteVideos = favoriteVideos;

            this.patchAccount();
        },

        followPlayer(player) {
            this.cloneFollowed();
             var newFollowPlayer = {'id': player.id, addedDate: moment().format()};

            if (this.followedPlayers.length == 0) {
                this.followedPlayers = [newFollowPlayer];
            } else {
                this.followedPlayers.push(newFollowPlayer);
            }

            this.patchAccount();
        },

        followCharacter(character) {
            this.cloneFollowed();
            var newFollowCharacter = {'id': character.id, addedDate: moment().format()};

            if (this.followedCharacters.length == 0) {
                this.followedCharacters = [newFollowCharacter];
            } else {
                this.followedCharacters.push(newFollowCharacter);
            }

            this.patchAccount();
        },

        followGame(game) {
            this.cloneFollowed();
            var newFollowedGame = {'id': game.id, addedDate: moment().format()};

            if (this.followedGames.length == 0) {
                this.followedGames = [newFollowedGame];
            } else {
                this.followedGames.push(newFollowedGame);
            }

            this.patchAccount();
        },

        createFavoriteVideoRequest(targetId, video) {
            if (this.account.favoriteVideos.length == 0) {
                return [
                    {
                        ContentType: video.contentType,
                        Id: targetId
                    }
                ];
            } else {
                var favoriteVideos = this.account.favoriteVideos.map(video => {
                    return {
                        ContentType: video.contentType,
                        Id: video.id
                    };
                });

                favoriteVideos.push({
                    ContentType: video.contentType,
                    Id: targetId
                });

                return favoriteVideos;
            }
        },

        removeFavoriteVideo(video) {
            var targetId = null;

            if (video.contentType === 'Combo') {
                targetId = video.combo.id;
            } else {
                targetId = video.id;
            }

            for (var i = 0; i < this.account.favoriteVideos.length; i++) {
                if (this.account.favoriteVideos[i].Id === targetId) {
                    this.account.favoriteVideos.splice(i, -1);
                }
            }

            this.patchAccount();
        },

        unfollowPlayer(player) {
            this.cloneFollowed();

            for (var i = 0; i < this.followedPlayers.length; i++) {
                if (this.followedPlayers[i].id === player.id) {
                    this.followedPlayers.splice(i, 1);
                }
            }

            this.patchAccount();
        },

        unfollowCharacter(character) {
            this.cloneFollowed();

            for (var i = 0; i < this.followedCharacters.length; i++) {
                if (this.followedCharacters[i].id === character.id) {
                    this.followedCharacters.splice(i, 1);
                }
            }

            this.patchAccount();
        },

        unfollowGame(game) {
            this.cloneFollowed();
            for (var i = 0; i < this.followedGames.length; i++) {
                if (this.followedGames[i].id === game.id) {
                    this.followedGames.splice(i, 1);
                }
            }

            this.patchAccount();
        },

        mapPlayers() {
            return this.followedPlayers.map(player => { 
                return {
                    PlayerId: player.id,
                    AddedDate: player.addedDate
                }}
            );
        },

        mapCharacters() {
            return this.followedCharacters.map(character => { 
                return {
                    CharacterId: character.id,
                    AddedDate: character.addedDate
                }}
            );        },

        mapGames() {
            return this.followedGames.map(game => { 
                return {
                    GameId: game.id,
                    AddedDate: game.addedDate
                }}
            );        },

        mapCollections() {
            return this.collections.map(collection => {
                return collection.id;
            });
        },

        async patchAccount() {
            this.getRequest();
            await AccountsService.patchAccount(this.request);
            this.fetchAccount(this.account.uid);
        },

        cloneFollowed() {
            this.followedPlayers = this.account.followedPlayers;
            this.followedCharacters = this.account.followedCharacters;
            this.followedGames = this.account.followedGames;
            this.collections = this.account.collections;
        }
    }
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#app {
    font-family: 'Roboto';
    min-height: 100vh;
    background: #171733;
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
}

#app h1 {
    margin-bottom: 40px;
}

#app .main-panel {
    position: relative;
    width: 100%;
    overflow: hidden;
}

#app .content {
    background: #333333;
    display: flex;
    overflow: auto;
    width: 100%;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 20px 50px rgb(0 0 0 / 30%);
    position: relative;
    align-content: center;
    overflow: hidden;
    flex-basis: auto;
    height: 100%;
    min-height: 100%;
}

#app .top-nav {
    z-index: 90;
    position: absolute;
    top: 0;
    left: 0;
}

#app .text-center {
    text-align: center;
}

#app .heavy-weight {
    font-weight: 600;
}

#app .content-container {
    display: flex;
}

#app .side-panel {
    flex-grow: 1;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    position: relative;
    width: 50vw;
    min-width: 255px;
    border-right: 1px dashed #3eb489;
}

#app .main-panel {
    flex-grow: 1;
    display: flex;
}

#app .main-content-container {
    /* max-width: 700px; */
    border-right: 1px dashed #3eb489;
    margin-right: 50px;
    padding: 0 40px;
    position: relative;
    min-height: 100vh;
    min-width: 600px;
}

#app .trending-container {
    width: 350px;
    padding-top: 80px;
}

.tooltip {
    background: #fff;
    border-radius: 20px;
    padding: 5px 10px;
    font-family: "Roboto"
}

.trending-container h2 {
    color: #fff;
    letter-spacing: 3px;
    font-weight: 400;
    text-transform: uppercase;
}

input,
textarea {
    display: block;
    border: 1px solid #eee;
    padding: 10px 15px;
    border-radius: 5px;
    width: 100%;
    margin-bottom: 20px;
}

.multiselect input {
    border: none;
    margin-bottom: 0;
}

.multiselect {
    margin-bottom: 20px;
}

#app.mobile .main-content-container {
    padding: 0;
}

#app.mobile .side-nav {
    width: 25%;
}

#app.mobile .videos-container {
    padding: 0 10px;
}

#app.mobile .content-container,
#app.mobile .videos-container,
#app.mobile .videos-view,
#app.mobile .video-card,
#app.mobile .main-content-container {
    width: 100%;
    max-width: initial;
    min-width: 0;
    border: 0;
}

#app.mobile .main-content-container {
    margin-right: 0;
}

#app.mobile .video-card {
    max-width: 392px;
    margin: 30px auto 30px;
}

#app.mobile .video-card:first-child {
    margin-top: 60px;
}

#app.mobile .video-card iframe {
    width: 392px !important;
    height: 225px;
}

#app.mobile.small-mobile .video-card {
    max-width: 392px;
    margin: 30px auto 30px;
}

#app.mobile.small-mobile .video-card:first-child {
    margin-top: 60px;
}

#app.mobile.small-mobile .video-card iframe {
    width: 392px !important;
    height: 225px;
}

#app.mobile.small-mobile .character-bubble {
    display: none;
}

#app.mobile.small-mobile .side-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 50px;
    width: 100%;
    background: #151515;
    z-index: 99;
    padding: 5px 10px 0;
}

#app.mobile.small-mobile .side-panel .navigation {
    top: 0;
    left: -400px;
    transition: all 0.3s linear;
}

#app.mobile.small-mobile .side-panel.menuActive .navigation {
    left: 0;
}

#app.mobile.small-mobile .side-nav {
    width: 100%;
    display: flex;
    padding: 0;
    justify-content: space-around;
}

#app.mobile.small-mobile .menu-heading svg {
    margin: 0 auto;
}

#app.mobile.small-mobile .side-nav .menu-heading,
#app.mobile.small-mobile .side-nav .logo h2 {
    margin-bottom: 0px;
}

#app.mobile.small-mobile .side-nav .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-around;
}

#app.mobile.small-mobile .side-nav {
    height: initial;
    flex-direction: row;
}

#app.mobile.small-mobile .top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    max-width: 80%;
    width: 100%;
}

#app.mobile.small-mobile .bottom-section {
    align-items: center;
    display: flex;
}

#app.mobile.small-mobile .logo img {
    width: 40px;
    left: 0;
}

#app.mobile.small-mobile .account {
    display: none;
}

#app .mobile-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

#app .mobile-bar button {
    color: #fff;
    top: -5px;
}

#app .mobile-bar .v-responsive {
    top: -10px;
}

@media only screen and (max-width: 1000px) {
    #app .side-panel {
        width: 70px;
        min-width: 70px;
    }

    #app .side-nav .menu-item span,
    #app .side-nav .title {
        display: none;
    }

    #app .side-nav .logo span {
        right: 5px;
    }

    #app .side-nav .menu-item {
        margin-left: 0px;
    }

    #app .trending-container {
        display: none;
    }

    #app .character-recommended {
        padding: 0;
        max-width: 570px;
        margin: 20px auto;
    }

    #app .content-container {
        flex-direction: column-reverse;
    }
}
</style>
