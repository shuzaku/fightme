<!-- @format -->
<template>
    <div class="top-bar">
        <div class="top-bar-nav">
            <img
                src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
            />
            <a class="menu-item" href="/explore">Explore</a>
            <a class="menu-item" href="/favorites">Favorites</a>
            <a class="menu-item" href="/collections">Collections</a>
        </div>
        <general-search />
        <div class="account">
            <div class="avatar"></div>
            <div class="account-arrow"></div>
        </div>
    </div>
</template>

<script>
import GeneralSearch from '@/components/common/general-search';

export default {
    components: {
        'general-search': GeneralSearch,
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

    computed: {},

    created() {},

    methods: {},
};
</script>

<style>
.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    background: #1c1c24;
}

.top-bar img {
    max-width: 50px;
    top: 5px;
    left: 15px;
}

.top-bar .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #fff;
}

.top-bar .account {
    top: 6px;
    right: 55px;
    max-width: 33%;
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.top-bar .menu-item {
    color: #fff;
    font-size: 20px;
    text-decoration: none;
    margin-left: 20px;
    margin-top: 10px;
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
}
</style>
