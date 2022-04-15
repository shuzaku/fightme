<!-- @format -->
<template>
    <div class="more-matchup-info">
        <h2 class="matchup-heading">Explore More</h2>
        <loading v-if="isLoading"></loading>
        <div v-else class="matchup-container">
            <div @click="goToGame()">
                <game-nav v-if="gameId" :gameId="gameId" :showMenu="false" />
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
                    <!-- <div class="info-row">
                        <combo-box :character="character" />
                        <match-box :character="character" />
                    </div>
                    <featured-player-box :character="character" /> -->
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
export default {
    name: 'MoreMatchupInfo',

    components: {
        'matchup-box': MatchupBox,

        'game-nav': GameNav,
        loading: Loading,
        'character-move-list': CharacterMoveList,
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
.more-matchup-info .column-container {
    display: flex;
    justify-content: space-between;
}

.more-matchup-info h2 {
    color: #fff;
    font-size: 25px;
}

.more-matchup-info h2.matchup-heading {
    margin-bottom: 30px;
    font-size: 20px;
}

.more-matchup-info .game-nav {
    width: 100%;
}

.more-matchup-info .info-row {
    display: flex;
}

.more-matchup-info .matchup-box {
    background: #4447e2;
    border: 2px solid #4447e2;
}

.more-matchup-info .character-column:nth-child(2) .matchup-box {
    background: #3eb489;
    border: 2px solid #3eb489;
}

.more-matchup-info .move-comparison-button {
    background: #db8c10;
    text-align: center;
    padding: 25px 10px;
}

.more-matchup-info .drop-down-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.more-matchup-info .drop-down-container .character-move-list {
    max-width: 49%;
    width: 100%;
}

.more-matchup-info .drop-down-container .character-move-list:first-child table {
    margin: 10px 0 auto auto;
}
</style>
