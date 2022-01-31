<!-- @format -->
<template>
    <div class="player-nav inner-list">
        <div v-if="!selectedPlayer">
            <h2>Players</h2>
            <player-select-menu-item
                ref="playerSelect"
                v-model="selectedPlayer"
                initialOpen
                title="Find Players"
                @player-selected="updatePlayer($event)"
            />
        </div>
        <div v-else>
            <div class="player-header">
                <h2>{{ selectedPlayer.name }}</h2>
                <div v-if="account" class="followed-container">
                    <v-btn v-if="!isFollowed" class="follow-btn" @click="followPlayer()">
                        <v-icon> mdi-heart </v-icon>
                    </v-btn>
                    <v-btn v-else class="unfollow-btn" @click="unfollowPlayer()">
                        <v-icon> mdi-heart-outline </v-icon>
                    </v-btn>
                </div>
            </div>
            <h3>Filter videos by...</h3>
            <div>
                <game-select-menu-item
                    ref="gameSelect"
                    @selectExpand="collapseSelect()"
                    @game-selected="gameQuery($event)"
                />
            </div>
            <div>
                <character-select-menu-item
                    ref="characterSelect"
                    :gameId="'all'"
                    @selectExpand="collapseSelect()"
                    @character-selected="characterQuery($event)"
                />
            </div>
            <div>
                <character-select-menu-item
                    ref="characterMatchupSelect"
                    :title="'Matchup'"
                    :gameId="'all'"
                    @selectExpand="collapseSelect()"
                    @character-selected="matchupCharacterQuery($event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import PlayerSelectMenuItem from '@/components/players/player-select-menu-item';
import PlayersService from '@/services/players-service';
import GameSelectMenuItem from '@/components/games/game-select-menu-item';
import CharacterSelectMenuItem from '@/components/character/character-select-menu-item';

import { eventbus } from '@/main';

export default {
    components: {
        'player-select-menu-item': PlayerSelectMenuItem,
        'game-select-menu-item': GameSelectMenuItem,
        'character-select-menu-item': CharacterSelectMenuItem,
    },

    data() {
        return {
            selectedPlayer: null,
            players: null,
            isFollowed: false,
        };
    },

    computed: {
        selectedPlayerId() {
            if (this.$route.params && this.$route.params.id) {
                return this.$route.params.id;
            } else {
                return null;
            }
        },
    },

    mounted() {
        this.getPlayers();
    },

    created() {
        eventbus.$on('account:update', this.isPlayerFollowed);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isPlayerFollowed);
    },

    methods: {
        async getPlayers() {
            this.isLoading = true;
            const response = await PlayersService.fetchPlayers();
            this.players = response.data.players.map((player) => {
                return {
                    id: player._id,
                    name: player.Name,
                    selected: false,
                };
            });

            this.setActivePlayer();
            this.isLoading = false;
        },

        setActivePlayer() {
            if (this.$route.params && this.$route.params.id) {
                this.selectedPlayer = this.players.filter((player) => {
                    return player.id === this.$route.params.id;
                })[0];
            }

            if (this.account.id) {
                this.isPlayerFollowed();
            }
        },

        isPlayerFollowed() {
            this.isFollowed = this.$attrs.account.followedPlayers.some(
                (player) => player.id === this.selectedPlayer.id
            );
        },

        updatePlayer(player) {
            var searchQuery = {
                type: 'Player',
                value: player.id,
            };
            this.$refs.playerSelect.collapse();
            this.selectedPlayer = player;
            this.$emit('set-search', searchQuery);
        },

        gameQuery(game) {
            var queryParams = {
                queryName: 'GameId',
                queryValue: game.id,
            };

            eventbus.$emit('player-filter', queryParams);
        },

        characterQuery(character) {
            var queryParams = {
                queryName: 'CharacterId',
                queryValue: character.id,
            };

            eventbus.$emit('player-filter', queryParams);
        },

        matchupCharacterQuery(character) {
            var queryParams = {
                queryName: 'PlayerMatchupCharacterId',
                queryValue: character.id,
            };

            eventbus.$emit('player-filter', queryParams);
        },

        collapseSelect() {
            this.$refs.characterSelect.collapse();
            this.$refs.characterMatchupSelect.collapse();
            this.$refs.gameSelect.collapse();
        },

        followPlayer() {
            eventbus.$emit('player:follow', this.selectedPlayer);
        },

        unfollowPlayer() {
            eventbus.$emit('player:unfollow', this.selectedPlayer);
        },
    },
};
</script>

<style>
.player-nav .player-header button.v-btn {
    min-width: 30px;
    padding: 0 10px;
}
.player-nav .player-header button .v-icon {
    font-size: 20px;
}

.player-nav .player-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
}

.player-nav.inner-list .player-header h2 {
    margin-bottom: 0;
}
</style>
