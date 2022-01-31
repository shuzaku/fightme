<!-- @format -->
<template>
    <div v-if="!isLoading" class="character-nav inner-list">
        <div v-if="!selectedCharacter">
            <h2>Characters</h2>
            <character-select-menu-item
                ref="characterSelect"
                v-model="selectedCharacter"
                initialOpen
                title="Find Characters"
                @character-selected="updateCharacter($event)"
            />
        </div>
        <div v-else>
            <div class="character-header">
                <img class="character-avatar" :src="selectedCharacter.avatarUrl" />
                <h2>{{ selectedCharacter.name }}</h2>
            </div>
            <v-btn v-if="!isFollowed" class="follow-btn" @click="followCharacter()">
                <v-icon> mdi-heart </v-icon>
            </v-btn>
            <v-btn v-else class="unfollow-btn" @click="unfollowCharacter()">
                <v-icon> mdi-heart-outline </v-icon>
            </v-btn>
            <h3>Filter videos by...</h3>
            <div>
                <character-select-menu-item
                    ref="characterMatchupSelect"
                    v-model="selectedCharacter.id"
                    :title="'Matchup'"
                    :gameId="selectedCharacter.gameId"
                    @selectExpand="collapseSelect()"
                    @character-selected="matchupCharacterFilter($event)"
                />
            </div>
            <h3 @click="filterMatches()">Matches</h3>
            <h3 @click="filterCombos()">Combos</h3>
            <h3 @click="filterMontages()">Montages</h3>
            <!-- <h3>Top Players</h3>
            <div>Coming soon...</div> -->
        </div>
    </div>
</template>

<script>
import CharacterSelectMenuItem from '@/components/character/character-select-menu-item';
import CharactersService from '@/services/characters-service';

import { eventbus } from '@/main';

export default {
    components: {
        'character-select-menu-item': CharacterSelectMenuItem,
    },

    props: {},

    data() {
        return {
            selectedCharacter: null,
            characters: null,
            isFollowed: false,
            isLoading: false,
        };
    },

    computed: {
        selectedCharacterId() {
            if (this.$route.params && this.$route.params.id) {
                return this.$route.params.id;
            } else {
                return null;
            }
        },
    },

    watch: {
        selectedCharacterId() {
            this.getCharacters();
        },
    },

    created() {
        eventbus.$on('account:update', this.isCharacterFollowed);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isCharacterFollowed);
    },

    mounted() {
        this.getCharacters();
    },

    methods: {
        async getCharacters() {
            this.isLoading = true;
            const response = await CharactersService.fetchCharacters();
            this.characters = response.data.characters.map((character) => {
                return {
                    id: character._id,
                    name: character.Name,
                    gameId: character.GameId,
                    avatarUrl: character.AvatarUrl,
                };
            });

            this.setActiveCharacter();
            this.isLoading = false;
        },

        setActiveCharacter() {
            if (this.$route.params && this.$route.params.id) {
                this.selectedCharacter = this.characters.filter((character) => {
                    return character.id === this.$route.params.id;
                })[0];
            }
            if (this.account && this.account.id) {
                this.isCharacterFollowed();
            }
        },

        isCharacterFollowed() {
            this.isFollowed = this.$attrs.account.followedCharacters.some(
                (character) => character.id === this.selectedCharacter.id
            );
        },

        updateCharacter(character) {
            var searchQuery = {
                type: 'Character',
                value: character.id,
            };
            this.$refs.characterSelect.collapse();
            this.selectedCharacter = character;
            this.$emit('set-search', searchQuery);
        },

        matchupCharacterFilter(character) {
            var queryParams = {
                queryName: 'CharacterMatchupCharacterId',
                queryValue: character.id,
            };

            eventbus.$emit('character-query', queryParams);
        },

        filterMatches() {
            eventbus.$emit('character-filter', 'Match');
        },

        filterCombos() {
            eventbus.$emit('character-filter', 'Combo');
        },

        filterMontages() {
            eventbus.$emit('character-filter', 'Montage');
        },

        collapseSelect() {
            this.$refs.characterSelect.collapse();
            this.$refs.characterMatchupSelect.collapse();
            this.$refs.gameSelect.collapse();
        },

        followCharacter() {
            eventbus.$emit('character:follow', this.selectedCharacter);
        },

        unfollowCharacter() {
            eventbus.$emit('character:unfollow', this.selectedCharacter);
        },
    },
};
</script>

<style>
.character-nav .follow-btn,
.character-nav .unfollow-btn {
    min-width: 30px;
    padding: 0 5px;
    width: 100%;
    margin: 15px 0;
}

.character-nav .follow-btn .v-icon {
    font-size: 20px;
}

.character-nav .character-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.character-nav.inner-list .character-header h2 {
    margin-bottom: 0;
}

.character-nav.inner-list .character-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #3eb489;
    background: #fff;
}
</style>
