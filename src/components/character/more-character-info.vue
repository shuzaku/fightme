<!-- @format -->
<template>
    <div class="more-character-info">
        <h2 class="character-heading">Explore More</h2>
        <loading v-if="isLoading"></loading>
        <div v-else class="character-container">
            <div class="column-container">
                <character-moves :characterId="characterId" />
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import CharacterMoves from '@/components/character/character-moves';
import Loading from '@/components/common/loading';

export default {
    name: 'MorecharacterInfo',

    components: {
        loading: Loading,
        'character-moves': CharacterMoves,
    },

    data() {
        return {
            gameId: null,
            isLoading: false,
            character: null,
        };
    },

    computed: {
        characterId: function () {
            return this.$route.params.id;
        },
    },

    watch: {},

    mounted() {
        this.getCharacter();
    },

    methods: {
        async getCharacter() {
            this.isLoading = true;
            const response = await CharactersService.getCharacter({
                id: this.characterId,
            });

            this.character = this.hydrateCharacter(response.data.characters[0]);
            this.isLoading = false;
        },

        hydrateCharacter(response) {
            return {
                name: response.Name,
                imageUrl: response.AvatarUrl,
                gameId: response.GameId,
            };
        },

        goToGame() {
            this.$router.push(`/game/${this.gameId}`);
        },
    },
};
</script>

<style type="text/css">
.more-character-info .column-container {
    display: flex;
    justify-content: space-between;
}

.more-character-info h2 {
    color: #fff;
    font-size: 25px;
}

.more-character-info h2.character-heading {
    margin-bottom: 30px;
    font-size: 20px;
}

.more-character-info .game-nav {
    width: 100%;
}

.more-character-info .info-row {
    display: flex;
}

.more-character-info .character-box {
    background: #4447e2;
    border: 2px solid #4447e2;
}

.more-character-info .character-column:nth-child(2) .character-box {
    background: #3eb489;
    border: 2px solid #3eb489;
}
</style>
