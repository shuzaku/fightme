<!-- @format -->
<template>
    <div class="game-nav">
        <div v-if="game" class="game-bubble" :style="trendingStyle">
            <div class="options">
                <div class="sort-filter-container">
                    <span>Show:</span>
                    <select v-model="selectedFilter">
                        <option v-for="option in filterOptions" :key="option">
                            {{ option }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'GameNav',
    props: {
        gameId: {
            type: String,
            default: ''
        }
    },

    data() {
        return {
            filterOptions: ['All Videos', 'Combo', 'Match'],
            selectedFilter: 'All Videos',
            game: null
        };
    },

    computed: {
        trendingStyle() {
            return {
                'background-image': `url(${this.game.logoUrl})`,
                'background-size': 'contain',
                'background-repeat': 'no-repeat',
                'background-position': '5% 50%'
            };
        }
    },

    watch: {
        selectedFilter() {
            this.$emit('game-filter:update', this.selectedFilter);
        }
    },

    created() {
        this.getGame();
    },

    methods: {
        async getGame() {
            const response = await GamesService.getGame({
                id: this.gameId
            });
            this.game = {
                title: response.data.Title,
                logoUrl: response.data.LogoUrl
            };
        }
    }
};
</script>
<style type="text/css">
.game-nav {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.game-nav .game-bubble {
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

.game-nav .game-bubble h2 {
    text-align: right;
}

.game-nav .game-bubble .options {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.game-nav .game-bubble .divider {
    margin: 0 10px;
}

.game-nav .game-bubble select {
    margin: 0 5px;
    border-bottom: 1px solid #3eb489;
    font-weight: 600;
    cursor: pointer;
}

.game-nav .sort-filter-container .divider {
    margin: 0;
}
</style>
