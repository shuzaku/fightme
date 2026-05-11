<!-- @format -->
<template>
    <div ref="videoViewRef" class="character-view">
        <loading v-if="loading"></loading>
        <div v-else class="character-container">
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
                id: this.characterId,
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

        characterSlug: function () {
            return this.$route.params.slug;
        },
    },

    watch: {
        characterId() {
            this.getCharacter();
        },
    },

    mounted() {
        if (this.characterId) {
            this.getCharacter();
        } else {
            this.getCharacterBySlug();
        }
    },

    beforeDestroy() {},

    methods: {
        async getCharacter() {
            this.loading = true;
            this.selectedVideoType = 'Online Matches';
            const response = await CharactersService.getCharacter({
                id: this.characterId,
            });
            this.character = this.hydrateCharacter(response.data.characters[0]);
            this.loading = false;
        },

        async getCharacterBySlug() {
            this.loading = true;

            const response = await CharactersService.getCharacterBySlug({
                slug: this.characterSlug.toUpperCase(),
            });
            this.character = this.hydrateCharacter(response.data.characters[0]);
            this.loading = false;
        },

        hydrateCharacter(response) {
            setOgMeta({
                title: `${response.Name} matches`,
                description: `Watch every indexed match and combo clip featuring ${response.Name} on Fighters Edge. Filter by opponent, player, and tournament.`,
                imageUrl: characterOgUrl(response._id),
                pageUrl: `https://fighters-edge.com/character/${response._id}`,
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
