<!-- @format -->
<template>
    <div class="character-matchup-percentage">
        <h2>Matchup</h2>
        <p>{{ matchupValue }} : {{ opposingMatchupValue }}</p>
        <p class="disclaimer">
            *Info pulled from <a href="http://ratingupdate.info/">ratingupdate</a> once a day.
        </p>
    </div>
</template>

<script>
import CharacterMatchupService from '@/services/character-matchup-service';

export default {
    name: 'CharacterMatchupPercentage',
    props: {
        characterId: {
            type: String,
            default: null,
        },
        opposingCharacterId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            matchupValue: null,
        };
    },

    computed: {
        opposingMatchupValue() {
            return 100 - this.matchupValue;
        },
    },

    mounted() {
        this.getMatchup();
    },

    methods: {
        async getMatchup() {
            var searchQuery = [
                {
                    characters: {
                        characterId: this.characterId,
                        opposingCharacterId: this.opposingCharacterId,
                    },
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await CharacterMatchupService.queryCharacterMatchup(queryParameter);
            this.matchupValue = parseInt(response.data.matchups[0].Value.slice(0, -1));
        },
    },
};
</script>

<style type="text/css">
.character-matchup-percentage {
    text-align: center;
    width: 100%;
    background: #1c1c24;
    padding: 10px 0 15px;
    position: relative;
}

.character-matchup-percentage h2 {
    margin-bottom: 10px;
}

.character-matchup-percentage p {
    font-size: 20px;
    color: #fff;
}
.character-matchup-percentage p.disclaimer {
    font-size: 10px;
    font-style: italic;
    display: block;
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 100%;
    text-align: right;
}

.character-matchup-percentage p.disclaimer a {
    color: #fff;
}
</style>
