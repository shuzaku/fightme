<!-- @format -->
<template>
    <div class="more-matchup-info">
        <h2 class="matchup-heading">Explore More</h2>
        <loading v-if="isLoading"></loading>
        <div v-else class="matchup-container">
            <game-nav :gameId="characters[0].gameId" :showMenu="false" />

            <div class="column-container">
                <div class="character-column" v-for="character in characters" :key="character.id">
                    <matchup-box :character="character" />
                    <!-- <div class="info-row">
                        <combo-box :character="character" />
                        <match-box :character="character" />
                    </div>
                    <featured-player-box :character="character" /> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import MatchupBox from '@/components/matchup/matchup-box';
import ComboBox from '@/components/combo/combo-box';
import MatchBox from '@/components/match/match-box';
import FeaturedPlayerBox from '@/components/players/featured-player-box';
import GameNav from '@/components/games/game-nav';
import Loading from '@/components/common/loading';

export default {
    name: 'MoreMatchupInfo',

    components: {
        'matchup-box': MatchupBox,
        'match-box': MatchBox,
        'combo-box': ComboBox,
        'featured-player-box': FeaturedPlayerBox,
        'game-nav': GameNav,
        loading: Loading,
    },

    data() {
        return {
            character1Id: this.$route.params ? this.$route.params.id : null,
            character2Id: this.$route.params ? this.$route.params.id2 : null,
            characters: [],
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
</style>
