<!-- @format -->
<template>
    <v-card class="mx-auto navigation" height="300" width="330">
        <v-navigation-drawer dark permanent width="100%">
            <v-row class="fill-height" no-gutters>
                <v-navigation-drawer dark mini-variant mini-variant-width="56" permanent>
                    <v-list-item class="px-2 logo">
                        <v-list-item-avatar>
                            <v-img
                                src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                            >
                            </v-img>
                        </v-list-item-avatar>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-list dense nav>
                        <v-list-item
                            v-for="item in mainItems"
                            :key="item.title"
                            @click="updateMain(item)"
                        >
                            <div v-if="item.hasAccess" class="item-container">
                                <v-list-item-action>
                                    <v-icon>{{ item.icon }}</v-icon>
                                </v-list-item-action>
                            </div>
                        </v-list-item>
                    </v-list>
                    <div class="account">
                        <v-icon @click="updateMain({ title: 'Account' })">mdi-account</v-icon>
                    </div>
                </v-navigation-drawer>

                <v-list>
                    <general-search />
                    <div v-if="selectedMain.title === 'Videos'" class="video-nav inner-list ">
                        <h2>Videos</h2>
                        <game-select-menu-item initialOpen @game-selected="updateGame($event)" />
                        <player-select-menu-item @player-selected="updatePlayer($event)" />
                    </div>
                    <div v-if="selectedMain.title === 'Combos'" class="combo-nav inner-list ">
                        <h2>Combos</h2>
                        <game-select-menu-item initialOpen @game-selected="updateGame($event)" />
                        <character-select-menu-item
                            v-if="selectedGame"
                            :gameId="selectedGame.id"
                            @character-selected="updateCharacter($event)"
                        />
                    </div>
                    <div v-if="selectedMain.title === 'Matches'" class="match-nav inner-list">
                        <h2>Matches</h2>
                        <game-select-menu-item initialOpen @game-selected="searchGame($event)" />
                        <character-select-menu-item
                            v-if="selectedGame"
                            :gameId="selectedGame.id"
                            @character-selected="searchCharacter($event)"
                        />
                    </div>
                    <div v-if="selectedMain.title === 'Games'" class="game-nav inner-list">
                        <h2>Games</h2>
                        <game-select-menu-item initialOpen @game-selected="updateGame($event)" />
                        <character-select-menu-item
                            v-if="selectedGame"
                            :gameId="selectedGame.id"
                            @character-selected="updateCharacter($event)"
                        />
                    </div>
                    <div
                        v-if="selectedMain.title === 'Favorites' && account"
                        class="favorite-nav inner-list"
                    >
                        <h2>Favorites</h2>
                        <div class="menu-item" @click="goToFavoriteMatch()">
                            Matches
                        </div>
                        <div class="menu-item" @click="goToFavoriteCombo()">
                            Combos
                        </div>
                    </div>
                    <div
                        v-if="selectedMain.title === 'Add' && account"
                        class="favorite-nav inner-list"
                    >
                        <h2>Add</h2>
                        <ul>
                            <li
                                v-for="create in createOptions"
                                :key="create.value"
                                class="menu-item"
                                @click="openCreateWidget(create.value)"
                            >
                                {{ create.name }}
                            </li>
                        </ul>
                    </div>
                    <div
                        v-if="selectedMain.title === 'Collections' && account"
                        class="favorite-nav inner-list"
                    >
                        <h2>Collections</h2>
                        <div class="menu-heading">
                            <collection-select-menu-item :account="account" />
                        </div>
                    </div>

                    <div
                        v-if="selectedMain.title === 'Collections' && account"
                        class="collection-nav inner-list"
                    >
                        <h2>Collections</h2>
                        <div class="menu-heading">
                            <collection-select-menu-item :account="account" />
                        </div>
                    </div>

                    <div v-if="selectedMain.title === 'Character'" class="character-nav inner-list">
                        <character-select-menu-item
                            v-model="selectedCharacterId"
                            :gameId="selectedGame.id"
                            @gameUpdate="updateGameId($event)"
                            @character-selected="updateCharacter($event)"
                        />
                        <character-select-menu-item
                            ref="matchupSelect"
                            :title="'Matchup'"
                            :gameId="selectedGame.id"
                            @character-selected="setMatchup($event)"
                        />
                        <div class="menu-item" @click="emitMatch()">
                            Matches
                        </div>
                        <div class="menu-item" @click="emitCombo()">
                            Combos
                        </div>
                    </div>

                    <div v-if="selectedMain.title === 'Account'" class="account-nav inner-list">
                        <h2>Account</h2>
                        <user :account="account" />
                    </div>
                </v-list>
            </v-row>
        </v-navigation-drawer>
    </v-card>
</template>

<script>
import GameSelectMenuItem from '@/components/games/game-select-menu-item';
import PlayerSelectMenuItem from '@/components/players/player-select-menu-item';
import CharacterSelectMenuItem from '@/components/character/character-select-menu-item';
import CollectionSelectMenuItem from '@/components/collection/collection-select-menu-item';
import GeneralSearch from '@/components/common/general-search';
import User from '@/components/account/user';
import { eventbus } from '@/main';

