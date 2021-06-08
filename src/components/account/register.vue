<!-- @format -->
<template>
    <div class="register-modal">
        <div class="formcontainer">
            <h2>Register Account</h2>
            <div v-if="error" class="error">{{ error }}</div>
            <v-text-field
                id="name"
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="Username"
                value
                required
                autofocus
            />

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

            <v-btn class="submit-btn" rounded @click="submit()">Submit</v-btn>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase';
import AccountsService from '@/services/accounts-service';

export default {
    data() {
        return {
            form: {
                name: '',
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
                .createUserWithEmailAndPassword(this.form.email, this.form.password)
                .then(data => {
                    data.user
                        .updateProfile({
                            displayName: this.form.name,
                            email: this.form.email
                        })
                        .then(() => {
                            var newUser = {
                                DisplayName: data.user.displayName,
                                Email: data.user.email,
                                IsEmailVerified: data.user.emailVerified,
                                Uid: data.user.uid,
                                AccountType: 'Standard User'
                            };
                            this.addAccount(newUser);

                            this.$emit('register:success');
                            this.$emit('closeModal');
                        });
                })
                .catch(err => {
                    this.error = err.message;
                });
        },

        async addAccount(newUser) {
            await AccountsService.addAccount(newUser);
        }
    }
};
</script>
<style>
.register-modal .input-container {
    padding: 0 5px;
}

.register-modal .input-container input {
    font-size: 12px;
}

.register-modal .inputs-container .v-input {
    padding-top: 0;
    margin-top: 0px;
}

.register-modal .inputs-container .v-input__slot,
.register-modal .input-container .v-input__slot {
    background: #fff;
}

.register-modal .inputs-container .v-input__slot {
    padding: 10px;
}

.register-modal .error {
    color: #ff0000;
    margin-top: 20px;
    font-style: italic;
}
</style>
