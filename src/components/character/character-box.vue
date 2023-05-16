<!-- @format -->
<template>
    <div @click="navigate()" class="character-box"><img :src="character.imageUrl" /></div>
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

    methods: {
        navigate() {
            this.$router.push(`character/${this.character.id}`);
        },
    },
};
</script>
<style type="text/css">
.character-box {
    cursor: pointer;
}
</style>
