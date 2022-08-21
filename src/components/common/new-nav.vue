<!-- @format -->
<template>
    <div class="sidebar">
        <div class="navigation">
            <account-dropdown :account="account" />
            <a class="menu-item" href="/explore">Explore</a>
            <follows :account="account" />
        </div>
        <div class="social-media">
            <div class="svg-container">
                <a href="https://www.youtube.com/channel/UCEQbjKp4CDP1JzrzAcQEh8Q" target="_blank">
                    <font-awesome-icon :icon="['fab', 'youtube']" />
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
                <a href="https://discord.gg/n373TGP727" target="_blank">
                    <font-awesome-icon :icon="['fab', 'discord']" />
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import Follows from '@/components/account/follows';
import AccountDropdown from '@/components/account/account-dropdown';

export default {
    components: {
        follows: Follows,
        'account-dropdown': AccountDropdown,
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

    created() {},

    methods: {},
};
</script>

<style>
.sidebar {
    width: 175px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.sidebar .svg-container {
    display: flex;
    justify-content: space-between;
    max-width: 150px;
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
</style>
