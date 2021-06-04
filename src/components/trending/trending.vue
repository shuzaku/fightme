<!-- @format -->
<template>
    <div class="trending-container">
        <h2>Trending</h2>
        <trending-game :gameId="'606d42021ddff92064798667'" />
    </div>
</template>

<script>
import TrendingGame from '@/components/trending/trending-game';

export default {
    name: 'Trending',
    components: {
        'trending-game': TrendingGame
    }
};
</script>

<style></style>
