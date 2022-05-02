<!-- @format -->
<template>
    <div class="character-move-list">
        <h2 class="matchup-heading">Explore More</h2>
        <loading v-if="isLoading"></loading>
        <div v-else class="matchup-container">
            <div @click="goToGame()">
                <game-nav v-if="gameId" :gameId="gameId" :showMenu="false" />
            </div>

            <div class="character-matchup-percentage-container">
                <character-matchup-percentage
                    :characterId="characters[0].id"
                    :opposingCharacterId="characters[1].id"
                />
            </div>
            <div class="column-container">
                <div
                    v-for="(character, index) in characters"
                    :key="character.id"
                    class="character-column"
                >
                    <matchup-box
                        :character="character"
                        @update-matchup="updateMatchup($event, index)"
                    />
                </div>
            </div>
            <div class="move-comparison-button">
                <h2>Compare Moves</h2>
                <div class="drop-down-container">
                    <character-move-list
                        :characterId="characters[0].id"
                        @update:move="setCharacter1Move($event)"
                    />
                    <character-move-list
                        :characterId="characters[1].id"
                        @update:move="setCharacter2Move($event)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import MatchupBox from '@/components/matchup/matchup-box';

import GameNav from '@/components/games/game-nav';
import Loading from '@/components/common/loading';
import CharacterMoveList from '@/components/character/character-move-list';
import CharacterMatchupPercentage from '@/components/matchup/character-matchup-percentage';

export default {
    name: 'MoreMatchupInfo',

    components: {
        'matchup-box': MatchupBox,
        'game-nav': GameNav,
        loading: Loading,
        'character-move-list': CharacterMoveList,
        'character-matchup-percentage': CharacterMatchupPercentage,
    },

    data() {
        return {
            character1Id: this.$route.params ? this.$route.params.id : null,
            character2Id: this.$route.params ? this.$route.params.id2 : null,
            characters: [],
            gameId: null,
            isLoading: false,
        };
    },

    computed: {
        path: function () {
            return this.$route.path;
        },
    },

    watch: {
        path() {
            this.character1Id = this.$route.params.id;
            this.character2Id = this.$route.params.id2;
            this.queryCharacters();
        },
    },

    mounted() {
        this.queryCharacters();
    },

    methods: {
        async queryCharacters() {
            this.isLoading = true;
            var searchQuery = [
                {
                    characters: { character1: this.character1Id, character2: this.character2Id },
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await CharactersService.queryMatchup(queryParameter);
            this.characters = [];
            this.gameId = response.data.characters[0].GameId;

            this.hydrateCharacters(response);
            this.isLoading = false;
        },

        hydrateCharacters(response) {
            this.characters.push(
                response.data.characters
                    .filter((character) => character._id === this.character1Id)
                    .map((character) => {
                        return {
                            name: character.Name,
                            imageUrl: character.AvatarUrl,
                            fullImage: character.ImageUrl,
                            id: character._id,
                            featuredPlayers: character.FeaturedPlayers,
                            gameId: character.GameId,
                        };
                    })[0]
            );

            this.characters.push(
                response.data.characters
                    .filter((character) => character._id === this.character2Id)
                    .map((character) => {
                        return {
                            name: character.Name,
                            imageUrl: character.AvatarUrl,
                            fullImage: character.ImageUrl,
                            id: character._id,
                            featuredPlayers: character.featuredPlayers,
                            gameId: character.GameId,
                        };
                    })[0]
            );
        },

        goToGame() {
            this.$router.push(`/game/${this.gameId}`);
        },

        updateMatchup(character, index) {
            if (index === 0) {
                this.$router.push(`/matchups/${character.id}/${this.characters[1].id}`);
            } else {
                this.$router.push(`/matchups/${this.characters[0].id}/${character.id}`);
            }
        },
    },
};
</script>

<style type="text/css">
.character-move-list .column-container {
    display: flex;
    justify-content: space-between;
}

.character-move-list h2 {
    color: #fff;
    font-size: 25px;
}

.character-move-list h2.matchup-heading {
    margin-bottom: 30px;
    font-size: 20px;
}

.character-move-list .game-nav {
    width: 100%;
}

.character-move-list .info-row {
    display: flex;
}

.character-move-list .matchup-box {
    background: #4447e2;
    border: 2px solid #4447e2;
}

.character-move-list .character-column:nth-child(2) .matchup-box {
    background: #3eb489;
    border: 2px solid #3eb489;
}

.character-move-list .move-comparison-button {
    background: #db8c10;
    text-align: center;
    padding: 25px 10px;
}

.character-move-list .drop-down-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.character-move-list .drop-down-container .character-move-list {
    max-width: 49%;
    width: 100%;
}

.character-move-list .drop-down-container .character-move-list:first-child table {
    margin: 10px 0 auto auto;
}
</style>
