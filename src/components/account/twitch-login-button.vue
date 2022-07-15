<!-- @format -->
<template>
    <div class="twitch-login-button">
        <a
            :href="authorizeUrl"
            target="_blank"
            onclick="window.open(this.href,'targetWindow',
                                   `toolbar=no,
                                    location=no,
                                    scrollbars=yes,
                                    resizable=yes,
                                    width=400,
                                    height=600`); return false;"
        >
            <twitch-logo-svg />
        </a>
    </div>
</template>
<script>
import TwitchLogoSvg from '@/components/svg/twitch-logo-svg';

export default {
    name: 'twitch-login-button',
    components: {
        'twitch-logo-svg': TwitchLogoSvg,
    },

    data() {
        return {
            clientId: 'uthyvdhau17m9wlm9f7594a6vcg3c0',
            redirectUri: 'http://localhost:8080',
            state: 'c3ab8aa609ea11e793ae92361f002671',
            scopes: 'channel%3Amanage%3Apolls+channel%3Aread%3Apolls',
            baseUrl: 'https://id.twitch.tv/oauth2/authorize?',
        };
    },

    computed: {
        authorizeUrl() {
            return `${this.baseUrl}?response_type=token&client_id=${this.clientId}&redirect_uri=${this.redirectUri}%26response_type%3Dcode%26scope%3Dscope=${this.scopes}&state=${this.state}`;
        },
    },

    methods: {},
};
</script>
<style>
.twitch-login-button a {
    width: 75px;
    height: 50px;
    background: #131419;
    display: block;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    transition: all 0.3s linear;
}

.twitch-login-button a:hover {
    background: #6441a5;
}
.twitch-login-button a svg {
    transform: scale(0.5);
}

.twitch-login-button a svg path {
    fill: #fff;
}
</style>
