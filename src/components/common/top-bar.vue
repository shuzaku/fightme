<!-- @format -->
<template>
    <div class="top-bar">
        <div class="top-bar-nav">
            <a href="/">
                <img
                    src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                />
            </a>
            <a class="menu-item" href="/explore">Explore</a>
            <a
                v-if="account && account.role === 'Admin User'"
                class="menu-item add-item"
                @click="toggleAddPopup()"
            >
                <v-icon> mdi-plus </v-icon>
                <create-options v-if="addPopupActive" />
            </a>
        </div>
        <general-search />
        <div class="account" @click="toggleAccountPopup()">
            <div class="account-arrow">
                <p v-if="!account">Login/Sign Up</p>
                <p v-else>{{ account.displayName }}</p>
                <v-icon> mdi-chevron-down </v-icon>
            </div>
        </div>
        <div v-if="accountPopupActive" class="account-popup">
            <div v-if="account" class="name-row">
                <div class="avatar"></div>
                {{ account.displayName }}
            </div>
            <div class="account-actions">
                <div class="logged-in" v-if="account">
                    <a v-if="account" class="menu-item" href="/favorites">Favorites</a>
                    <a v-if="account" class="menu-item" href="/collections">Collections</a>
                    <a v-if="account" class="menu-item" href="/notes">Notes</a>
                    <a class="menu-item" @click="logOut()">Log Out</a>
                </div>
                <div v-else class="not-logged-in-buttons">
                    <button @click="logIn()">Log In</button>
                    <button @click="register()">Register</button>
                </div>
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
        return {
            accountPopupActive: false,
            addPopupActive: false,
        };
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

        register() {
            this.toggleAccountPopup();
            eventbus.$emit('open:widget', { name: 'register' });
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
    min-width: 150px;
    padding: 20px 10px;
}

.top-bar .account-popup .account-actions .logged-in {
    display: flex;
    flex-direction: column;
}

.top-bar .account-popup .account-actions .logged-in .menu-item {
    margin-left: 0px;
    font-size: 18px;
}

.top-bar .account-popup .account-actions .not-logged-in-buttons button {
    display: block;
    margin-bottom: 5px;
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
