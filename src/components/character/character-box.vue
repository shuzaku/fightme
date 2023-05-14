<!-- @format -->
<template>
    <div class="character-box"><img :src="character.imageUrl" /></div>
</template>

<script>
export default {
    name: 'CharacterBox',

    props: {
        character: {
            type: Object,
            default: null,
        },
    },

    computed: {},

    data() {
        return {};
    },

    created() {},

    methods: {},
};
</script>
<style type="text/css"></style>
