<!-- @format -->
<template>
    <div v-if="characters.length" class="explore-characters">
        <div class="select-header">
            <h2>Character Select</h2>
            <span class="select-count">{{ characters.length }}</span>
        </div>
        <div class="characters">
            <div
                v-for="character in characters"
                :key="character.id"
                v-tooltip="character.name"
                class="character"
                @click="navigate(character)"
            >
                <img :src="character.imageUrl" :alt="character.name" />
                <span class="character-sheen"></span>
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import { characterPathSegment } from '@/utils/game-character-routes';

export default {
    name: 'ExploreCharacter',
    components: {},

    props: {
        gameId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            characters: [],
        };
    },
    mounted() {
        this.getCharacters();
    },

    methods: {
        async getCharacters() {
            var searchQuery = [
                {
                    queryName: 'GameId',
                    queryValue: this.gameId,
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
        },

        navigate(character) {
            var seg = characterPathSegment(character);
            if (seg) {
                this.$router.push(`/character/${encodeURIComponent(seg)}`);
            }
        },
    },
};
</script>

<style>
.explore-characters {
    margin: 40px 0;
}

.explore-characters .select-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ffffff14;
}

.explore-characters .select-header h2 {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 22px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
}

.explore-characters .select-count {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 13px;
    line-height: 1;
    letter-spacing: 0.08em;
    color: #06231a;
    background: #3eb489;
    padding: 4px 10px;
    transform: skewX(-8deg);
}

.explore-characters .characters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-start;
}

/* Angled roster cells, the way a fighting-game select screen slants its
   portrait grid. The tile is skewed and the portrait counter-skewed, so
   the art itself stays upright. */
.explore-characters .characters .character {
    position: relative;
    width: 84px;
    height: 84px;
    overflow: hidden;
    cursor: pointer;
    background: #0e1018;
    border: 1px solid #ffffff26;
    transform: skewX(-8deg);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.explore-characters .characters .character img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    /* Counter-skew, then scale to cover the corners the skew exposes. */
    transform: skewX(8deg) scale(1.22);
    filter: saturate(0.85) brightness(0.86);
    transition: filter 0.15s ease, transform 0.2s ease;
}

/* Diagonal highlight that sweeps across on hover. */
.explore-characters .characters .character .character-sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, #ffffff00 40%, #ffffff1f 62%, #ffffff00 78%);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
}

.explore-characters .characters .character:hover {
    border-color: #3eb489;
    box-shadow: 0 0 0 1px #3eb489, 0 8px 20px rgba(0, 0, 0, 0.45);
    transform: skewX(-8deg) translateY(-3px);
}

.explore-characters .characters .character:hover img {
    filter: saturate(1.05) brightness(1.05);
    transform: skewX(8deg) scale(1.3);
}

.explore-characters .characters .character:hover .character-sheen {
    opacity: 1;
}

.mobile .explore-characters .characters {
    justify-content: center;
    gap: 5px;
}

.mobile .explore-characters .characters .character {
    width: 64px;
    height: 64px;
}

.mobile .explore-characters .select-header h2 {
    font-size: 18px;
}
</style>
