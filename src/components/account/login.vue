<!-- @format -->
<template>
    <div class="login-overlay" @click.self="closeModal">
        <div class="login-modal">
            <button class="close-button" @click="closeModal" aria-label="Close">
                <span class="close-icon">×</span>
            </button>
            <div class="login-content">
                <div class="login-graphic">
                    <div class="graphic-container">
                        <div class="graphic-circle graphic-circle-1"></div>
                        <div class="graphic-circle graphic-circle-2"></div>
                        <div class="graphic-circle graphic-circle-3"></div>
                        <div class="logo-container">
                            <img
                                class="login-logo"
                                src="https://res.cloudinary.com/shuzchef/image/upload/v1759458070/cjee1o9a0mtpnmcudhfl.png"
                                alt="Fighters Edge Logo"
                            />
                        </div>
                    </div>
                </div>
                <div class="formcontainer">
                    <div class="login-header">
                        <h2>{{ isResetPassword ? 'Reset Password' : 'Welcome Back' }}</h2>
                        <p class="login-subtitle">
                            {{ isResetPassword ? 'Enter your email to reset your password' : 'Sign in to continue' }}
                        </p>
                    </div>

            <div v-if="error" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ error }}</span>
                <button
                    v-if="error === 'Email not verified.'"
                    class="resend-btn"
                    @click="resendVerification()"
                >
                    Resend Confirmation
                </button>
            </div>

            <div class="form-fields">
                <div class="input-wrapper">
                    <i class="fas fa-envelope input-icon"></i>
                    <v-text-field
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        placeholder="Email address"
                        value
                        required
                        autofocus
                        dark
                        outlined
                    />
                </div>

                <div v-if="!isResetPassword" class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <v-text-field
                        id="password"
                        v-model="form.password"
                        type="password"
                        class="form-control"
                        placeholder="Password"
                        value
                        required
                        dark
                        outlined
                    />
                </div>
            </div>

            <div class="buttons-container">
                <v-btn
                    v-if="!isResetPassword"
                    class="submit-btn"
                    rounded
                    large
                    block
                    @click="submit()"
                    :loading="isLoading"
                    :disabled="isLoading || !form.email || (!isResetPassword && !form.password)"
                >
                    <span v-if="!isLoading">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </span>
                    <span v-else>Logging in...</span>
                </v-btn>

                <v-btn
                    v-else
                    class="submit-btn"
                    rounded
                    large
                    block
                    @click="resetPassword()"
                    :disabled="!form.email || isLoading"
                    :loading="isLoading"
                >
                    <i class="fas fa-key"></i> Reset Password
                </v-btn>

                <v-btn
                    class="secondary-btn"
                    rounded
                    text
                    @click="TogglePasswordReset()"
                    :disabled="isLoading"
                >
                    {{ isResetPassword ? '← Return to Login' : 'Forgot Password?' }}
                </v-btn>
            </div>
                </div>
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

        closeModal() {
            this.$emit('closeModal');
        },
    },
};
</script>

<style>
.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

.login-modal {
    position: relative;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    animation: slideUp 0.4s ease;
    overflow: hidden;
}

.login-modal .close-button {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 0;
    margin: 0;
}

.login-modal .close-icon {
    font-size: 32px;
    line-height: 1;
    font-weight: 300;
    display: block;
    color: #fff;
    transform: translateY(-2px);
}

.login-modal .close-button:hover {
    background: rgba(255, 59, 48, 0.9);
    border-color: rgba(255, 59, 48, 1);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
}

.login-modal .close-button:hover .close-icon {
    color: #fff;
}

.login-modal .close-button:active {
    transform: rotate(90deg) scale(0.95);
}

.login-modal .login-content {
    display: flex;
    width: 100%;
    min-height: 600px;
}

.login-modal .login-graphic {
    flex: 1;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    position: relative;
    overflow: hidden;
}

.login-modal .graphic-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-modal .graphic-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 3s ease-in-out infinite;
}

.login-modal .graphic-circle-1 {
    width: 200px;
    height: 200px;
    animation-delay: 0s;
}

.login-modal .graphic-circle-2 {
    width: 150px;
    height: 150px;
    animation-delay: 1s;
}

.login-modal .graphic-circle-3 {
    width: 100px;
    height: 100px;
    animation-delay: 2s;
}

