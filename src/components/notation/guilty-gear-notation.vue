<!-- @format -->
<template>
    <div class="top-nav">
        <div class="notations" v-for="notation in notations" :key="notation.name">
            <div class="notation" v-if="notation.name === selectedNotationType">
                <div class="movement">
                    <div class="up-back">{{ notation.upBack }}</div>
                    <div class="up">{{ notation.up }}</div>
                    <div class="up-forward">{{ notation.upForward }}</div>
                    <div class="back">{{ notation.back }}</div>
                    <div class="neutral">{{ notation.neutral }}</div>
                    <div class="forward">{{ notation.forward }}</div>
                    <div class="down-back">{{ notation.downBack }}</div>
                    <div class="down">{{ notation.down }}</div>
                    <div class="down forward">{{ notation.upBack }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TopNav',

    components: {},

    data() {
        return {
            notations: [
                {
                    name: 'keypad',
                    movement: [
                        { up: '8' },
                        { down: '2' },
                        { back: '4' },
                        { forward: '5' },
                        { downForward: '3' },
                        { downBack: '1' },
                        { upBack: '7' },
                        { upRight: '9' },
                        { neutral: '5' }
                    ],
                    buttons: [{ punch: 'P' }, { kick: 'K' }, { slash: 'S' }, { hardSlash: 'HS' }],
                    prefixes: [
                        { crouching: 'c.' },
                        { jumping: 'j.' },
                        { far: 'f.' },
                        { delayed: 'd.' }
                    ]
                }
            ]
        };
    },

    computed: {},

    methods: {},

    mounted() {},

    created() {},

    beforeDestroy() {}
};
</script>

<style type="text/css"></style>
