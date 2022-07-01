<!-- @format -->
<template>
    <div class="games">
        <div v-if="step === 'new-game'" class="add-game-container">
            <h1>Add Game</h1>
            <div class="form">
                <div v-if="game.logoUrl" class="logo-img-container">
                    <img :src="game.logoUrl" class="logo" />
                    <v-btn class="remove-image-btn" @click="game.logoUrl = ''">X</v-btn>
                </div>
                <input v-model="game.title" type="text" name="title" placeholder="Title" />
                <input
                    v-if="!game.logoUrl"
                    v-model="game.logoUrl"
                    type="text"
                    placeholder="Logo Url"
                />
                <div class="bulk-add-characters">
                    <textarea
                        v-model="unfilteredCharacters"
                        name="character"
                        placeholder="Character Names (separated by commas)"
                    />
                </div>
                <div>
                    <v-btn class="submit-btn" rounded @click="nextStep(step)">next</v-btn>
                </div>
            </div>
        </div>
        <div v-else-if="step === 'character-avatar'" class="character-detail-container">
            <div v-if="characterList" class="game-characters-lists-container">
                <label>Character Count: ({{ characterList.length }})</label>
                <ul class="character-list">
                    <li v-for="(character, index) in characterList" :key="character.name">
                        <div v-if="character.avatarUrl" class="character-img-container">
                            <img :src="character.avatarUrl" class="character-img" />
                            <v-btn class="remove-image-btn" @click="character.avatarUrl = ''"
                                >X</v-btn
                            >
                        </div>
                        <p class="character-name">{{ character.name }}</p>
                        <v-text-field
                            v-if="!character.avatarUrl"
                            v-model="character.avatarUrl"
                            type="text"
                            placeholder="image Url"
                        />
                        <v-btn class="remove-character-btn" @click="removeCharacter(index)">
                            X
                        </v-btn>
                    </li>
                </ul>
            </div>
            <v-btn class="submit-btn" rounded @click="nextStep(step)">next</v-btn>
        </div>
        <div v-else class="character-detail-container">
            <div v-if="characterList" class="game-characters-lists-container">
                <ul class="character-list">
                    <li v-for="character in characterList" :key="character.name">
                        <div v-if="character.imageUrl" class="character-img-container">
                            <img :src="character.imageUrl" class="character-img" />
                            <v-btn class="remove-image-btn" @click="character.imageUrl = ''">
                                X
                            </v-btn>
                        </div>
                        <p class="character-name">{{ character.name }}</p>
                        <v-text-field
                            v-if="!character.imageUrl"
                            v-model="character.imageUrl"
                            type="text"
                            placeholder="image Url"
                        />
                    </li>
                </ul>
            </div>
            <v-btn class="submit-btn" rounded @click="addGame()">Save Game</v-btn>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GamesService from '@/services/games-service';
import CharactersService from '@/services/characters-service';

export default {
    name: 'NewGame',
    data() {
        return {
            game: {
                title: '',
                id: '',
                logoUrl: '',
            },
            unfilteredCharacters: '',
            characterList: [],
            step: 'new-game',
        };
    },

    computed: {
        characters: function () {
            var characters = this.unfilteredCharacters.split(',').map((character) => {
                return {
                    name: character.trim(),
                    imageUrl: '',
                    avatarUrl: '',
                };
            });
            return characters;
        },
    },

    methods: {
        nextStep(currentStep) {
            switch (currentStep) {
                case 'new-game':
                    this.characterList = this.characters;
                    this.step = 'character-avatar';
                    break;
                case 'character-avatar':
                    this.characterList = this.characters;
                    this.step = 'character-list';
                    break;
            }
            return;
        },

        async addGame() {
            await GamesService.addGame({
                Title: this.game.title,
                LogoUrl: this.game.logoUrl,
            });
            this.getGameId();
        },

        async getGameId() {
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'Title',
                        queryValue: this.game.title,
                    },
                ],
            };

            const response = await GamesService.queryGames(queryParameter);

            this.game.id = response.data.games[0]._id;
            this.addCharacters();
        },

        async addCharacters() {
            await CharactersService.addBulkCharacters(
                this.characters.map((character) => {
                    return {
                        Name: character.name,
                        ImageUrl: character.imageUrl,
                        AvatarUrl: character.avatarUrl,
                        GameId: this.game.id,
                    };
                })
            );

            eventbus.$emit('updateSearch');
            this.$emit('closeModal');
        },

        removeCharacter(index) {
            this.characterList.splice(index, 1);
        },

        removeLogo() {
            this.game.logoUrl = '';
        },
    },
};
</script>
<style type="text/css">
.games input {
    margin-bottom: 10px;
}

.games .game-characters-lists-container label {
    font-size: 11px;
    font-style: italic;
    margin-bottom: 5px;
    display: block;
}

.games .new-characters-container input {
    margin: 5px;
}

.games .new-characters-container {
    margin-bottom: 50px;
}

.games .character-list li {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px;
}

.games .character-list .character-name {
    width: 250px;
}

.games .character-list .v-input {
    max-width: 300px;
    margin-left: 30px;
    float: right;
}

.games .character-list li:nth-child(even) {
    background: #eee;
}

.games .character-img-container {
    position: relative;
    margin-right: 20px;
}

.games .character-img-container img {
    width: 50px;
    height: auto;
    border-radius: 50%;
}

.games .character-list .character-img-container .remove-image-btn {
    width: 10px;
    height: 10px;
    min-width: 10px;
    background-color: transparent !important;
    color: red;
    padding: 5px;
    position: absolute;
    top: 0;
    font-size: 8px;
    right: 0;
}

.games .submit-btn {
    margin-top: 20px;
}

.games .logo-img-container img {
    width: 200px;
    height: auto;
    margin: 0 auto;
    display: flex;
    overflow: hidden;
    margin-bottom: 20px;
    justify-content: space-around;
}
</style>
