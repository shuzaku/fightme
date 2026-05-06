<!-- @format -->
<template>
    <div class="top-bar">
        <div class="top-bar-nav">
            <a href="/" class="logo">
                <img
                    src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                />
                <span>Fighters-Edge</span>
            </a>

            <a v-if="account" class="menu-item add-item" @click="toggleAddPopup()">
                <v-icon> mdi-plus </v-icon>
                <create-options v-if="addPopupActive" :account="account" />
            </a>
        </div>
        <general-search />
        <div class="social-links">
            <a href="https://discord.gg/jKbEWfwqkn" target="_blank" class="social-link" title="Join our Discord">
                <font-awesome-icon :icon="['fab', 'discord']" />
            </a>
            <a href="https://www.youtube.com/channel/UCEQbjKp4CDP1JzrzAcQEh8Q" target="_blank" class="social-link" title="YouTube">
                <font-awesome-icon :icon="['fab', 'youtube']" />
            </a>
            <a href="https://bsky.app/profile/fighters-edge.bsky.social" target="_blank" class="social-link" title="Bluesky">
                <bluesky-icon width="20" height="20" />
            </a>
            <a href="https://twitter.com/fightersedgefgc" target="_blank" class="social-link" title="Twitter">
                <font-awesome-icon :icon="['fab', 'twitter']" />
            </a>
        </div>
        <button class="hamburger-btn">
            <font-awesome-icon :icon="['fa', 'bars']" @click="showMobileMenu" />
        </button>
        <account-dropdown :account="account" />
    </div>
</template>

<script>
import GeneralSearch from '@/components/common/general-search';
import CreateOptions from '@/components/common/create-options';
import TwitchLoginButton from '@/components/account/twitch-login-button';
import AccountDropdown from '@/components/account/account-dropdown';
import BlueskyIcon from '@/components/svg/bluesky-icon';

import { eventbus } from '@/main';

export default {
    components: {
        'general-search': GeneralSearch,
        'create-options': CreateOptions,
        'twitch-login-button': TwitchLoginButton,
        'account-dropdown': AccountDropdown,
        'bluesky-icon': BlueskyIcon,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            accountPopupActive: false,
            addPopupActive: false,
        };
    },

    computed: {},

    created() {
        eventbus.$on('open:account', this.isGameFollowed);
    },

    beforeDestroy() {},

    methods: {
        toggleAccountPopup() {
            this.accountPopupActive = !this.accountPopupActive;
        },

        toggleAddPopup() {
            this.addPopupActive = !this.addPopupActive;
        },

        showMobileMenu() {
            eventbus.$emit('toggle:mobile-nav');
        },
    },
};
</script>

<style>
.top-bar {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    min-height: var(--app-top-bar-height, 84px);
    padding: 0 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    width: 100%;
    max-width: 100vw;
    background: #1c1c24;
}

.top-bar img {
    max-width: 50px;
    top: 5px;
    left: 15px;
}

.top-bar .logo {
    font-size: 35px;
    color: #fff;
    text-decoration: none;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 10px;
    font-family: 'Roboto';
    font-weight: 800;
    white-space: nowrap;
    flex-shrink: 0;
}

.top-bar .logo span {
    white-space: nowrap;
    line-height: 1.05;
}

.mobile .top-bar .logo {
    font-size: 20px;
}

.top-bar .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #fff;
}

.top-bar .menu-item {
    color: #fff;
    font-size: 20px;
    text-decoration: none;
    margin-left: 20px;
    margin-top: 10px;
}

#app.mobile.small-mobile .top-bar .menu-item {
    display: none;
}

.top-bar .top-bar-nav {
    display: flex;
    align-items: center;
    max-width: 33%;
    width: 100%;
}

.top-bar .general-search {
    max-width: 33%;
    width: 100%;
    min-width: 0;
}

.top-bar .account-arrow {
    color: #4447e2;
    display: flex;
}

.top-bar .v-icon::before {
    color: #4447e2;
}

.top-bar .account-popup {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    background: #1e2130;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    min-width: 200px;
    z-index: 1000;
}

.top-bar .account-popup .name-row {
    display: flex;
    align-items: center;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 16px 18px;
    background: rgba(255, 255, 255, 0.03);
}

.top-bar .account-popup .name-row .avatar {
    margin-right: 12px;
    width: 30px;
    height: 30px;
}

.top-bar .account-popup .account-actions {
    padding: 8px 0;
}

.top-bar .account-popup .account-actions .logged-in {
    display: flex;
    flex-direction: column;
}

.top-bar .account-popup .account-actions .logged-in .menu-item {
    display: flex;
    align-items: center;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
}

.top-bar .account-popup .account-actions .logged-in .menu-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
}

.top-bar .account-popup .account-actions .logged-in .menu-item:last-child {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 4px;
    color: rgba(255, 100, 100, 0.85);
}

.top-bar .account-popup .account-actions .logged-in .menu-item:last-child:hover {
    background: rgba(255, 80, 80, 0.08);
    color: #ff6b6b;
}

.top-bar .account-popup .account-actions .not-logged-in-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
}

.top-bar .account-popup .account-actions .not-logged-in-buttons button {
    width: 100%;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}

.top-bar .account-popup .account-actions .not-logged-in-buttons button:first-child {
    background: #3eb489;
    color: #fff;
}

.top-bar .account-popup .account-actions .not-logged-in-buttons button:first-child:hover {
    background: #2d8a6a;
}

.top-bar .account-popup .account-actions .not-logged-in-buttons button:last-child {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.top-bar .account-popup .account-actions .not-logged-in-buttons button:last-child:hover {
    background: rgba(255, 255, 255, 0.13);
    color: #fff;
}

.top-bar .account-popup .account-actions button {
    color: #fff;
}

.top-bar .add-item {
    position: relative;
    display: flex;
}

.top-bar .create-options {
    position: absolute;
    left: -15px;
    top: 30px;
}

.top-bar .social-links {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 0 20px;
}

.top-bar .social-link {
    color: #fff;
    font-size: 20px;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
}

.top-bar .social-link:hover {
    color: #3eb489;
}

.top-bar .hamburger-btn {
    display: none;
}

.top-bar .hamburger-btn svg path {
    fill: #fff;
}

#app.mobile.small-mobile .top-bar .social-links {
    display: none;
}

#app.mobile.small-mobile .top-bar .account-dropdown {
    display: none;
}

#app.mobile.small-mobile .top-bar .hamburger-btn {
    display: block;
}

#app.mobile.small-mobile .top-bar .general-search {
    display: none;
}

#app.mobile.small-mobile .top-bar .top-bar-nav {
    max-width: 100%;
}
</style>
