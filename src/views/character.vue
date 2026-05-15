<!-- @format -->
<template>
    <div ref="videoViewRef" class="character-view">
        <loading v-if="loading"></loading>
        <div v-else-if="character && character.id" class="character-container">
            <character-nav
                :character="character"
                :characterSlug="characterSlug"
                :account="account"
                :selectedVideoType="selectedVideoType"
                @selected-video="selectVideoType($event)"
            />
            <character-overview
                :character="character"
                :selectedVideoType="selectedVideoType"
                :character2Id="character2Id"
                @character2Id:update="setCharacter2Id($event)"
            />
            <character-videos
                id="character-videos"
                :selectedVideoType="selectedVideoType"
                :characterId="character.id"
                :account="account"
                :character2Id="character2Id"
            />
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import { setOgMeta, characterOgUrl } from '@/services/og-meta-service';
import {
    resolveGameIdFromRouteParam,
    characterApiRowMatchesRouteKey,
    MONGO_OBJECT_ID_RE,
} from '@/utils/game-character-routes';

import CharacterNav from '@/components/character/character-nav';
import Loading from '@/components/common/loading';
import CharacterOverview from '@/components/character/character-overview';
import CharacterVideos from '@/components/character/character-videos';

export default {
    name: 'Character',

    components: {
        'character-nav': CharacterNav,
        'character-overview': CharacterOverview,
        'character-videos': CharacterVideos,

        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            loading: true,
            character: {
                id: null,
                name: null,
                imageUrl: null,
                gameId: null,
                featuredPlayers: null,
            },
            selectedVideoType: 'Online Matches',
            character2Id: [],
        };
    },

    computed: {
        characterId: function () {
            return this.$route.params.id;
        },

        characterGameKey: function () {
            return this.$route.params.gameKey;
        },

        characterSlugRouteKey: function () {
            return this.$route.params.characterKey;
        },

        characterSlug: function () {
            return this.$route.params.slug;
        },
    },

    watch: {
        characterId() {
            if (this.characterGameKey) {
                return;
            }
            if (this.characterId) {
                if (MONGO_OBJECT_ID_RE.test(this.characterId)) {
                    this.getCharacter();
                } else {
                    this.getCharacterBySlugValue(this.characterId);
                }
            }
        },
        characterGameKey() {
            if (this.characterGameKey && this.characterSlugRouteKey) {
                this.getCharacterByGameAndKey();
            }
        },
        characterSlugRouteKey() {
            if (this.characterGameKey && this.characterSlugRouteKey) {
                this.getCharacterByGameAndKey();
            }
        },
    },

    mounted() {
        if (this.characterGameKey && this.characterSlugRouteKey) {
            this.getCharacterByGameAndKey();
        } else if (this.characterId) {
            if (MONGO_OBJECT_ID_RE.test(this.characterId)) {
                this.getCharacter();
            } else {
                this.getCharacterBySlugValue(this.characterId);
            }
        } else {
            this.getCharacterBySlug();
        }
    },

    beforeDestroy() {},

    methods: {
        async getCharacterByGameAndKey() {
            this.loading = true;
            this.selectedVideoType = 'Online Matches';
            var gameId = await resolveGameIdFromRouteParam(this.$route.params.gameKey);
            if (!gameId) {
                this.loading = false;
                return;
            }
            var key = this.$route.params.characterKey;
            const response = await CharactersService.queryCharacters({
                searchQuery: [
                    {
                        queryName: 'GameId',
                        queryValue: gameId,
                    },
                ],
            });
            var rows = response.data.characters || [];
            var found = rows.find(function (c) {
                return characterApiRowMatchesRouteKey(c, key);
            });
            if (!found) {
                this.loading = false;
                return;
            }
            const fullResponse = await CharactersService.getCharacter({ id: found._id });
            var fullRow = fullResponse.data.characters && fullResponse.data.characters[0];
            if (fullRow) {
                this.character = this.hydrateCharacter(fullRow);
            }
            this.loading = false;
        },

        async getCharacter() {
            this.loading = true;
            this.selectedVideoType = 'Online Matches';
            const response = await CharactersService.getCharacter({
                id: this.characterId,
            });
            var row = response.data.characters && response.data.characters[0];
            if (row) {
                this.character = this.hydrateCharacter(row);
            }
            this.loading = false;
        },

        async getCharacterBySlug() {
            this.loading = true;
            const response = await CharactersService.getCharacterBySlug({
                slug: this.characterSlug.toLowerCase(),
            });
            var row = response.data.characters && response.data.characters[0];
            if (row) {
                this.character = this.hydrateCharacter(row);
            }
            this.loading = false;
        },

        async getCharacterBySlugValue(slug) {
            this.loading = true;
            if (!slug) {
                this.loading = false;
                return;
            }
            // Slugs are stored lowercase in the DB (e.g. "sf6_jamie")
            const response = await CharactersService.getCharacterBySlug({
                slug: String(slug).toLowerCase(),
            });
            var found = response.data.characters && response.data.characters[0];
            if (found) {
                this.character = this.hydrateCharacter(found);
                this.loading = false;
                return;
            }
            // Fallback: query by slug field then name-match client-side
            try {
                const fallback = await CharactersService.queryCharacters({
                    searchQuery: [{ queryName: 'Slug', queryValue: String(slug).toLowerCase() }],
                });
                var rows = fallback.data.characters || [];
                var match = rows.find((c) => characterApiRowMatchesRouteKey(c, slug));
                if (match) {
                    const full = await CharactersService.getCharacter({ id: match._id });
                    var row = full.data.characters && full.data.characters[0];
                    if (row) {
                        this.character = this.hydrateCharacter(row);
                    }
                }
            } catch (e) {
                // leave character in default state
            }
            this.loading = false;
        },

        hydrateCharacter(response) {
            var path = this.$route.path.split('?')[0];
            setOgMeta({
                title: `${response.Name} matches`,
                description: `Watch every indexed match and combo clip featuring ${response.Name} on Fighters Edge. Filter by opponent, player, and tournament.`,
                imageUrl: characterOgUrl(response._id),
                pageUrl: `https://fighters-edge.com${path}`,
            });
            return {
                id: response._id,
                name: response.Name,
                imageUrl: response.AvatarUrl,
                gameId: response.GameId,
                players: this.hydratePlayer(response.Players),
                archetype: response.Archetype,
                pickRate: response.PickRate,
                winRate: response.WinRate,
                tier: response.Tier,
                difficulty: response.Ease,
                gameplan: response.Gameplan,
                strengths: response.Strengths,
                weaknesses: response.Weakness,
                overViewUrl: response.OverviewUrl,
                ease: response.Ease,
                wikiUrl: response.Wiki,
                discordLink: response.DiscordLink,
            };
        },

        hydratePlayer(featuredPlayers) {
            if (!featuredPlayers || !featuredPlayers.length) {
                return [];
            }
            return featuredPlayers.map((player) => {
                return {
                    name: player.Name,
                    id: player._id,
                };
            });
        },

        selectVideoType(selectedVideo) {
            this.selectedVideoType = selectedVideo;
            this.$nextTick(() => {
                const element = document.getElementById('character-videos');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },

        setCharacter2Id(character2Id) {
            this.character2Id = [character2Id];
        },
    },
};
</script>

<style>
.character-view {
    position: relative;
    padding: 200px 20px;
    height: 100%;
    overflow: visible;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
}

.character-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.character-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.character-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.character-view .character-container {
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
}

.character-view .videos-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.character-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
