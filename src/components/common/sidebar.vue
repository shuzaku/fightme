<!-- @format -->
<template>
    <div class="sidebar">
        <button class="close-btn">X</button>
        <div class="navigation">
            <a href="/" class="logo">
                <img
                    src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                />
                <p>Fighters-Edge</p>
            </a>
            <a v-if="account" class="menu-item" href="/notes">Notes</a>
            <a v-if="account" class="menu-item" href="/collections">Collections</a>
            <a v-if="account" class="menu-item" href="/favorites">Favorites</a>
            <a v-if="isAdmin" class="menu-item admin-link" href="/admin/video-approval"
                >Admin Panel</a
            >
            <a
                v-if="isAdmin"
                class="menu-item admin-link"
                href="/admin/player-link-requests"
            >
                Link requests
            </a>
            <a class="menu-item" @click="logOut()">Log Out</a>
        </div>
        <div class="social-media">
            <div class="svg-container">
                <a href="https://www.youtube.com/channel/UCEQbjKp4CDP1JzrzAcQEh8Q" target="_blank">
                    <font-awesome-icon :icon="['fab', 'youtube']" />
                </a>
                <a href="https://bsky.app/profile/fighters-edge.bsky.social" target="_blank">
                    <bluesky-icon width="15" height="15" />
                </a>
                <a href="https://twitter.com/fightersedgefgc" target="_blank">
                    <font-awesome-icon :icon="['fab', 'twitter']" />
                </a>
                <a href="https://www.tiktok.com/@fighters_edge?lang=en" target="_blank">
                    <font-awesome-icon :icon="['fab', 'tiktok']" />
                </a>
                <a href="https://www.instagram.com/fighters_edge_fgc/" target="_blank">
                    <font-awesome-icon :icon="['fab', 'instagram']" />
                </a>
                <a href="https://discord.gg/jKbEWfwqkn" target="_blank">
                    <font-awesome-icon :icon="['fab', 'discord']" />
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import Follows from '@/components/account/follows';
import AccountDropdown from '@/components/account/account-dropdown';
import BlueskyIcon from '@/components/svg/bluesky-icon';

export default {
    components: {
        follows: Follows,
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
        return {};
    },

    computed: {
        isAdmin() {
            return this.account && this.account.role === 'admin';
        },
    },

    created() {},

    methods: {
        logOut() {
            this.$emit('logout');
        },
    },
};
</script>

<style>
.sidebar {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    background: #242832;
    padding: 20px;
}

.sidebar .logo {
    font-size: 35px;
    color: #fff;
    text-decoration: none;
    gap: 10px;
    font-family: 'Roboto';
    font-weight: 800;
    margin-bottom: 40px;
    position: relative;
    display: block;
}

.sidebar .logo img {
    max-width: 100px;
    top: 5px;
    left: 15px;
}

.sidebar .svg-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    max-width: 200px;
}

.sidebar .svg-container path {
    fill: #3eb489;
}

.sidebar .account-arrow {
    color: #4447e2;
    display: flex;
    align-items: center;
}

.sidebar .v-icon::before {
    color: #4447e2;
}

.sidebar .menu-item {
    font-size: 25px;
    color: #fff;
    text-decoration: none;
    margin-top: 8px;
}

.sidebar .menu-item:hover {
    color: #3eb489;
}

.sidebar .account-dropdown .account-arrow {
    color: #fff;
    font-size: 25px;
}

.sidebar .account-dropdown,
.sidebar .menu-item {
    display: none;
}

#app.mobile.small-mobile .sidebar .account-dropdown,
#app.mobile.small-mobile .sidebar .menu-item {
    display: block;
}

.sidebar .close-btn {
    position: absolute;
    top: 20px;
    right: 10px;
    background: none;
    border: none;
    font-size: 40px;
    color: #3eb489;
}

.sidebar .close-btn:hover {
    color: #fff;
}
</style>
