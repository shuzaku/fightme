<!-- @format -->
<template>
    <div class="login-modal">
        <div class="formcontainer">
            <h2>Login</h2>
            <div v-if="error" class="error">{{ error }}</div>

            <v-text-field
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="Email"
                value
                required
                autofocus
            />

            <v-text-field
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                placeholder="Password"
                value
                required
                autofocus
            />

            <v-btn class="submit-btn" rounded @click="submit()">Login</v-btn>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase';
import AccountsService from '@/services/accounts-service';
import { eventbus } from '@/main';

export default {
    data() {
        return {
            user: null,
            form: {
                email: '',
                password: ''
            },
            error: null
        };
    },
    methods: {
        submit() {
            firebase
                .auth()
                .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    return firebase
                        .auth()
                        .signInWithEmailAndPassword(this.form.email, this.form.password)
                        .then(data => {
                            this.user = {
                                id: data.user.uid
                            };
                            this.getAccount(this.user.id);
                        });
                })
                .catch(() => {});
        },
        async getAccount(id) {
            const response = await AccountsService.getAccount({ id: id });
            this.account = {
                id: response.data.account[0]._id,
                displayName: response.data.account[0].DisplayName,
                email: response.data.account[0].Email,
                favoriteVideos: response.data.account[0].FavoriteVideos,
                collections: response.data.account[0].Collections
            };

            eventbus.$emit('account:login', this.account);
        }
    }
};
</script>

<style>
.login-modal .input-container {
    padding: 0 5px;
}

.login-modal .input-container input {
    font-size: 12px;
}

.login-modal .inputs-container .v-input {
    padding-top: 0;
    margin-top: 0px;
}

.login-modal .inputs-container .v-input__slot,
.login-modal .input-container .v-input__slot {
    background: #fff;
}

.login-modal .inputs-container .v-input__slot {
    padding: 10px;
}

.login-modal .error {
    color: #ff0000;
    margin-top: 20px;
    font-style: italic;
}
</style>
