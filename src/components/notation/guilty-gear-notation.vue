<!-- @format -->
<template>
    <div class="top-nav">
        <div class="notations" v-for="notation in notations" :key="notation.name">
            <div class="notation" v-if="notation.name === selectedNotationType">
                <div class="movement">
                    <div class="up-back">{{notation.}}</div>
                    <div class="up"></div>
                    <div class="up-forward"></div>
                    <div class="back"></div>
                    <div class="neutral"></div>
                    <div class="forward"></div>
                    <div class="down-back"></div>
                    <div class="down"></div>
                    <div class="up-back"></div>
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
