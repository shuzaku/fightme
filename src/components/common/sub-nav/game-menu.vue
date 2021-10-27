<!-- @format -->
<template>
    <div v-if="!isLoading" class="game-nav inner-list">
        <div v-if="!selectedGame">
            <h2>Games</h2>
            <game-select-menu-item
                ref="gameSelect"
                v-model="selectedGame"
                initialOpen
                title="Find Games"
                @game-selected="updateGame($event)"
            />
        </div>
        <div v-else>
            <div class="game-header">
                <img class="game-avatar" :src="selectedGame.avatarUrl" />
                <h2>{{ selectedGame.title }}</h2>
            </div>
            <v-btn v-if="!isFollowed" class="follow-btn" @click="followGame()">
                <v-icon>
                    mdi-heart
                </v-icon>
            </v-btn>
            <v-btn v-else class="unfollow-btn" @click="unfollowGame()">
                <v-icon> mdi-heart-outline </v-icon>
            </v-btn>
            <h3>Filter videos by...</h3>
            <div>
                <character-select-menu-item
                    v-if="selectedGame"
                    ref="characterSelect"
                    v-model="selectedCharacter"
                    :gameId="selectedGame.id"
                    @character-selected="updateCharacter($event)"
                />
            </div>
            <h3>Matches</h3>
            <h3>Combos</h3>
            <h3>Montages</h3>
            <h3>Top Players</h3>
            <div>Coming soon...</div>
        </div>
    </div>
</template>

<script>
import GameSelectMenuItem from '@/components/games/game-select-menu-item';
import CharacterSelectMenuItem from '@/components/character/character-select-menu-item';
import GamesService from '@/services/games-service';

import { eventbus } from '@/main';

export default {
    components: {
        'game-select-menu-item': GameSelectMenuItem,
        'character-select-menu-item': CharacterSelectMenuItem
    },

    props: {},

    data() {
        return {
            selectedGame: null,
            games: null,
            isFollowed: false,
            isLoading: false
        };
    },

    computed: {
        selectedGameId() {
            if (this.$route.params && this.$route.params.id) {
                return this.$route.params.id;
            } else {
                return null;
            }
        }
    },

    watch: {
        selectedGameId() {
            this.getGames();
        }
    },

    created() {
        eventbus.$on('account:update', this.isGameFollowed);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isGameFollowed);
    },

    mounted() {
        this.getGames();
    },

    methods: {
        async getGames() {
            this.isLoading = true;
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map(game => {
                return {
                    id: game._id,
                    title: game.Title,
                    avatarUrl: game.LogoUrl
                };
            });

            this.setActiveGame();
            this.isLoading = false;
        },

        setActiveGame() {
            if (this.$route.params && this.$route.params.id) {
                this.selectedGame = this.games.filter(game => {
                    return game.id === this.$route.params.id;
                })[0];
            }
            this.isGameFollowed();
        },

        isGameFollowed() {
            this.isFollowed = this.$attrs.account.followedGames.some(
                game => game.id === this.selectedGame.id
            );
        },

        updateCharacter(character) {
            var searchQuery = {
                type: 'Character',
                value: character.id
            };
            this.$emit('set-search', searchQuery);
        },

        matchupGameFilter(game) {
            var queryParams = {
                queryName: 'GameMatchupGameId',
                queryValue: game.id
            };

            eventbus.$emit('game-filter', queryParams);
        },

        collapseSelect() {
            this.$refs.gameSelect.collapse();
            this.$refs.gameMatchupSelect.collapse();
            this.$refs.gameSelect.collapse();
        },

        followGame() {
            eventbus.$emit('game:follow', this.selectedGame);
        },

        unfollowGame() {
            eventbus.$emit('game:unfollow', this.selectedGame);
        }
    }
};
</script>

<style>
.game-nav .follow-btn,
.game-nav .unfollow-btn {
    min-width: 30px;
    padding: 0 5px;
    width: 100%;
    margin: 15px 0;
}

.game-nav .follow-btn .v-icon {
    font-size: 20px;
}

.game-nav .game-header {
    display: flex;
    align-items: center;
}

.game-nav.inner-list .game-header h2 {
    margin-bottom: 0;
}

.game-nav.inner-list .game-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #3eb489;
    background: #fff;
    margin-right: 10px;
}
</style>
