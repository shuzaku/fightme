<!-- @format -->
<template>
    <div class="account-menu">
        <div v-if="!account">
            <div class="menu-item" @click="openRegisterModal()">
                <span class="menu-heading">Register</span>
            </div>
            <div class="menu-item" @click="openLoginModal()">
                <span class="menu-heading">Login</span>
            </div>
        </div>
        <div v-else>
            <h2 class="display-name">{{ account.displayName }}</h2>
            <div class="menu-item" @click="logout()">
                <span class="menu-heading logout">logOut</span>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    data() {
        return {
            displayName: null,
            isLoading: true
        };
    },

    props: {
        account: {
            type: Object,
            default: null
        }
    },

    // created() {
    //     eventbus.$on('account:update', this.refresh);
    // },

    // beforeDestroy() {
    //     eventbus.$on('account:update', this.refresh);
    // },

    methods: {
        refresh(account) {
            this.account = account;
        },

        openRegisterModal() {
            eventbus.$emit('open:widget', { name: 'register' });
        },

        openLoginModal() {
            eventbus.$emit('open:widget', { name: 'login' });
        },

        logout() {
            eventbus.$emit('account:logout');
        }
    }
};
</script>
<style>
.account-menu .display-name {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3eb489;
    margin-bottom: 10px;
}

.account-menu {
    padding-top: 20px;
    border: 1px dashed #3eb489;
    padding: 20px 20px 0;
}

.account-menu .menu-item .menu-heading.logout {
    font-size: 12px;
    text-transform: capitalize;
    letter-spacing: 1px;
    text-align: right;
    margin-left: 0;
}
</style>
