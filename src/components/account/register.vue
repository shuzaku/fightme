<!-- @format -->
<template>
    <div class="register-overlay" @click.self="closeModal">
        <div class="register-modal">
            <button class="close-button" @click="closeModal" aria-label="Close">
                <span class="close-icon">×</span>
            </button>
            <div class="register-content">
                <div class="register-graphic">
                    <div class="graphic-container">
                        <div class="graphic-circle graphic-circle-1"></div>
                        <div class="graphic-circle graphic-circle-2"></div>
                        <div class="graphic-circle graphic-circle-3"></div>
                        <div class="logo-container">
                            <img
                                class="register-logo"
                                src="https://res.cloudinary.com/shuzchef/image/upload/v1759458070/cjee1o9a0mtpnmcudhfl.png"
                                alt="Fighters Edge Logo"
                            />
                        </div>
                    </div>
                </div>
                <div v-if="!verified" class="formcontainer">
                    <div class="register-header">
                        <h2>Create Account</h2>
                        <p class="register-subtitle">Join the Fighters Edge community</p>
                    </div>

                    <div v-if="error" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>{{ error }}</span>
                    </div>

                    <div class="form-fields">
                        <div class="input-wrapper">
                            <i class="fas fa-user input-icon"></i>
                            <v-text-field
                                id="name"
                                v-model="form.name"
                                type="text"
                                class="form-control"
                                placeholder="Username"
                                value
                                required
                                autofocus
                                dark
                                outlined
                            />
                        </div>

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
                                dark
                                outlined
                            />
                        </div>

                        <div class="input-wrapper">
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
                            class="submit-btn"
                            rounded
                            large
                            block
                            @click="submit()"
                            :disabled="!form.name || !form.email || !form.password || isLoading"
                            :loading="isLoading"
                        >
                            <span v-if="!isLoading">
                                <i class="fas fa-user-plus"></i> Create Account
                            </span>
                            <span v-else>Creating account...</span>
                        </v-btn>
                    </div>
                </div>
                <div v-else class="verification-message">
                    <div class="verification-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Check Your Email</h2>
                    <p>
                        Thank you for signing up! To gain access to notes, collections, and favorites
                        please check your email for the verification email.
                    </p>
                </div>
            </div>
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
                password: '',
            },
            error: null,
            verified: false,
            isLoading: false,
        };
    },
    methods: {
        submit() {
            this.isLoading = true;
            this.error = null;

            firebase
                .auth()
                .createUserWithEmailAndPassword(this.form.email, this.form.password)
                .then((data) => {
                    data.user
                        .updateProfile({
                            displayName: this.form.name,
                            email: this.form.email,
                        })
                        .then(() => {
                            data.user.sendEmailVerification();
                            var newUser = {
                                DisplayName: data.user.displayName,
                                Email: data.user.email,
                                IsEmailVerified: true,
                                Uid: data.user.uid,
                                AccountType: 'Standard User',
                            };
                            this.addAccount(newUser);

                            this.$emit('register:success');
                            this.verified = true;
                            this.isLoading = false;
                        });
                })
                .catch((err) => {
                    this.error = err.message;
                    this.isLoading = false;
                });
        },

        async addAccount(newUser) {
            await AccountsService.addAccount(newUser);
        },

        closeModal() {
            this.$emit('closeModal');
        },
    },
};
</script>
<style>
.register-overlay {
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

.register-modal {
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

.register-modal .close-button {
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

.register-modal .close-icon {
    font-size: 32px;
    line-height: 1;
    font-weight: 300;
    display: block;
    color: #fff;
    transform: translateY(-2px);
}

.register-modal .close-button:hover {
    background: rgba(255, 59, 48, 0.9);
    border-color: rgba(255, 59, 48, 1);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
}

.register-modal .close-button:hover .close-icon {
    color: #fff;
}

.register-modal .close-button:active {
    transform: rotate(90deg) scale(0.95);
}

.register-modal .register-content {
    display: flex;
    width: 100%;
    min-height: 600px;
}

.register-modal .register-graphic {
    flex: 1;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    position: relative;
    overflow: hidden;
}

.register-modal .graphic-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.register-modal .graphic-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 3s ease-in-out infinite;
}

.register-modal .graphic-circle-1 {
    width: 200px;
    height: 200px;
    animation-delay: 0s;
}

.register-modal .graphic-circle-2 {
    width: 150px;
    height: 150px;
    animation-delay: 1s;
}

.register-modal .graphic-circle-3 {
    width: 100px;
    height: 100px;
    animation-delay: 2s;
}

.register-modal .logo-container {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: float 3s ease-in-out infinite;
}

.register-modal .register-logo {
    max-width: 280px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
    animation: logoGlow 3s ease-in-out infinite;
}

.register-modal .formcontainer {
    flex: 1;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.register-modal .register-header {
    text-align: left;
    margin-bottom: 35px;
}

.register-modal .register-header h2 {
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Roboto', sans-serif;
}

.register-modal .register-subtitle {
    color: #ffffff90;
    font-size: 14px;
    margin: 0;
    font-weight: 400;
}

.register-modal .form-fields {
    margin-bottom: 24px;
}

.register-modal .input-wrapper {
    position: relative;
    margin-bottom: 20px;
}

.register-modal .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.register-modal .input-wrapper .v-input {
    padding-left: 45px;
}

.register-modal .input-wrapper .v-text-field {
    margin-bottom: 0;
}

.register-modal .v-text-field--outlined >>> .v-input__control {
    min-height: 50px;
}

.register-modal .v-text-field--outlined >>> .v-input__slot {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    padding: 0 16px !important;
    transition: all 0.3s ease;
}

.register-modal .v-text-field--outlined >>> .v-input__slot:hover {
    border-color: rgba(62, 180, 137, 0.5) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.register-modal .v-text-field--outlined.v-input--is-focused >>> .v-input__slot {
    border-color: #3eb489 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 0 0 3px rgba(62, 180, 137, 0.1);
}

.register-modal .v-text-field--outlined >>> .v-input__slot input {
    color: #fff !important;
    font-size: 15px;
    padding-left: 8px;
}

.register-modal .v-text-field--outlined >>> .v-input__slot input::placeholder {
    color: #ffffff60 !important;
    opacity: 1;
}

.register-modal .error-message {
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

.register-modal .error-message i {
    font-size: 18px;
    flex-shrink: 0;
}

.register-modal .error-message span {
    flex: 1;
}

.register-modal .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.register-modal .submit-btn {
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

.register-modal .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 180, 137, 0.4);
}

.register-modal .submit-btn:active {
    transform: translateY(0);
}

.register-modal .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.register-modal .submit-btn i {
    margin-right: 8px;
}

.register-modal .verification-message {
    flex: 1;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.register-modal .verification-icon {
    font-size: 80px;
    color: #3eb489;
    margin-bottom: 24px;
    animation: scaleIn 0.5s ease;
}

.register-modal .verification-message h2 {
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 16px 0;
}

.register-modal .verification-message p {
    color: #ffffff90;
    font-size: 16px;
    line-height: 1.6;
    max-width: 500px;
    margin: 0;
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

@keyframes scaleIn {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Mobile responsive */
@media (max-width: 900px) {
    .register-overlay {
        padding: 0;
        align-items: flex-start;
    }

    .register-modal {
        max-width: 100%;
        flex-direction: column;
        max-height: 100vh;
        height: 100vh;
        border-radius: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .register-modal .register-content {
        flex-direction: column;
        min-height: auto;
    }

    .register-modal .register-graphic {
        flex: 0 0 auto;
        padding: 40px 20px;
        min-height: 180px;
    }

    .register-modal .register-logo {
        max-width: 180px;
    }

    .register-modal .graphic-circle-1 {
        width: 150px;
        height: 150px;
    }

    .register-modal .graphic-circle-2 {
        width: 120px;
        height: 120px;
    }

    .register-modal .graphic-circle-3 {
        width: 80px;
        height: 80px;
    }

    .register-modal .formcontainer {
        padding: 30px 25px 40px;
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .register-modal .register-header {
        text-align: center;
        margin-bottom: 25px;
    }

    .register-modal .register-header h2 {
        font-size: 28px;
    }

    .register-modal .form-fields {
        margin-bottom: 20px;
    }

    .register-modal .input-wrapper {
        margin-bottom: 16px;
    }

    .register-modal .buttons-container {
        padding-bottom: 20px;
    }
}

@media (max-width: 600px) {
    .register-overlay {
        padding: 0;
    }

    .register-modal {
        border-radius: 0;
    }

    .register-modal .register-graphic {
        padding: 30px 15px;
        min-height: 150px;
    }

    .register-modal .register-logo {
        max-width: 150px;
    }

    .register-modal .formcontainer {
        padding: 25px 20px 30px;
    }

    .register-modal .register-header h2 {
        font-size: 24px;
    }

    .register-modal .register-header {
        margin-bottom: 20px;
    }

    .register-modal .form-fields {
        margin-bottom: 16px;
    }

    .register-modal .input-wrapper {
        margin-bottom: 14px;
    }

    .register-modal .close-button {
        width: 40px;
        height: 40px;
        top: 16px;
        right: 16px;
    }

    .register-modal .close-icon {
        font-size: 28px;
    }
}

/* Ensure buttons are always visible */
@media (max-height: 700px) {
    .register-modal .register-graphic {
        min-height: 120px;
        padding: 20px;
    }

    .register-modal .register-logo {
        max-width: 120px;
    }

    .register-modal .formcontainer {
        padding: 20px;
    }

    .register-modal .register-header {
        margin-bottom: 16px;
    }

    .register-modal .register-header h2 {
        font-size: 24px;
    }

    .register-modal .form-fields {
        margin-bottom: 16px;
    }

    .register-modal .input-wrapper {
        margin-bottom: 12px;
    }
}
</style>
