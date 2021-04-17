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
            @closeModal="closeModal()"
        />

        <new-character v-if="options.name === 'character'" @closeModal="closeModal()" />

        <new-tournament v-if="options.name === 'tournament'" @closeModal="closeModal()" />
    </div>
</template>

<script>
import newGame from '@/components/games/new-game';
import newCreator from '@/components/content-creator/new-creator';
import newPlayer from '@/components/players/new-player';
import newVideo from '@/components/videos/video-widget';
import newTournament from '@/components/tournament/new-tournament';
import newCharacter from '@/components/character/new-character';

export default {
    name: 'Modal',

    components: {
        'new-game': newGame,
        'new-video': newVideo,
        'new-creator': newCreator,
        'new-player': newPlayer,
        'new-tournament': newTournament,
        'new-character': newCharacter
    },

    props: {
        options: {
            type: Object,
            default: null
        }
    },

    data: () => ({}),

    created() {},

    methods: {
        closeModal() {
            this.$emit('closeModal');
        }
    }
};
</script>

<style type="text/css">
.modals {
    position: fixed;
    width: 100%;
    z-index: 999;
    max-width: 600px;
    background: #fff;
    left: 50%;
    margin-left: -310px;
    top: 0px;
    border-radius: 20px;
    padding: 40px;
    height: 650px;
    overflow-y: scroll;
    overflow-x: hidden;
}

.modals .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
}
</style>
