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
                    <!-- <a v-if="account" class="menu-item" href="/favorites">Favorites</a> -->
                    <a v-if="account" class="menu-item" href="/collections">Collections</a>
                    <a v-if="account" class="menu-item" href="/notes">Notes</a>
                    <a v-if="account" class="menu-item" href="/match-logs">Match Logs</a>
                    <a v-if="isAdmin" class="menu-item admin-link" href="/admin/video-approval"
                        >Admin Panel</a
                    >
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
    name: 'AccountDropdown',
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

    computed: {
        isAdmin() {
            return this.account && this.account.role === 'admin';
        },
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

.account-dropdown .admin-link {
    color: #ff8f8f !important;
}
</style>
