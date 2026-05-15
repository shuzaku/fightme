<!-- @format -->
<template>
    <div
        v-if="character"
        class="character-bubble"
        :style="trendingStyle"
        @click="navigateToCharacter()"
    >
        <h2 class="character-name">{{ character.name }}</h2>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import { characterPagePath } from '@/utils/game-character-routes';

export default {
    name: 'CharacterBubble',
    components: {},

    props: {
        characterId: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            character: null,
            characterGameLike: null,
        };
    },
    computed: {
        trendingStyle() {
            return {
                'background-image': `url(${this.character.imageUrl})`,
                'background-size': '40%',
                'background-repeat': 'no-repeat',
                'background-position': '0% 30%'
            };
        }
    },
    mounted() {
        this.getCharacter();
    },

    methods: {
        async getCharacter() {
            const response = await CharactersService.getCharacter({
                id: this.characterId
            });
            var row = response.data.characters && response.data.characters[0];
            if (!row) {
                return;
            }
            this.character = {
                id: row._id,
                name: row.Name,
                imageUrl: row.AvatarUrl,
                slug: row.Slug || null,
            };
            this.characterGameLike =
                row.Game && row.Game[0] ? { Abbreviation: row.Game[0].Abbreviation } : null;
        },

        navigateToCharacter() {
            var path = characterPagePath(this.characterGameLike, this.character);
            if (path) {
                this.$router.push(path);
            }
        }
    }
};
</script>

<style>
.character-bubble {
    height: 60px;
    background: #fff;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    border-radius: 25px;
    margin-top: 20px;
    cursor: pointer;
}

.character-bubble h2.character-name {
    font-size: 22px;
    color: #3eb489;
    font-family: 'Roboto';
    font-weight: 600;
}
</style>
