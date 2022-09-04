<!-- @format -->
<template>
    <div id="app" :class="{ mobile: isMobile, 'small-mobile': isSmallMobile }">
        <top-bar :account="account" />
        <div class="content">
            <div class="side-panel" :class="{ 'menu-active': showMobileMenu }">
                <new-nav v-if="!isLoading" :account="account" />
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
                        <more-info-panel />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import NewNav from '@/components/common/new-nav';
import Modal from '@/components/common/modal';
import firebase from 'firebase';
import AccountsService from '@/services/accounts-service';
import moment from 'moment';
import TopBar from '@/components/common/top-bar';
import MoreInfoPanel from '@/components/common/more-info-panel';

export default {
    name: 'App',

    components: {
        'new-nav': NewNav,
        modal: Modal,
        'top-bar': TopBar,
        'more-info-panel': MoreInfoPanel,
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
            request: { FavoriteVideos: null },
            followedPlayers: [],
            followedGames: [],
            followedCharacters: [],
            collections: [],
        };
    },

    watch: {
        account() {
            eventbus.$emit('account:update', this.account);
        },
    },

    created() {
        this.getPersistantUser();
        eventbus.$on('open:widget', this.openModal);
        eventbus.$on('account:login', this.setAccount);
        eventbus.$on('video:favorite', this.addFavoriteVideo);
        eventbus.$on('player:follow', this.followPlayer);
        eventbus.$on('player:unfollow', this.unfollowPlayer);
        eventbus.$on('game:follow', this.followGame);
        eventbus.$on('game:unfollow', this.unfollowGame);
        eventbus.$on('character:follow', this.followCharacter);
        eventbus.$on('character:unfollow', this.unfollowCharacter);
        eventbus.$on('video:unfavorite', this.removeFavoriteVideo);
        eventbus.$on('account:logout', this.logout);
        eventbus.$on('account:loggedOut', this.resetAccount);
        eventbus.$on('account:loggedIn', this.getPersistantUser);
        eventbus.$on('toggle:mobile-nav', this.toggleMobileMenu);
        window.addEventListener('resize', this.calculateScreenWidth);
    },

    beforeDestroy() {
        eventbus.$off('open:widget', this.openModal);
        eventbus.$off('account:login', this.setAccount);
        eventbus.$off('video:favorite', this.addFavoriteVideo);
        eventbus.$off('game:follow', this.followGame);
        eventbus.$off('game:unfollow', this.unfollowGame);
        eventbus.$off('player:follow', this.followPlayer);
        eventbus.$off('player:unfollow', this.unfollowPlayer);
        eventbus.$off('character:follow', this.followCharacter);
        eventbus.$off('character:unfollow', this.unfollowCharacter);
        eventbus.$off('video:unfavorite', this.removeFavoriteVideo);
        eventbus.$off('account:logout', this.logout);
        eventbus.$on('account:loggedOut', this.resetAccount);
        eventbus.$off('account:loggedIn', this.getPersistantUser);

        window.removeEventListener('resize', this.calculateScreenWidth);
    },

    mounted() {
        this.calculateScreenWidth();
    },

    methods: {
        resetAccount() {
            this.account = {
                id: null,
                role: 'unregistered user',
            };
        },

        openModal(options) {
            this.options = options;
            this.isWidgetOpen = true;
        },

        closeModal() {
            this.isWidgetOpen = false;
        },

        calculateScreenWidth() {
            this.screenWidth = this.$refs.mainPanel.clientWidth;
            if (this.screenWidth < 820) {
                this.isSmallMobile = true;
                this.isMobile = true;
            } else {
                this.isMobile = false;
                this.isSmallMobile = false;
            }
            // eventbus.$emit('screen-size:update', this.screenWidth);
        },

        async fetchAccount(user) {
            this.isLoading = true;
            if (user.emailVerified) {
                const response = await AccountsService.getAccount({ id: user.uid });
                if (response.data.account[0]) {
                    this.account = {
                        id: response.data.account[0]._id,
                        uid: user.uid,
                        displayName: response.data.account[0].DisplayName,
                        email: response.data.account[0].Email,
                        emailVerified: response.data.account[0].IsEmailVerified,
                        favoriteVideos: response.data.account[0].FavoriteVideos
                            ? response.data.account[0].FavoriteVideos.map((video) => {
                                  return {
                                      contentType: video.ContentType,
                                      id: video.Id,
                                  };
                              })
                            : [],
                        followedPlayers:
                            response.data.account[0].FollowedPlayersDetails.map((player) => {
                                return {
                                    id: player._id,
                                    name: player.Name,
                                    imageUrl: player.PlayerImg,
                                    type: 'player',
                                    addedDate: this.getAddedDate(
                                        'player',
                                        player._id,
                                        response.data.account[0]
                                    ),
                                };
                            }) || [],
                        followedCharacters:
                            response.data.account[0].FollowedCharactersDetails.map((character) => {
                                return {
                                    id: character._id,
                                    name: character.Name,
                                    imageUrl: character.AvatarUrl,
                                    type: 'character',
                                    addedDate: this.getAddedDate(
                                        'character',
                                        character._id,
                                        response.data.account[0]
                                    ),
                                };
                            }) || [],
                        followedGames:
                            response.data.account[0].FollowedGamesDetails.map((game) => {
                                return {
                                    id: game._id,
                                    name: game.Title,
                                    imageUrl: game.LogoUrl,
                                    type: 'game',
                                    addedDate: this.getAddedDate(
                                        'game',
                                        game._id,
                                        response.data.account[0]
                                    ),
                                };
                            }) || [],
                        collections:
                            response.data.account[0].Collections.map((collection) => {
                                return {
                                    id: collection._id,
                                    title: collection.Name,
                                };
                            }) || [],
                        role: response.data.account[0].AccountType,
                    };
                }
                eventbus.$emit('account:update', this.account);
                this.isLoading = false;
            } else {
                eventbus.$emit('error:verification');
                this.isLoading = false;
            }
        },

        getAddedDate(type, id, response) {
            var date = null;
            switch (type) {
                case 'player':
                    date = response.FollowedPlayers.filter((player) => player.PlayerId === id)[0]
                        .AddedDate;
                    return date;
                case 'game':
                    date = response.FollowedGames.filter((game) => game.GameId === id)[0].AddedDate;
                    return date;
                case 'character':
                    date = response.FollowedCharacters.filter(
                        (character) => character.CharacterId === id
                    )[0].AddedDate;
                    return date;
                default:
                    return null;
            }
        },

        getPersistantUser() {
            var globalScope = this;
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    globalScope.fetchAccount(user);
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
                    eventbus.$emit('account:loggedOut', this.account);
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
                FollowedCharacters: this.mapCharacters(),
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
            this.account.favoriteVideos = favoriteVideos;
            // this.cloneFollowed();
            this.patchAccount();
        },

        followPlayer(playerId) {
            this.cloneFollowed();
            var newFollowPlayer = { id: playerId, addedDate: moment().format() };

            if (this.followedPlayers.length == 0) {
                this.followedPlayers = [newFollowPlayer];
            } else {
                this.followedPlayers.push(newFollowPlayer);
            }

            this.patchAccount();
        },

        followCharacter(characterId) {
            this.cloneFollowed();
            var newFollowCharacter = { id: characterId, addedDate: moment().format() };

            if (this.followedCharacters.length == 0) {
                this.followedCharacters = [newFollowCharacter];
            } else {
                this.followedCharacters.push(newFollowCharacter);
            }

            this.patchAccount();
        },

        followGame(gameId) {
            this.cloneFollowed();
            var newFollowedGame = { id: gameId, addedDate: moment().format() };

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
                        Id: targetId,
                    },
                ];
            } else {
                var favoriteVideos = this.account.favoriteVideos.map((video) => {
                    return {
                        ContentType: video.contentType,
                        Id: video.id,
                    };
                });

                favoriteVideos.push({
                    ContentType: video.contentType,
                    Id: targetId,
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

        unfollowPlayer(playerId) {
            this.cloneFollowed();

            for (var i = 0; i < this.followedPlayers.length; i++) {
                if (this.followedPlayers[i].id === playerId) {
                    this.followedPlayers.splice(i, 1);
                }
            }

            this.patchAccount();
        },

        unfollowCharacter(characterid) {
            this.cloneFollowed();

            for (var i = 0; i < this.followedCharacters.length; i++) {
                if (this.followedCharacters[i].id === characterid) {
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
            return this.followedPlayers.map((player) => {
                return {
                    PlayerId: player.id,
                    AddedDate: player.addedDate,
                };
            });
        },

        mapCharacters() {
            return this.followedCharacters.map((character) => {
                return {
                    CharacterId: character.id,
                    AddedDate: character.addedDate,
                };
            });
        },

        mapGames() {
            return this.followedGames.map((game) => {
                return {
                    GameId: game.id,
                    AddedDate: game.addedDate,
                };
            });
        },

        mapCollections() {
            return this.collections.map((collection) => {
                return collection.id;
            });
        },

        async patchAccount() {
            this.getRequest();
            await AccountsService.patchAccount(this.request);
            // this.fetchAccount(this.account);
        },

        cloneFollowed() {
            this.followedPlayers = this.account.followedPlayers;
            this.followedCharacters = this.account.followedCharacters;
            this.followedGames = this.account.followedGames;
            this.collections = this.account.collections;
        },

        setAccount(account) {
            this.account = account;
        },

        toggleMobileMenu() {
            this.showMobileMenu = !this.showMobileMenu;
        },
    },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#app {
    font-family: 'Roboto';
    min-height: 100vh;
    background: #242832;
    overflow: hidden;
    align-items: center;
    justify-content: center;
}

#app .main-panel {
    position: relative;
    width: 80%;
}

#app.mobile.small-mobile .main-panel {
    width: 100%;
}

#app .content {
    background: #131419;
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
    padding-top: 50px;
    justify-content: center;
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
    width: 100%;
}

