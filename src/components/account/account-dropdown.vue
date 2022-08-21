<!-- @format -->
<template>
    <div class="account-dropdown">
        <div class="account" @click="toggleAccountPopup()">
            <div class="account-arrow">
                <p v-if="!account">Login/Sign Up</p>
                <p v-else>{{ account.displayName }}</p>
                <v-icon> mdi-chevron-down </v-icon>
            </div>
        </div>
        <div v-if="accountPopupActive" class="account-popup">
            <div class="account-actions">
                <div v-if="account" class="logged-in">
                    <a v-if="account" class="menu-item" href="/favorites">Favorites</a>
                    <a v-if="account" class="menu-item" href="/collections">Collections</a>
                    <a v-if="account" class="menu-item" href="/notes">Notes</a>
                    <a class="menu-item" @click="logOut()">Log Out</a>
                </div>
                <div v-else class="not-logged-in-buttons">
                    <button @click="logIn()">Log In</button>
                    <button @click="register()">Register</button>
                    <!-- <twitch-login-button /> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    name: 'account-dropdown',
    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            accountPopupActive: false,
        };
    },

    mounted() {},

    methods: {
        toggleAccountPopup() {
            this.accountPopupActive = !this.accountPopupActive;
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
<style type="text/css">
.account-dropdown .account {
    width: 100%;
    display: flex;
    align-items: center;
}

.account-dropdown .account-actions {
    min-width: 150px;
    padding: 20px 10px;
}

.account-dropdown .account-actions .logged-in {
    display: flex;
    flex-direction: column;
}

.account-dropdown .account-actions .logged-in .menu-item {
    margin-left: 0px;
    font-size: 18px;
}

.account-dropdown .account-actions .not-logged-in-buttons button {
    display: block;
    margin-bottom: 5px;
}

.account-dropdown .account-actions button {
    color: #fff;
}
</style>
