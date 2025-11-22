<template>
    <div class="tier-list-gallery">
        <h1>Tier List Gallery</h1>
        <div class="gallery-grid">
            <div
                v-for="list in tierLists"
                :key="list.id"
                class="gallery-item"
                @click="goToDetails(list.id)"
            >
                <div class="card-header">
                    <img v-if="list.gameLogo" :src="list.gameLogo" class="game-logo" />
                    <div class="header-text">
                        <h3>{{ list.name }}</h3>
                        <span class="author">by {{ list.author }}</span>
                    </div>
                </div>
                
                <div class="preview-chars">
                    <img 
                        v-for="(charUrl, index) in list.topCharacters" 
                        :key="index" 
                        :src="charUrl" 
                        class="preview-char"
                    />
                </div>

                <div class="stats">
                    <span><i class="fas fa-eye"></i> {{ list.views }}</span>
                    <span><i class="fas fa-thumbs-up"></i> {{ list.likes }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TierListsService from '@/services/tier-lists-service';

export default {
    name: 'TierListGallery',
    data() {
        return {
            tierLists: []
        };
    },
    async mounted() {
        await this.fetchTierLists();
    },
    methods: {
        async fetchTierLists() {
            try {
                const response = await TierListsService.getTierLists();
                this.tierLists = this.mapItems(response.data);
            } catch (error) {
                console.error('Error fetching tier lists:', error);
            }
        },

        mapItems(items) {
            return items.map(item => {
                // Find top 3 characters
                let topCharacters = [];
                if (item.Tiers && item.Tiers.length > 0) {
                    for (const tier of item.Tiers) {
                        if (tier.Characters && tier.Characters.length > 0) {
                            topCharacters = topCharacters.concat(tier.Characters);
                            if (topCharacters.length >= 3) break;
                        }
                    }
                }
                topCharacters = topCharacters.slice(0, 3).map(c => c.AvatarUrl);

                return {
                    id: item._id,
                    gameId: item.GameId ? item.GameId._id : null,
                    gameLogo: item.GameId ? item.GameId.LogoUrl : null,
                    name: item.Name,
                    author: item.OwnerId ? item.OwnerId.DisplayName : 'Unknown',
                    views: item.Views,
                    likes: item.Likes.length,
                    topCharacters: topCharacters
                };
            });
        },  

        goToDetails(id) {
            this.$router.push({ name: 'TierListDetails', params: { id: id } });
        }
    }
};
</script>

<style scoped>
.tier-list-gallery {
    padding: 160px 20px 20px;
    color: white;
    max-width: 1200px;
    margin: 0 auto;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.gallery-item {
    background-color: #2c3e50;
    padding: 20px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.gallery-item:hover {
    transform: translateY(-5px);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.game-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 5px;
}

.header-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.gallery-item h3 {
    margin: 0;
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.author {
    font-size: 12px;
    color: #aaa;
}

.preview-chars {
    display: flex;
    gap: 5px;
    height: 50px;
}

.preview-char {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 5px;
    background-color: #333;
}

.stats {
    margin-top: auto;
    display: flex;
    gap: 15px;
    color: #aaa;
    font-size: 14px;
}
</style>
