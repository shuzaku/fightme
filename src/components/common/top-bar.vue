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
            <a
                v-if="account && (account.role = 'Admin User')"
                class="menu-item add-item"
                @click="toggleAddPopup()"
            >
                Add <v-icon> mdi-chevron-down </v-icon>
                <create-options v-if="addPopupActive" />
            </a>
        </div>
        <general-search />
        <div class="account">
            <div class="avatar"></div>
            <div class="account-arrow" @click="toggleAccountPopup()">
                <v-icon> mdi-chevron-down </v-icon>
            </div>
        </div>
        <div v-if="accountPopupActive" class="account-popup">
            <div v-if="account.id" class="name-row">
                <div class="avatar"></div>
                {{ account.displayName }}
            </div>
            <div class="account-actions">
                <button v-if="account.id" @click="logOut()">Log Out</button>
                <button v-else @click="logIn()">Log In</button>
            </div>
        </div>
    </div>
</template>

<script>
import GeneralSearch from '@/components/common/general-search';
import CreateOptions from '@/components/common/create-options';
import { eventbus } from '@/main';

export default {
    components: {
        'general-search': GeneralSearch,
        'create-options': CreateOptions,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return { accountPopupActive: false, addPopupActive: false };
    },

    computed: {},

    created() {},

    beforeDestroy() {},

    methods: {
        toggleAccountPopup() {
            this.accountPopupActive = !this.accountPopupActive;
        },

        toggleAddPopup() {
            this.addPopupActive = !this.addPopupActive;
        },

        logOut() {
            this.toggleAccountPopup();
            eventbus.$emit('account:logout');
        },

        logIn() {
            this.toggleAccountPopup();
            eventbus.$emit('open:widget', { name: 'login' });
        },
    },
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
    align-items: center;
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

.top-bar .v-icon::before {
    color: #4447e2;
}

.top-bar .account-popup {
    position: absolute;
    right: 0;
    background: #242832;
    top: 60px;
    padding: 10px 15px;
}

.top-bar .account-popup .name-row {
    display: flex;
    align-items: center;
    color: #fff;
    border-bottom: 1px solid #fff;
    padding-bottom: 20px;
}

.top-bar .account-popup .name-row .avatar {
    margin-right: 20px;
    width: 30px;
    height: 30px;
}

.top-bar .account-popup .account-actions {
    margin-top: 20px;
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
</style>
