<!-- @format -->
<template>
    <div class="login-modal">
        <div class="formcontainer">
            <h2>{{ isResetPassword ? 'Reset Password' : 'Login' }}</h2>
            <div v-if="error" class="error">{{ error }}</div>
            <button
                v-if="error === 'Email not verified.'"
                class="error"
                @click="resendVerification()"
            >
                Resend Confirmation
            </button>

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
                v-if="!isResetPassword"
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                placeholder="Password"
                value
                required
                autofocus
            />
            <div class="buttons-container">
                <v-btn
                    v-if="!isResetPassword"
                    class="submit-btn"
                    rounded
                    @click="submit()"
                    :loading="isLoading"
                    :disabled="isLoading"
                >
                    {{ isLoading ? 'Logging in...' : 'Login' }}
                </v-btn>

                <v-btn
                    v-else
                    class="reset-password-btn"
                    rounded
                    @click="resetPassword()"
                    :disabled="!form.email"
                >
                    Reset Password
                </v-btn>

                <v-btn
                    class="reset-password-btn"
                    rounded
                    @click="TogglePasswordReset()"
                    :loading="isLoading"
                    :disabled="isLoading"
                >
                    {{ isResetPassword ? 'Return to Login' : 'Reset Password' }}
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase';
import AccountsService from '@/services/accounts-service';
import AuthService from '@/services/auth-service';
import { eventbus } from '@/main';

export default {
    data() {
        return {
            user: null,
            form: {
                email: '',
                password: '',
            },
            error: null,
            isLoading: false,
            isResetPassword: false,
        };
    },
    methods: {
        async submit() {
            this.isLoading = true;
            this.error = null;

            try {
                // Try new auth strategy first
                const authResponse = await AuthService.login(this.form.email, this.form.password);

                if (authResponse.needsPasswordReset) {
                    this.error = 'Password reset required. Please check your email.';
                    return;
                }

                if (authResponse.success && authResponse.user) {
                    // New auth strategy succeeded
                    this.handleSuccessfulLogin(authResponse.user);
                    return;
                }
            } catch (authError) {
                // Fall back to Firebase auth if new strategy fails
                this.submitWithFirebase();
            } finally {
                this.isLoading = false;
            }
        },

        resetPassword() {
            const auth = getAuth();

            sendPasswordResetEmail(auth, this.form.email)
                .then(() => {
                    // Password reset email sent!
                    // ..
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                });
        },

        submitWithFirebase() {
            firebase
                .auth()
                .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    return firebase
                        .auth()
                        .signInWithEmailAndPassword(this.form.email, this.form.password)
                        .then((data) => {
                            this.user = {
                                id: data.user.uid,
                                emailVerified: data.user.emailVerified,
                            };

                            if (this.user.emailVerified) {
                                this.getAccount(this.user);
                            } else {
                                this.error = 'Email not verified.';
                            }
                        });
                })
                .catch((error) => {
                    this.error = error.message || 'Login failed. Please try again.';
                });
        },

        async handleSuccessfulLogin(user) {
            try {
                // Get additional account data if needed
                const response = await AccountsService.getAccount({ id: user.id });
                this.account = {
                    id: response.data.account[0]._id,
                    displayName: response.data.account[0].DisplayName,
                    email: response.data.account[0].Email,
                    favoriteVideos: response.data.account[0].FavoriteVideos,
                    collections: response.data.account[0].Collections,
                    accountType: response.data.account[0].AccountType,
                    role: user.role, // Include role from auth service
                };

                eventbus.$emit('account:login', this.account);
                this.$emit('closeModal');
            } catch (error) {
                // Still proceed with login if account fetch fails
                this.account = {
                    id: user.id,
                    displayName: user.displayName,
                    email: user.email,
                    role: user.role,
                };
                eventbus.$emit('account:login', this.account);
                this.$emit('closeModal');
            }
        },

        async getAccount(user) {
            const response = await AccountsService.getAccount({ id: user.id });
            this.account = {
                id: response.data.account[0]._id,
                displayName: response.data.account[0].DisplayName,
                email: response.data.account[0].Email,
                favoriteVideos: response.data.account[0].FavoriteVideos,
                collections: response.data.account[0].Collections,
                accountType: response.data.account[0].AccountType,
            };

            eventbus.$emit('account:login', this.account);
            this.$emit('closeModal');
        },

        resendVerification() {
            firebase
                .auth()
                .signInWithEmailAndPassword(this.form.email, this.form.password)
                .then((data) => {
                    data.user.sendEmailVerification();
                });
        },

        TogglePasswordReset() {
            this.isResetPassword = !this.isResetPassword;
        },
    },
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

.login-modal .v-input input {
    border: none;
    margin-bottom: 0px;
    color: #fff;
}

.login-modal .buttons-container {
    display: flex;
    gap: 10px;
}

.login-modal .v-input input::placeholder {
    color: #fff;
}

.login-modal .theme--light.v-text-field > .v-input__control > .v-input__slot:before {
    border-color: #fff;
}

.login-modal .theme--light.v-btn.v-btn--disabled.v-btn--has-bg {
    background-color: rgba(255, 255, 255, 0.8) !important;
}

.login-modal
    .theme--light.v-text-field:not(.v-input--has-state):hover
    > .v-input__control
    > .v-input__slot:before {
    border-color: #3eb489;
}

.login-modal .submit-btn {
    background: #3eb489 !important;
    color: #fff !important;
}
</style>
