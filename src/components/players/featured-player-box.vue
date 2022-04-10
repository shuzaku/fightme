<!-- @format -->
<template>
    <div class="featured-player-box" :style="boxStyle" @click="navigateToCombo()">
        <h2 class="heading">Featured Players</h2>
        <multiselect
            :options="characters"
            :multiple="multiple"
            :close-on-select="!multiple"
            :clear-on-select="true"
            :preserve-search="true"
            :taggable="taggable"
            :custom-label="customLabel"
            label="name"
            :placeholder="placeHolder"
            @input="setCharacter($event)"
        >
            <template slot="singleLabel" slot-scope="props">
                <img class="option__image" :src="props.option.imageUrl" />
                <span class="option__name">{{ props.option.name }}</span>
            </template>
            <template slot="option" slot-scope="props">
                <img class="option__image" :src="props.option.imageUrl" alt="No Man’s Sky" />
                <div class="option__desc">
                    <span class="option__name">{{ props.option.name }}</span>
                </div>
            </template>
        </multiselect>
    </div>
</template>

<script>
export default {
    name: 'FeaturedPlayerBox',

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
                'background-color': '#1c1c24',
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
.featured-player-box {
    width: 300px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
}

.featured-player-box h2.heading {
    text-align: center;
}
</style>
