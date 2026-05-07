<!-- @format -->
<template>
    <div class="tier-list-maker-view">
        <h1>Tier List Maker</h1>
        <div class="controls">
            <select v-model="selectedGameId" @change="onGameSelect">
                <option value="" disabled selected>Select a Game</option>
                <option v-for="game in games" :key="game.id" :value="game.id">
                    {{ game.title }}
                </option>
            </select>
            <input
                v-if="selectedGameId"
                v-model="tierListName"
                placeholder="Tier List Name"
                class="name-input"
            />
            <input
                v-if="selectedGameId"
                v-model="tierListSource"
                placeholder="Source (optional)"
                class="name-input"
            />
            <button v-if="selectedGameId" @click="openSaveDialog" class="save-btn">
                Save Tier List
            </button>
        </div>

        <div v-if="showSaveDialog" class="save-dialog-overlay">
            <div class="save-dialog">
                <h3>Save Tier List</h3>
                <p>Are you sure you want to save "{{ tierListName }}"?</p>
                <div class="dialog-actions">
                    <button @click="saveTierList">Save</button>
                    <button @click="showSaveDialog = false">Cancel</button>
                </div>
            </div>
        </div>

        <div v-if="selectedGameId" class="tier-maker-container">
            <div class="tiers">
                <div
                    v-for="tier in tiers"
                    :key="tier.name"
                    class="tier-row"
                    @dragover.prevent
                    @drop="onDrop($event, tier.name)"
                >
                    <div class="tier-label" :style="{ backgroundColor: tier.color }">
                        {{ tier.name }}
                    </div>
                    <div class="tier-content">
                        <div
                            v-for="(char, index) in tierState[tier.name]"
                            :key="char.id"
                            class="character-card"
                            draggable="true"
                            @dragstart.stop="onDragStart($event, char, tier.name, index)"
                            @drop.stop="onDrop($event, tier.name, index)"
                            @dragover.prevent
                        >
                            <img :src="char.imageUrl" :alt="char.name" />
                            <span>{{ char.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="unassigned-pool" @dragover.prevent @drop="onDrop($event, 'unassigned')">
                <h3>Unassigned Characters</h3>
                <div class="pool-content">
                    <div
                        v-for="(char, index) in tierState['unassigned']"
                        :key="char.id"
                        class="character-card"
                        draggable="true"
                        @dragstart.stop="onDragStart($event, char, 'unassigned', index)"
                        @drop.stop="onDrop($event, 'unassigned', index)"
                        @dragover.prevent
                    >
                        <img :src="char.imageUrl" :alt="char.name" />
                        <span>{{ char.name }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import CharactersService from '@/services/characters-service';
import TierListsService from '@/services/tier-lists-service';

export default {
    name: 'TierListMaker',
    data() {
        return {
            games: [],
            selectedGameId: '',
            tiers: [
                { name: 'S', color: '#ff7f7f' },
                { name: 'A', color: '#ffbf7f' },
                { name: 'B', color: '#ffdf7f' },
                { name: 'C', color: '#ffff7f' },
                { name: 'D', color: '#bfff7f' },
            ],
            tierState: {
                unassigned: [],
            },
            tierListName: '',
            tierListSource: '',
            showSaveDialog: false,
        };
    },
    computed: {
        accountId() {
            return this.$attrs.account.id;
        },
    },
    async mounted() {
        await this.fetchGames();
        this.initializeTierState();

        // Auto-select game from query parameter if provided, then clean the URL
        if (this.$route.query.gameId) {
            this.selectedGameId = this.$route.query.gameId;
            await this.onGameSelect();
            // Replace so the ?gameId= param doesn't persist in the address bar or get shared
            this.$router.replace({ path: '/tier-list-maker' }).catch(() => {});
        }
    },
    methods: {
        initializeTierState() {
            this.tierState = { unassigned: [] };
            this.tiers.forEach((t) => {
                this.$set(this.tierState, t.name, []);
            });
        },
        async fetchGames() {
            try {
                const response = await GamesService.fetchGames();
                this.games = response.data.games.map((game) => {
                    return {
                        id: game._id,
                        title: game.Title,
                        logoUrl: game.LogoUrl,
                    };
                });
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        },
        async onGameSelect() {
            if (!this.selectedGameId) return;
            try {
                var searchQuery = [
                    {
                        queryName: 'GameId',
                        queryValue: this.selectedGameId,
                    },
                ];

                var queryParameter = {
                    searchQuery: searchQuery,
                };

                const response = await CharactersService.queryCharacters(queryParameter);

                const characters = response.data.characters.map((character) => {
                    return {
                        id: character._id,
                        name: character.Name,
                        imageUrl: character.AvatarUrl,
                        slug: character.Slug,
                    };
                });

                // Reset tiers
                this.initializeTierState();
                this.tierState.unassigned = characters;
            } catch (error) {
                console.error('Error fetching characters:', error);
            }
        },
        onDragStart(event, character, sourceTier, index) {
            event.dataTransfer.setData('characterId', character.id);
            event.dataTransfer.setData('sourceTier', sourceTier);
            event.dataTransfer.setData('sourceIndex', index);
            event.dataTransfer.effectAllowed = 'move';
        },
        onDrop(event, targetTier, targetIndex = null) {
            const characterId = event.dataTransfer.getData('characterId');
            const sourceTier = event.dataTransfer.getData('sourceTier');
            const sourceIndex = parseInt(event.dataTransfer.getData('sourceIndex'));

            if (!characterId || !sourceTier) return;

            // Remove from source
            const character = this.tierState[sourceTier][sourceIndex];
            this.tierState[sourceTier].splice(sourceIndex, 1);

            // Add to target
            if (targetIndex !== null) {
                this.tierState[targetTier].splice(targetIndex, 0, character);
            } else {
                this.tierState[targetTier].push(character);
            }
        },
        openSaveDialog() {
            this.showSaveDialog = true;
        },
        async saveTierList() {
            if (!this.tierListName) {
                alert('Please enter a name for your tier list.');
                return;
            }

            const tiersData = this.tiers.map((tier) => ({
                Name: tier.name,
                Color: tier.color,
                Characters: this.tierState[tier.name].map((c) => c.id),
            }));

            const payload = {
                Name: this.tierListName,
                GameId: this.selectedGameId,
                OwnerId: this.accountId,
                Tiers: tiersData,
                Source: this.tierListSource || undefined,
            };

            try {
                await TierListsService.createTierList(payload);
                alert('Tier list saved successfully!');
                this.showSaveDialog = false;
                this.tierListName = '';
                this.tierListSource = '';
            } catch (error) {
                console.error('Error saving tier list:', error);
                alert('Failed to save tier list.');
            }
        },
    },
};
</script>

<style scoped>
.tier-list-maker-view {
    padding: 160px 20px 20px;
    color: white;
    max-width: 1200px;
    margin: 0 auto;
}

.controls {
    margin-bottom: 20px;
}

.controls select {
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    background-color: #2c3e50;
    color: white;
    border: 1px solid #444;
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

.unassigned-pool {
    margin-top: 30px;
    background-color: #1a1a1a;
    padding: 20px;
    border: 1px solid #333;
}

.pool-content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 100px;
}

.character-card {
    width: 80px;
    height: 80px;
    background-color: #333;
    cursor: grab;
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

.save-btn {
    margin-left: 10px;
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.name-input {
    margin-left: 10px;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #444;
    background-color: #2c3e50;
    color: white;
    width: 200px;
}

.save-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.save-dialog {
    background: #2c3e50;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    color: white;
}

.save-dialog input {
    padding: 10px;
    margin: 10px 0;
    width: 100%;
    border-radius: 5px;
    border: 1px solid #444;
}

.dialog-actions button {
    margin: 5px;
    padding: 8px 16px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
}

.dialog-actions button:first-child {
    background-color: #4caf50;
    color: white;
}

.dialog-actions button:last-child {
    background-color: #f44336;
    color: white;
}
</style>
