<template>
    <div class="tier-list-details" >
        <div class="header">
            <div class="header-info">
                <h1>{{ tierList.name }}</h1>
                <p v-if="tierList.source" class="source">Source: {{ tierList.source }}</p>
            </div>
            <div class="actions">
                <span class="stat"><i class="fas fa-eye"></i> {{ tierList.views }}</span>
                <button :class="{ liked: isLiked }" @click="toggleLike">
                    <i class="fas fa-thumbs-up"></i> {{ tierList.likes.length }}
                </button>
            </div>
        </div>

        <div class="tier-maker-container">
            <div class="tiers">
                <div v-for="tier in tierList.tiers" :key="tier.Name" class="tier-row">
                    <div class="tier-label" :style="{ backgroundColor: tier.color }">
                        {{ tier.name }}
                    </div>
                    <div class="tier-content">
                        <div
                            v-for="charId in tier.characters"
                            :key="charId"
                            class="character-card"
                        >
                            <img :src="getCharacterImage(charId)" :alt="getCharacterName(charId)" />
                            <span>{{ getCharacterName(charId) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TierListsService from '@/services/tier-lists-service';
import CharactersService from '@/services/characters-service';
import { setPageTitle } from '@/services/og-meta-service';

export default {
    name: 'TierListDetails',
    data() {
        return {
            tierList: null,
            characters: {}, // Map ID -> Character Data
            account: { _id: '691d604c25f5daa93c993492' } // Mock account
        };
    },
    computed: {
        isLiked() {
            return this.tierList && this.tierList.likes.includes(this.account._id);
        }
    },
    async mounted() {
        await this.fetchTierList();
        await this.fetchCharacters();
        this.incrementView();
    },
    methods: {
        async fetchTierList() {
            try {
                const response = await TierListsService.getTierList(this.$route.params.id);
                this.tierList = {
                    id: response.data._id,
                    name: response.data.Name,
                    gameId: response.data.GameId,
                    tiers: this.mapTiers(response.data.Tiers),
                    likes: response.data.Likes,
                    views: response.data.Views,
                    source: response.data.Source,
                };
                if (this.tierList.name) {
                    setPageTitle(
                        `${this.tierList.name} tier list`,
                        `View the ${this.tierList.name} tier list on Fighters Edge.`
                    );
                }
            } catch (error) {
                console.error('Error fetching tier list:', error);
            }
        },
        async fetchCharacters() {
            if (!this.tierList) return;
            try {
                // Ideally we should fetch only needed characters, but for now let's query by game
                // Or we can assume we need to fetch individually if we don't have a bulk endpoint
                // Let's try to fetch all characters for the game to populate the map
                 var searchQuery = [
                    {
                        queryName: 'GameId',
                        queryValue: this.tierList.gameId
                    },
                ];

                var queryParameter = {
                    searchQuery: searchQuery,
                };

                const response = await CharactersService.queryCharacters(queryParameter);
                this.characters = response.data.characters.map((character) => {
                    return {
                        id: character._id,
                        name: character.Name,
                        imageUrl: character.AvatarUrl,
                        slug: character.Slug,
                    };
                });
            } catch (error) {
                console.error('Error fetching characters:', error);
            }
        },

        mapTiers(tiers) {
            return tiers.map((tier) => {
                return {
                    name: tier.Name,
                    color: tier.Color,
                    characters: tier.Characters,
                };
            });
        },  

        getCharacterImage(id) {
            return this.characters.filter((character) => character.id === id)[0].imageUrl;
        },
        getCharacterName(id) {
            return this.characters.filter((character) => character.id === id)[0].name;
        },
        async incrementView() {
            try {
                await TierListsService.addView(this.tierList.id);
                this.tierList.Views++;
            } catch (error) {
                console.error('Error incrementing view:', error);
            }
        },
        async toggleLike() {
            try {
                const response = await TierListsService.likeTierList(this.tierList.id, this.account.id);
                await this.fetchTierList();
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        }
    }
};
</script>

<style scoped>
.tier-list-details {
    padding: 200px 20px 20px;
    color: white;
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.source {
    font-size: 14px;
    color: #aaa;
    margin: 0;
    font-style: italic;
}

.actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.stat {
    font-size: 18px;
    color: #aaa;
}

button {
    padding: 10px 20px;
    background-color: #2c3e50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
}

button.liked {
    background-color: #4CAF50;
}

button:hover {
    opacity: 0.9;
}

.tier-row {
    display: flex;
    margin-bottom: 10px;
    background-color: #1a1a1a;
    min-height: 100px;
    border: 1px solid #333;
}

.tier-label {
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: black;
}

.tier-content {
    flex-grow: 1;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.character-card {
    width: 80px;
    height: 80px;
    background-color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 5px;
    position: relative;
}

.character-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.character-card span {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.7);
    font-size: 10px;
    text-align: center;
    padding: 2px 0;
}
</style>
