<!-- @format -->
<template>
    <div class="combo-box" :style="boxStyle" @click="navigateToCombo()">
        <div class="heading">
            <h2>Combos</h2>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ComboBox',

    props: {
        character: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    computed: {
        boxStyle() {
            return {
                'background-color': '#4447e2',
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
            };
        },
    },

    mounted() {},

    methods: {
        navigateToCombo() {
            this.$router.push(`/character/${this.character.id}/combos`);
        },
    },
};
</script>

<style type="text/css">
.combo-box {
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
}

.combo-box h2.heading {
    margin-bottom: 20px;
    text-align: center;
}
</style>
