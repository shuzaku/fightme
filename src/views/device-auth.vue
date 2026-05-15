<!-- @format -->
<template>
    <div class="device-auth-page">
        <div class="device-auth-card">
            <!-- Logo -->
            <div class="da-logo-row">
                <img
                    src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                    alt="FightersEdge"
                    class="da-logo"
                />
                <div>
                    <div class="da-brand">FightersEdge</div>
                    <div class="da-sub">Device Authorization</div>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="step === 'loading'" class="da-loading">
                <div class="da-spinner" />
                <p>Checking account...</p>
            </div>

            <!-- Login required -->
            <div v-else-if="step === 'login'">
                <p class="da-desc">
                    <strong class="da-device-name">{{ deviceName }}</strong> is requesting access
                    to your FightersEdge account. Please log in to continue.
                </p>

                <div class="da-field">
                    <label>Email</label>
                    <input
                        v-model="email"
                        type="email"
                        placeholder="you@example.com"
                        class="da-input"
                        :disabled="working"
                        @keyup.enter="doLogin"
                    />
                </div>
                <div class="da-field">
                    <label>Password</label>
                    <input
                        v-model="password"
                        type="password"
                        placeholder="••••••••"
                        class="da-input"
                        :disabled="working"
                        @keyup.enter="doLogin"
                    />
                </div>

                <div v-if="loginError" class="da-error">{{ loginError }}</div>

                <button class="da-btn da-btn-primary" :disabled="working" @click="doLogin">
                    {{ working ? 'Logging in...' : 'Log in & Continue' }}
                </button>
            </div>

            <!-- Consent screen -->
            <div v-else-if="step === 'consent'">
                <p class="da-desc">
                    <strong class="da-device-name">{{ deviceName }}</strong> wants to access your
                    FightersEdge account.
                </p>

                <div class="da-account-badge">
                    <div class="da-avatar">{{ userInitial }}</div>
                    <div>
                        <div class="da-account-name">{{ displayName }}</div>
                        <div class="da-account-email">{{ userEmail }}</div>
                    </div>
                </div>

                <div class="da-permissions">
                    <div class="da-perm-item">✓ Read your account info and linked player</div>
                    <div class="da-perm-item">✓ Stream match playlists on your behalf</div>
                </div>

                <div v-if="authError" class="da-error">{{ authError }}</div>

                <div class="da-action-row">
                    <button class="da-btn da-btn-ghost" :disabled="working" @click="deny">
                        Deny
                    </button>
                    <button class="da-btn da-btn-primary" :disabled="working" @click="authorize">
                        {{ working ? 'Authorizing...' : 'Authorize' }}
                    </button>
                </div>
            </div>

            <!-- Done (redirect happening) -->
            <div v-else-if="step === 'done'" class="da-done">
                <div class="da-check">✓</div>
                <p>Authorized! Returning to <strong>{{ deviceName }}</strong>...</p>
            </div>

            <!-- Done without redirect — copy token (e.g. OBS desktop app) -->
            <div v-else-if="step === 'done-manual'" class="da-done-manual">
                <div class="da-check">✓</div>
                <p class="da-manual-lead">
                    Copy this token into your app&apos;s settings. It is only shown once.
                </p>
                <div class="da-token-box">
                    <code class="da-token">{{ issuedToken }}</code>
                    <button type="button" class="da-btn da-btn-primary da-copy-btn" @click="copyToken">
                        {{ copied ? 'Copied' : 'Copy token' }}
                    </button>
                </div>
                <p class="da-manual-hint">
                    You can close this tab after saving the token somewhere safe.
                </p>
            </div>

            <!-- Error (bad redirect_uri etc.) -->
            <div v-else-if="step === 'error'" class="da-fatal">
                <p>{{ fatalError }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

const API_BASE = process.env.VUE_APP_API_URL || 'https://fightmeserver.fly.dev';

export default {
    name: 'DeviceAuth',

    data() {
        return {
            step: 'loading',   // loading | login | consent | done | done-manual | error
            deviceName: 'FightersEdge AutoStream',
            /** When false, we show the token on this page instead of redirecting to localhost. */
            useRedirect: true,
            issuedToken: '',
            copied: false,
            redirectUri: '',
            email: '',
            password: '',
            loginError: null,
            authError: null,
            fatalError: null,
            working: false,
            // populated once Firebase resolves the current user
            firebaseUser: null,
            displayName: '',
            userEmail: '',
        };
    },

    computed: {
        userInitial() {
            return (this.displayName || this.userEmail || '?').charAt(0).toUpperCase();
        },
    },

    mounted() {
        // Read query params — works with both Vue Router and raw location.search
        const params = new URLSearchParams(window.location.search);
        const redirectUri = params.get('redirect_uri');
        const deviceName = params.get('device_name');

        if (redirectUri) {
            // Basic allowlist — only allow loopback redirects for security
            try {
                const uri = new URL(redirectUri);
                if (uri.hostname !== 'localhost' && uri.hostname !== '127.0.0.1') {
                    this.fatalError = 'redirect_uri must be a localhost address.';
                    this.step = 'error';
                    return;
                }
            } catch {
                this.fatalError = 'Invalid redirect_uri.';
                this.step = 'error';
                return;
            }
            this.redirectUri = redirectUri;
            this.useRedirect = true;
        } else {
            // Desktop apps (e.g. OBS) often open this URL without a loopback server — user copies the token.
            this.useRedirect = false;
        }

        if (deviceName) this.deviceName = deviceName;

        // Check Firebase auth state
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                this.firebaseUser = user;
                this.displayName = user.displayName || '';
                this.userEmail = user.email || '';
                this.step = 'consent';
            } else {
                this.step = 'login';
            }
        });
    },

    methods: {
        async doLogin() {
            if (!this.email || !this.password) {
                this.loginError = 'Please enter your email and password.';
                return;
            }
            this.working = true;
            this.loginError = null;
            try {
                const cred = await firebase
                    .auth()
                    .signInWithEmailAndPassword(this.email, this.password);
                this.firebaseUser = cred.user;
                this.displayName = cred.user.displayName || '';
                this.userEmail = cred.user.email || '';
                this.step = 'consent';
            } catch (err) {
                this.loginError = this.friendlyFirebaseError(err);
            } finally {
                this.working = false;
            }
        },

        async authorize() {
            this.working = true;
            this.authError = null;
            try {
                const idToken = await this.firebaseUser.getIdToken(/* forceRefresh */ true);
                const res = await fetch(`${API_BASE}/auth/device/authorize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ deviceName: this.deviceName }),
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.message || `Server error (${res.status})`);
                }

                if (this.useRedirect) {
                    this.step = 'done';
                    // Small delay so the user sees the success state before the tab closes
                    setTimeout(() => {
                        window.location.href = `${this.redirectUri}?token=${encodeURIComponent(data.token)}`;
                    }, 800);
                } else {
                    this.issuedToken = data.token;
                    this.step = 'done-manual';
                    this.working = false;
                }
            } catch (err) {
                this.authError = err.message || 'Authorization failed. Please try again.';
                this.working = false;
            }
        },

        deny() {
            if (this.useRedirect) {
                window.location.href = `${this.redirectUri}?error=denied`;
                return;
            }
            firebase
                .auth()
                .signOut()
                .catch(() => {});
            this.firebaseUser = null;
            this.step = 'login';
            this.loginError = 'Authorization was cancelled.';
        },

        async copyToken() {
            try {
                await navigator.clipboard.writeText(this.issuedToken);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            } catch {
                this.copied = false;
            }
        },

        friendlyFirebaseError(err) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    return 'Incorrect email or password.';
                case 'auth/invalid-email':
                    return 'Please enter a valid email address.';
                case 'auth/too-many-requests':
                    return 'Too many attempts. Please wait a moment and try again.';
                default:
                    return err.message || 'Login failed. Please try again.';
            }
        },
    },
};
</script>

<style scoped>
.device-auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1d24;
    padding: 24px;
    font-family: 'Roboto', sans-serif;
}

.device-auth-card {
    width: 100%;
    max-width: 400px;
    background: #242832;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Logo row */
.da-logo-row {
    display: flex;
    align-items: center;
    gap: 14px;
}

.da-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.da-brand {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.5px;
}

.da-sub {
    font-size: 12px;
    font-weight: 500;
    color: #3eb489;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 2px;
}

/* Description */
.da-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin: 0;
}

.da-device-name {
    color: #fff;
}

/* Account badge */
.da-account-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: #1a1d24;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
}

.da-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    flex-shrink: 0;
}

.da-account-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
}

.da-account-email {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin-top: 2px;
}

/* Permissions list */
.da-permissions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    background: rgba(62, 180, 137, 0.06);
    border: 1px solid rgba(62, 180, 137, 0.2);
    border-radius: 10px;
}

.da-perm-item {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
}

/* Login fields */
.da-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.da-field label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.da-input {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #1a1d24;
    color: #fff;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
}

.da-input:focus {
    border-color: #3eb489;
}

.da-input:disabled {
    opacity: 0.5;
}

/* Buttons */
.da-action-row {
    display: flex;
    gap: 10px;
}

.da-btn {
    flex: 1;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
    border: none;
}

.da-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.da-btn-primary {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    color: #fff;
}

.da-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.6);
}

/* Errors */
.da-error {
    font-size: 13px;
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    padding: 10px 14px;
    border-radius: 8px;
}

.da-fatal {
    font-size: 14px;
    color: #ff6b6b;
    text-align: center;
}

/* Loading */
.da-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
}

.da-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(62, 180, 137, 0.2);
    border-top-color: #3eb489;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Done */
.da-done {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
}

.da-check {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    color: #fff;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.da-done p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

/* Manual token (no redirect_uri) */
.da-done-manual {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    text-align: center;
}

.da-manual-lead {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
    line-height: 1.5;
}

.da-token-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    background: #1a1d24;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    text-align: left;
}

.da-token {
    display: block;
    font-size: 12px;
    word-break: break-all;
    color: #b8f0d8;
    background: rgba(0, 0, 0, 0.35);
    padding: 10px;
    border-radius: 6px;
    line-height: 1.45;
}

.da-copy-btn {
    flex: none;
}

.da-manual-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0;
}
</style>
