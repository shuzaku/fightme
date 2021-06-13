<!-- @format -->
<template>
    <div id="app" :class="{ mobile: isMobile, 'small-mobile': isSmallMobile }">
        <div class="content">
            <div class="side-panel">
                <side-nav :account="account" />
            </div>
            <div ref="mainPanel" class="main-panel">
                <modal v-if="isWidgetOpen" :options="options" @closeModal="closeModal()" />
                <div class="content-container">
                    <div v-if="!isLoading" class="main-content-container">
                        <top-nav />
                        <router-view :account="account" />
                    </div>
                    <trending v-if="$route.name === 'Videos'" />
                    <character-recommended v-if="$route.name === 'Character'" />
                </div>
            </div>
        </div>
        <div class="svg-container"></div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import TopNav from '@/components/common/top-nav';
import SideNav from '@/components/common/side-nav';
import Modal from '@/components/common/modal';
import Trending from '@/components/trending/trending';
import CharacterRecommended from '@/components/character/character-recommended';
import firebase from 'firebase';
import AccountsService from '@/services/accounts-service';

export default {
    name: 'App',

    components: {
        'top-nav': TopNav,
        'side-nav': SideNav,
        'character-recommended': CharacterRecommended,
        modal: Modal,
        trending: Trending
    },

    data() {
        return {
            options: null,
            isWidgetOpen: false,
            screenWidth: 0,
            isMobile: false,
            isSmallMobile: false,
            account: null,
            isLoading: true
        };
    },

    watch: {
        account() {
            eventbus.$emit('account:update', this.account);
        }
    },

    created() {
        this.getPersistantUser();
        eventbus.$on('open:widget', this.openModal);
        eventbus.$on('account:login', this.setAccount);
        eventbus.$on('video:favorite', this.addFavoriteVideo);
        eventbus.$on('video:unfavorite', this.removeFavoriteVideo);
        eventbus.$on('account:logout', this.logout);

        window.addEventListener('resize', this.calculateScreenWidth);
    },

    beforeDestroy() {
        eventbus.$off('open:widget', this.openModal);
        eventbus.$off('account:login', this.setAccount);
        eventbus.$off('video:favorite', this.addFavoriteVideo);
        eventbus.$off('video:unfavorite', this.removeFavoriteVideo);
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
            if (this.screenWidth < 425) {
                this.isSmallMobile = true;
                this.isMobile = true;
            } else if (this.screenWidth < 755) {
                this.isMobile = true;
                this.isSmallMobile = false;
            } else {
                this.isMobile = false;
                this.isSmallMobile = false;
            }
            // eventbus.$emit('screen-size:update', this.screenWidth);
        },

        setAccount(account) {
            this.account = account;
            this.isLoading = false;
        },

        async fetchAccount(id) {
            const response = await AccountsService.getAccount({ id: id });
            var account = {
                id: response.data.account[0]._id,
                displayName: response.data.account[0].DisplayName,
                email: response.data.account[0].Email,
                favoriteVideos: response.data.account[0].FavoriteVideos.map(video => {
                    return {
                        contentType: video.ContentType,
                        id: video.Id
                    };
                }),
                collections: response.data.account[0].Collections
            };

            this.setAccount(account);
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
                .catch(error => {
                    console.log(error);
                });
        },

        async addFavoriteVideo(video) {
            var targetId = null;
            var request = null;

            if (video.contentType === 'Combo') {
                targetId = video.combo.id;
            } else {
                targetId = video.id;
            }

            if (this.account.favoriteVideos.length == 0) {
                this.account.favoriteVideos = [
                    {
                        ContentType: video.contentType,
                        Id: targetId
                    }
                ];

                request = {
                    id: this.account.id,
                    FavoriteVideos: this.account.favoriteVideos
                };
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

                request = {
                    id: this.account.id,
                    FavoriteVideos: favoriteVideos
                };
            }

            await AccountsService.patchAccount(request);
        },

        async removeFavoriteVideo(video) {
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

            var request = {
                id: this.account.id,
                FavoriteVideos: this.account.favoriteVideos
            };

            await AccountsService.patchAccount(request);
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
    max-width: 700px;
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
    width: initial;
    padding: 80px 5px;
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

@media only screen and (max-width: 1125px) {
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
}
</style>