export default {
    components: {
        'game-select-menu-item': GameSelectMenuItem,
        'player-select-menu-item': PlayerSelectMenuItem,
        'character-select-menu-item': CharacterSelectMenuItem,
        'collection-select-menu-item': CollectionSelectMenuItem,
        'general-search': GeneralSearch,
        user: User
    },

    props: {
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            mini: true,
            selectedMain: { title: 'Videos', icon: 'mdi-video' },
            selectedGame: {
                id: null
            },
            selectedCharacterId: null,
            createOptions: [
                {
                    name: 'Video',
                    value: 'video'
                },
                {
                    name: 'Game',
                    value: 'game'
                },
                {
                    name: 'Player',
                    value: 'player'
                },
                {
                    name: 'Creator',
                    value: 'creator'
                },
                {
                    name: 'Character',
                    value: 'character'
                },
                {
                    name: 'Tournament',
                    value: 'tournament'
                }
            ]
        };
    },

    computed: {
        routeName: function() {
            return this.$route.name;
        },
        routeValue: function() {
            return this.$route.params.id;
        },
        mainItems: function() {
            return [
                { title: 'Videos', icon: 'mdi-video', hasAccess: true },
                { title: 'Combos', icon: 'mdi-mixed-martial-arts', hasAccess: true },
                { title: 'Matches', icon: 'mdi-kabaddi', hasAccess: true },
                { title: 'Games', icon: 'mdi-gamepad-square', hasAccess: true },
                { title: 'Favorites', icon: 'mdi-heart', hasAccess: this.hasAccount },
                { title: 'Add', icon: 'mdi-plus', hasAccess: this.isAdmin },
                {
                    title: 'Collections',
                    icon: 'mdi-book-variant-multiple',
                    hasAccess: this.hasAccount
                }
            ];
        },

        hasAccount: function() {
            return this.account ? true : false;
        },

        isAdmin: function() {
            if (this.hasAccount && this.account.role === 'Admin User') {
                return true;
            } else {
                return false;
            }
        }
    },

    watch: {
        selectedMain() {
            if (this.selectedMain.title === 'Videos') {
                this.$router.push(`/`);
            }
            if (this.selectedMain.title === 'Matches') {
                this.$router.push(`/matches/`);
            }

            if (this.selectedMain.title === 'Combos') {
                this.$router.push(`/combos/`);
            }

            if (this.selectedMain.title === 'Collections') {
                this.$router.push(`/collections/`);
            }
        },

        routeName() {
            if (this.routeName === 'Character') {
                this.selectedMain = { title: 'Character', icon: 'mdi-human-handsup' };
            }
        },

        routeValue() {
            this.selectedCharacterId = this.routeValue;
        }
    },

    created() {
        if (this.routeName === 'Character') {
            this.selectedMain = { title: 'Character', icon: 'mdi-human-handsup' };
            this.selectedCharacterId = this.$route.params.id;
        }
    },

    methods: {
        updateMain(item) {
            this.selectedMain = item;
        },

        updateGame(game) {
            var searchQuery = {
                type: 'Game',
                value: game.id
            };
            this.selectedGame = game;
            this.setSearch(searchQuery);
        },

        updateGameId(game) {
            this.selectedGame = { id: game.gameId };
        },

        updatePlayer(player) {
            var searchQuery = {
                type: 'Player',
                value: player.id
            };
            this.setSearch(searchQuery);
        },

        updateCharacter(character) {
            var searchQuery = {
                type: 'Character',
                value: character.id
            };
            this.setSearch(searchQuery);
        },

        setSearch(searchQuery) {
            var query = {
                name: searchQuery.type,
                value: searchQuery.value
            };

            this.$router.push(`/${query.name}/${query.value}`);
        },

        searchGame(game) {
            this.selectedGame = game;
            eventbus.$emit('filter', { queryName: 'GameId', queryValue: game.id });
        },

        searchCharacter(character) {
            eventbus.$emit('filter', { queryName: 'CharacterId', queryValue: character.id });
        },

        goToFavoriteMatch() {
            this.$router.push(`/favorite-matches/`);
        },

        goToFavoriteCombo() {
            this.$router.push(`/favorite-combos/`);
        },

        openCreateWidget(createType) {
            eventbus.$emit('open:widget', {
                name: createType
            });
        },

        openLoginWidget() {
            eventbus.$emit('open:widget', {
                name: 'login'
            });
        },

        openRegisterWidget() {
            eventbus.$emit('open:widget', {
                name: 'register'
            });
        },

        emitMatch() {
            this.$refs.matchupSelect.clearCharater();
            eventbus.$emit('character-filter', 'Match');
        },

        emitCombo() {
            this.$refs.matchupSelect.clearCharater();
            eventbus.$emit('character-filter', 'Combo');
        },

        setMatchup(character) {
            eventbus.$emit('matchup-filter', {
                character1: this.selectedCharacterId,
                character2: character.id
            });
        }
    }
};
</script>

<style>
.navigation {
    height: 110vh !important;
    position: fixed !important;
}

.navigation .v-navigation-drawer {
    border-radius: 0 !important;
    background: #444;
}

.navigation .logo.v-list-item {
    padding: 0 5px;
}

.navigation .v-list {
    width: 235px;
}

.navigation .menu-item {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3eb489;
    margin-bottom: 20px;
    line-height: 1.2em;
    font-weight: 300;
    text-decoration: none;
    display: flex;
    align-items: center;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
}

.navigation .inner-list {
    padding: 0px 20px;
    width: 270px;
    height: 100vh;
}

.navigation .favorite a {
    border: 0;
    text-decoration: none;
}

.navigation .game-nav {
    align-items: flex-start;
    display: block;
}

.navigation .v-navigation-drawer__content {
    overflow-y: hidden;
}

.navigation .inner-list h2 {
    margin-bottom: 20px;
}

.navigation .account {
    padding: 0 16px;
}

.navigation .v-navigation-drawer__content {
    height: 100vh;
}

.navigation .account {
    position: absolute;
    bottom: 20px;
}
</style>
