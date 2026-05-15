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
            :matchId="options.matchId"
            :account="this.account"
            @closeModal="closeModal()"
        />

        <new-match
            v-if="options.name === 'match'"
            :videoId="options.videoId"
            :matchId="options.matchId"
            :account="this.account"
            @closeModal="closeModal()"
        />

        <new-combo
            v-if="options.name === 'combo'"
            :comboClipId="options.comboClipId"
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
        <new-featured-video v-if="options.name === 'featured-video'" @closeModal="closeModal()" />
        <new-featured-match v-if="options.name === 'featured-match'" @closeModal="closeModal()" />

        <edit-player
            v-if="options.name === 'edit-player'"
            :playerId="options.playerId"
            @closeModal="closeModal()"
        />
        <edit-game
            v-if="options.name === 'edit-game'"
            :gameId="options.gameId"
            @closeModal="closeModal()"
        />
        <edit-character
            v-if="options.name === 'edit-character'"
            :characterId="options.characterId"
            @closeModal="closeModal()"
        />
        <new-update v-if="options.name === 'game-update'" @closeModal="closeModal()" />
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
import newMatch from '@/components/videos/new-match';
import newCombo from '@/components/videos/new-combo';
import register from '@/components/account/register';
import login from '@/components/account/login';
import collections from '@/components/collection/collections';
import noteWidget from '@/components/note/note-widget';
import newFeaturedVideo from '@/components/videos/new-featured-video';
import newFeaturedMatch from '@/components/videos/new-featured-match';
import editPlayer from '@/components/players/edit-player';
import editGame from '@/components/games/edit-game';
import editCharacter from '@/components/character/edit-character';
import newUpdate from '@/components/update/new-update';

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
        'new-match': newMatch,
        'new-combo': newCombo,
        register: register,
        login: login,
        collections: collections,
        'note-widget': noteWidget,
        'new-featured-video': newFeaturedVideo,
        'new-featured-match': newFeaturedMatch,
        'edit-player': editPlayer,
        'edit-game': editGame,
        'edit-character': editCharacter,
        'new-update': newUpdate,
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
    background: #242832;
    right: 0;
    top: 0px;
    border-radius: 20px;
    padding: 40px;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.modals .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
}
</style>
