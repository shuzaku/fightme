<!-- @format -->
<template>
    <div class="character-nav">
        <div class="character-header" :style="characterbubbleStyle">
            <div class="options">
                <h2>{{ name }}</h2>
                <div class="divider">></div>
                <div class="sort-filter-container">
                    <span>Show:</span>
                    <select v-model="selectedFilter">
                        <option v-for="option in filterOptions" :key="option">
                            {{ option }}
                        </option>
                    </select>
                    <span v-if="selectedFilter === 'Combo'" class="divider">></span>
                    <select v-show="selectedFilter === 'Combo'" v-model="selectedSort">
                        <option v-for="option in comboSortOptions" :key="option">
                            {{ option }}
                        </option>
                    </select>
                </div>
            </div>
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
            selectedSort: 'Hits',
            imageUrl: null
        };
    },

    computed: {
        characterbubbleStyle() {
            return {
                'background-image': `url(${this.imageUrl})`,
                'background-size': '40%',
                'background-repeat': 'no-repeat',
                'background-position': '0% 23%'
            };
        }
    },

    watch: {
        selectedSort() {
            this.$emit('character-sort:update', this.selectedSort);
        },

        selectedFilter() {
            this.$emit('character-filter:update', this.selectedFilter);
        },

        characterId() {
            this.getCharacter();
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
            this.imageUrl = response.data.ImageUrl;
        }
    }
};
</script>
<style type="text/css">
.character-nav {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
}

.character-nav .character-header {
    height: 80px;
    background: #fff;
    color: #3eb489;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    border-radius: 25px;
    border: 3px solid #3eb489;
}

.character-nav .character-header h2 {
    text-align: right;
}

.character-nav .character-header .options {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.character-nav .character-header .divider {
    margin: 0 10px;
}

.character-nav .character-header select {
    margin: 0 5px;
    border-bottom: 1px solid #3eb489;
    font-weight: 600;
    cursor: pointer;
}

.character-nav .sort-filter-container .divider {
    margin: 0;
}
</style>
