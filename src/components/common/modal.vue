<!-- @format -->
<template>
    <div class="modals">
        <v-btn color="error" fab large dark class="close-btn" @click="closeModal()">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <new-game v-if="options.name === 'game'" @closeModal="closeModal()" />

        <new-creator v-if="options.name === 'creator'" @closeModal="closeModal()" />

        <new-player v-if="options.name === 'player'" @closeModal="closeModal()" />

        <new-video
            v-if="options.name === 'video'"
            :videoId="options.videoId"
            :account="this.account"
            @closeModal="closeModal()"
        />

        <new-character v-if="options.name === 'character'" @closeModal="closeModal()" />
        <new-artical v-if="options.name === 'artical'" @closeModal="closeModal()" />

        <new-tournament v-if="options.name === 'tournament'" @closeModal="closeModal()" />

        <register v-if="options.name === 'register'" @closeModal="closeModal()" />

        <login v-if="options.name === 'login'" @closeModal="closeModal()" />

        <collections
            v-if="options.name === 'collections'"
            :account="account"
            @closeModal="closeModal()"
        />

        <note-widget
            v-if="options.name === 'note'"
            :noteId="options.noteId"
            :account="account"
            @closeModal="closeModal()"
        />

        <new-event v-if="options.name === 'event'" @closeModal="closeModal()" />
        <new-article
            v-if="options.name === 'article'"
            :accountId="account.id"
            @closeModal="closeModal()"
        />
    </div>
</template>

<script>
import newGame from '@/components/games/new-game';
import newCreator from '@/components/content-creator/new-creator';
import newPlayer from '@/components/players/new-player';
import newVideo from '@/components/videos/video-widget';
import newTournament from '@/components/tournament/new-tournament';
import newCharacter from '@/components/character/new-character';
import newArticle from '@/components/article/new-article';
import newEvent from '@/components/event/new-event';

import register from '@/components/account/register';
import login from '@/components/account/login';
import collections from '@/components/collection/collections';
import noteWidget from '@/components/note/note-widget';

export default {
    name: 'Modal',

    components: {
        'new-game': newGame,
        'new-video': newVideo,
        'new-creator': newCreator,
        'new-player': newPlayer,
        'new-tournament': newTournament,
        'new-character': newCharacter,
        'new-article': newArticle,
        'new-event': newEvent,

        register: register,
        login: login,
        collections: collections,
        'note-widget': noteWidget,
    },

    props: {
        options: {
            type: Object,
            default: null,
        },
        account: {
            type: Object,
            default: null,
        },
    },

    data: () => ({}),

    created() {},

    methods: {
        closeModal() {
            this.$emit('closeModal');
        },
    },
};
</script>

<style type="text/css">
.modals {
    position: fixed;
    width: 100%;
    z-index: 999;
    max-width: 600px;
    background: #fff;
    right: 0;
    top: 0px;
    border-radius: 20px;
    padding: 40px;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
}

.modals .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
}
</style>
