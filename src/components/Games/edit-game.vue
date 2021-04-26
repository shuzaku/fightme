<!-- @format -->
<template>
    <div class="edit-games">
        <h1>Edit Game</h1>
        <div class="form">
            <div>
                <input type="text" name="title" placeholder="TITLE" v-model="title" />
            </div>
            <v-btn
                @click="showCharacterList = !showCharacterList"
                v-if="!isAddingPlayers"
                class="character-btn"
                tile
                color="indigo"
            >
                {{ showCharacterList ? 'Minimize Character List' : 'Show Character List' }}
            </v-btn>
            <div class="table-container" v-if="showCharacterList">
                <table>
                    <tr v-for="character in characters" :key="character" class="character-row">
                        <td>
                            <div
                                class="image-container"
                                :style="{
                                    background:
                                        'url(' + character.ImageUrl + ') no-repeat top center/cover'
                                }"
                            ></div>
                            {{ character.Name }}
                            <button @click="removeCharacter(character)" class="deleteBtn">X</button>
                        </td>
                    </tr>
                    <tr>
                        <textarea
                            type="textarea"
                            name="title"
                            placeholder="Add Characters (separate by commas)"
                            v-model="newCharacters"
                        />
                    </tr>
                </table>
            </div>

            <div
                v-if="title !== oldTitle || removedCharacters.length >= 1 || newCharactersList"
                class="changes-container"
            >
                <h3>Changes</h3>
                <div v-if="title !== oldTitle">
                    <p>Title:</p>
                    {{ oldTitle }} -> {{ title }}
                </div>
                <div v-if="removedCharacters.length >= 1">
                    <p>Removed Characters</p>
                    <ul>
                        <li v-for="character in removedCharacters" :key="character">
                            {{ character }}
                        </li>
                    </ul>
                </div>
                <div v-if="newCharactersList">
                    <p>Added Characters</p>
                    <ul>
                        <li v-for="character in newCharactersList" :key="character">
                            {{ character }}
                        </li>
                    </ul>
                </div>
            </div>

            <button class="app_post_btn" @click="updateGame">Update</button>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

import moment from 'moment';

export default {
    name: 'EditGame',

    components: {},

    data() {
        return {
            oldTitle: '',
            title: '',
            description: '',
            createdDate: '',
            updatedDate: '',
            characters: '',
            removedCharacters: [],
            gameId: this.$route.params.id,
            newCharacters: '',
            showCharacterList: false
        };
    },

    mounted() {
        this.getGame();
    },

    methods: {
        async getGame() {
            const response = await GamesService.getGame({
                id: this.$route.params.id
            });
            this.oldTitle = response.data.GameTitle;
            this.title = response.data.GameTitle;
            this.characters = response.data.Characters;
            this.createdDate = response.data.CreatedDate;
        },

        async updateGame() {
            if (this.newCharactersList) {
                this.newCharactersList.forEach(newCharacter => this.characters.push(newCharacter));
            }

            await GamesService.updateGame({
                id: this.gameId,
                GameTitle: this.title,
                Characters: this.characters,
                CreatedDate: this.createdDate,
                UpdatedDate: this.timestamp
            });
            this.$router.push({ name: 'Games' });
        },

        removeCharacter(character) {
            this.removedCharacters.push(character);
            this.characters.splice(this.characters.indexOf(character), 1);
        }
    },

    computed: {
        timestamp: function() {
            return moment().format();
        },

        newCharactersList: function() {
            if (this.newCharacters != '') {
                let list = this.newCharacters.split(',');
                list.map(character => character.trim());
                return list;
            } else {
                return null;
            }
        }
    }
};
</script>

<style type="text/css">
.form input,
.form textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #e0dede;
    outline: none;
    font-size: 12px;
}

.app_post_btn {
    background: #4d7ef7;
    color: #fff;
    padding: 10px 80px;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: bold;
    width: 100%;
    border: none;
    cursor: pointer;
}

.edit-games {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.edit-games .players-container button,
.edit-games .players-container input,
.edit-games label,
.edit-games .or {
    display: block;
}

.edit-games table {
    width: 100%;
}

.edit-games .character-row td {
    position: relative;
    display: flex;
    align-items: center;
}

.edit-games .character-row:hover .deleteBtn {
    display: block;
}

.edit-games .deleteBtn {
    color: red;
    position: absolute;
    right: 10px;
    top: 50%;
    margin-top: -10px;
    display: none;
}

.edit-games .character-btn {
    margin: 20px 0 40px 0;
}

.edit-games .image-container {
    width: 40px;
    height: 40px;
    overflow: hidden;
    margin-right: 20px;
    border: 1px solid #eee;
}
</style>