#app .side-panel {
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 200px;
    border-right: 1px dashed #3eb489;
    padding-left: 10px;
}

#app .sidebar {
    position: fixed;
    top: 70px;
}

#app .main-panel {
    display: flex;
}

#app .main-content-container {
    padding: 0 40px;
    position: relative;
    min-height: 100vh;
    min-width: 600px;
    display: flex;
    width: 100%;
}

#app .more-info-panel {
    min-width: 400px;
    display: none;
}

.app .multiselect__tags {
    min-width: initial;
}

#app .trending-container {
    width: 350px;
    padding-top: 80px;
}

.tooltip {
    background: #fff;
    border-radius: 20px;
    padding: 5px 10px;
    font-family: 'Roboto';
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

#app.mobile.small-mobile .side-panel,
#app.mobile.small-mobile .more-info-panel {
    display: none;
}

#app.mobile.small-mobile .side-panel {
    position: fixed;
    left: 0;
    top: 60px;
    z-index: 999;
    background: #1c1c24;
    height: calc(100vh - 60px);
}

#app.mobile.small-mobile .side-panel.menu-active {
    display: block;
}

#app.mobile.small-mobile .character-nav .info-card {
    margin: 5px;
    padding: 0 10px;
}

#app.mobile.small-mobile .general-search {
    min-width: 200px;
}

/* #app.mobile.small-mobile .side-panel .navigation {
    top: 0;
    left: -400px;
    transition: all 0.3s linear;
}

#app.mobile.small-mobile .side-panel.menuActive .navigation {
    left: 0;
} */

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
    /* #app .side-panel {
        width: 70px;
        min-width: 70px;
    } */

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
