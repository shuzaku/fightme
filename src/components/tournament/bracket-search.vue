<!-- @format -->
<template>
    <div class="bracket-search">
        <multiselect
            v-model="selectedBracket"
            :options="bracketFilters"
            :close-on-select="true"
            :clear-on-select="false"
            :loading="isLoading"
            :placeholder="placeholder"
            @input="setBracketFilter"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Bracket
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
export default {
    name: 'BracketSearch',
    props: {
        value: {
            type: String,
            default: null,
        },

        placeholder: {
            type: String,
            default: 'Filter Bracket',
        },

        bracketFilters: {
            type: Array,
            default: () => [],
        }
    },

    data() {
        return {
            selectedBracket: null,
            isLoading: false,
        };
    },

    computed: {},

    watch: {},

    mounted() {},

    methods: {
        setBracketFilter() {
            this.$emit('filter:bracket', this.selectedBracket);
        },
    },
};
</script>
<style type="text/css">
.bracket-search .bracket-option {
    display: flex;
    align-items: center;
}
</style>