.login-modal .logo-container {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: float 3s ease-in-out infinite;
}

.login-modal .login-logo {
    max-width: 280px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
    animation: logoGlow 3s ease-in-out infinite;
}

.login-modal .formcontainer {
    flex: 1;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-modal .login-header {
    text-align: left;
    margin-bottom: 35px;
}

.login-modal .login-header h2 {
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Roboto', sans-serif;
}

.login-modal .login-subtitle {
    color: #ffffff90;
    font-size: 14px;
    margin: 0;
    font-weight: 400;
}

.login-modal .form-fields {
    margin-bottom: 24px;
}

.login-modal .input-wrapper {
    position: relative;
    margin-bottom: 20px;
}

.login-modal .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.login-modal .input-wrapper .v-input {
    padding-left: 45px;
}

.login-modal .input-wrapper .v-text-field {
    margin-bottom: 0;
}

.login-modal .v-text-field--outlined >>> .v-input__control {
    min-height: 50px;
}

.login-modal .v-text-field--outlined >>> .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    padding: 0 16px !important;
    transition: all 0.3s ease;
}

.login-modal .v-text-field--outlined >>> .v-input__slot:hover {
    border-color: rgba(62, 180, 137, 0.5) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.login-modal .v-text-field--outlined.v-input--is-focused >>> .v-input__slot {
    border-color: #3eb489 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.1);
}

.login-modal .v-text-field--outlined >>> .v-input__slot input {
    color: #fff !important;
    font-size: 15px;
    padding-left: 8px;
}

.login-modal .v-text-field--outlined >>> .v-input__slot input::placeholder {
    color: #ffffff60 !important;
    opacity: 1;
}

.login-modal .error-message {
    background: rgba(255, 59, 48, 0.15);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ff6b6b;
    font-size: 14px;
    animation: shake 0.5s ease;
}

.login-modal .error-message i {
    font-size: 18px;
    flex-shrink: 0;
}

.login-modal .error-message span {
    flex: 1;
}

.login-modal .resend-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: auto;
}

.login-modal .resend-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
}

.login-modal .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.login-modal .submit-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3);
    transition: all 0.3s ease;
    height: 50px;
}

.login-modal .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.login-modal .submit-btn:active {
    transform: translateY(0);
}

.login-modal .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.login-modal .submit-btn i {
    margin-right: 8px;
}

.login-modal .secondary-btn {
    color: #ffffff90 !important;
    font-size: 14px !important;
    text-transform: none !important;
    font-weight: 400 !important;
    padding: 8px !important;
    min-width: auto !important;
    transition: color 0.2s ease;
}

.login-modal .secondary-btn:hover {
    color: #3eb489 !important;
    background: transparent !important;
}

.login-modal .secondary-btn:disabled {
    opacity: 0.5;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
        transform: translateX(5px);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 0.3;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.5;
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-20px);
    }
}

@keyframes logoGlow {
    0%, 100% {
        filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 20px rgba(62, 180, 137, 0.3));
    }
    50% {
        filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 30px rgba(62, 180, 137, 0.5));
    }
}

/* Mobile responsive */
@media (max-width: 900px) {
    .login-modal {
        max-width: 100%;
        flex-direction: column;
        max-height: 95vh;
    }

    .login-modal .login-content {
        flex-direction: column;
        min-height: auto;
    }

    .login-modal .login-graphic {
        flex: 0 0 auto;
        padding: 40px 20px;
        min-height: 200px;
    }

    .login-modal .login-logo {
        max-width: 200px;
    }

    .login-modal .graphic-circle-1 {
        width: 150px;
        height: 150px;
    }

    .login-modal .graphic-circle-2 {
        width: 120px;
        height: 120px;
    }

    .login-modal .graphic-circle-3 {
        width: 80px;
        height: 80px;
    }

    .login-modal .formcontainer {
        padding: 30px 25px;
    }

    .login-modal .login-header {
        text-align: center;
    }

    .login-modal .login-header h2 {
        font-size: 28px;
    }
}

@media (max-width: 600px) {
    .login-overlay {
        padding: 10px;
    }

    .login-modal {
        border-radius: 16px;
    }

    .login-modal .formcontainer {
        padding: 25px 20px;
    }
}
</style>
