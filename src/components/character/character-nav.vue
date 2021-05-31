<!-- @format -->
<template>
    <div class="character-nav">
        <h2>{{ name }}</h2>
        <div class="sort-filter-container">
            <select v-model="selectedFilter">
                <option v-for="option in filterOptions" :key="option">
                    {{ option }}
                </option>
            </select>
            <select v-show="selectedFilter === 'Combo'" v-model="selectedSort">
                <option v-for="option in comboSortOptions" :key="option">
                    {{ option }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'CharacterNav',
    props: {
        characterId: {
            type: String,
            default: ''
        }
    },

    data() {
        return {
            name: null,
            filterOptions: ['All Videos', 'Combo', 'Match'],
            comboSortOptions: ['Damage', 'Hits'],
            selectedFilter: 'All Videos',
            selectedSort: 'Hits'
        };
    },

    watch: {
        selectedSort() {
            this.$emit('character-sort:update', this.selectedSort);
        },

        selectedFilter() {
            this.$emit('character-filter:update', this.selectedFilter);
        }
    },

    mounted() {
        this.getCharacter();
    },

    methods: {
        async getCharacter() {
            const response = await CharactersService.getCharacter({
                id: this.characterId
            });
            this.name = response.data.Name;
        }
    }
};
</script>
<style type="text/css">
.character-nav {
    padding: 0 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.character-nav select {
    margin-left: 20px;
}
</style>
