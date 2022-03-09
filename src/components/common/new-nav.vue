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
                    <!-- <explore-menu
                        v-if="selectedMain.title === 'Explore'"
                        @set-search="setSearch($event)"
                    /> -->
                    <video-menu
                        v-if="selectedMain.title === 'Videos'"
                        :account="account"
                        @set-search="setSearch($event)"
                    />
                    <combo-menu
                        v-if="selectedMain.title === 'Combos'"
                        @set-search="setSearch($event)"
                    />
                    <match-menu
                        v-if="selectedMain.title === 'Matches'"
                        @set-search="setSearch($event)"
                    />
                    <player-menu
                        v-if="selectedMain.title === 'Players'"
                        :account="account"
                        @set-search="setSearch($event)"
                    />
                    <game-menu
                        v-if="selectedMain.title === 'Games'"
                        :account="account"
                        @set-search="setSearch($event)"
                    />
                    <character-menu
                        v-if="selectedMain.title === 'Character'"
                        :account="account"
                        @set-search="setSearch($event)"
                    />
                    <follow-menu
                        v-if="selectedMain.title === 'Follow'"
                        :account="account"
                        @set-search="setSearch($event)"
                    />

                    <matchups-menu
                        v-if="selectedMain.title === 'Matchups'"
                        :account="account"
                        @set-search="setSearch($event)"
                    />

                    <div
                        v-if="selectedMain.title === 'Favorites' && account"
                        class="favorite-nav inner-list"
                    >
                        <h2>Favorites</h2>
                        <div class="menu-item" @click="goToFavoriteMatch()">Matches</div>
                        <div class="menu-item" @click="goToFavoriteCombo()">Combos</div>
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

                    <!-- <div v-if="selectedMain.title === 'Character'" class="character-nav inner-list">
                        <h2>Characters</h2>
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
                    </div> -->

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
import CollectionSelectMenuItem from '@/components/collection/collection-select-menu-item';
import GeneralSearch from '@/components/common/general-search';
import User from '@/components/account/user';
import ExploreMenu from '@/components/common/sub-nav/explore-menu';
import VideoMenu from '@/components/common/sub-nav/video-menu';
import ComboMenu from '@/components/common/sub-nav/combo-menu';
import MatchMenu from '@/components/common/sub-nav/match-menu';
import PlayerMenu from '@/components/common/sub-nav/player-menu';
import GameMenu from '@/components/common/sub-nav/game-menu';
import MatchupMenu from '@/components/common/sub-nav/matchups-menu';

import CharacterMenu from '@/components/common/sub-nav/character-menu';
import Follows from '@/components/account/follows';

import { eventbus } from '@/main';

export default {
    components: {
        'collection-select-menu-item': CollectionSelectMenuItem,
        'video-menu': VideoMenu,
        'combo-menu': ComboMenu,
        'match-menu': MatchMenu,
        'player-menu': PlayerMenu,
        'game-menu': GameMenu,
        'character-menu': CharacterMenu,
        'matchups-menu': MatchupMenu,
        'explore-menu': ExploreMenu,
        'general-search': GeneralSearch,
        user: User,
        follows: Follows,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            mini: true,
            selectedMain: { title: 'Videos', icon: 'mdi-video' },
            selectedGame: {
                id: null,
            },
            selectedCharacterId: null,
            createOptions: [
                {
                    name: 'Video',
                    value: 'video',
                },
                {
                    name: 'Game',
                    value: 'game',
                },
                {
                    name: 'Player',
                    value: 'player',
                },
                {
                    name: 'Creator',
                    value: 'creator',
                },
                {
                    name: 'Character',
                    value: 'character',
                },
                {
                    name: 'Tournament',
                    value: 'tournament',
                },
            ],
        };
    },

    computed: {
        routeName: function () {
            return this.$route.name;
        },
        routeValue: function () {
            return this.$route.params.id;
        },

        mainItems: function () {
            var menuItems = [
                { title: 'Explore', icon: 'mdi-gamepad-square', hasAccess: true, subMenu: false },
                { title: 'Combos', icon: 'mdi-mixed-martial-arts', hasAccess: true },
                { title: 'Matches', icon: 'mdi-kabaddi', hasAccess: true },
                { title: 'Montages', icon: 'mdi-film', hasAccess: true },
                { title: 'Matchups', icon: 'mdi-fencing', hasAccess: true },
            ];

            if (this.hasAccount) {
                menuItems.push({
                    title: 'Favorites',
                    icon: 'mdi-heart',
                    hasAccess: this.hasAccount,
                });
                menuItems.push({
                    title: 'Collections',
                    icon: 'mdi-book-variant-multiple',
                    hasAccess: this.hasAccount,
                });
                menuItems.push({
                    title: 'Add',
                    icon: 'mdi-plus',
                    hasAccess: this.isAdmin,
                });
            }

            return menuItems;
        },

        hasAccount: function () {
            return this.account.id ? true : false;
        },

        isAdmin: function () {
            if (this.hasAccount && this.account.role === 'Admin User') {
                return true;
            } else {
                return false;
            }
        },
    },

    watch: {
        selectedMain() {
            this.selectedGame = {
                id: null,
            };
            this.selectedCharacterId = null;
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

            if (this.selectedMain.title === 'Montages') {
                this.$router.push(`/montages/`);
            }

            if (this.selectedMain.title === 'Explore') {
                this.$router.push(`/explore/`);
            }

            if (this.selectedMain.title === 'Matchups' && this.routeName != 'MatchUps') {
                this.$router.push(`/matchups/`);
            }
        },

        routeName() {
            if (this.routeName === 'Character') {
                this.selectedMain = { title: 'Character', icon: 'mdi-human-handsup' };
            }
            if (this.routeName === 'MatchUps') {
                this.selectedMain = { title: 'Matchups', icon: 'mdi-human-handsup' };
            }
            if (this.routeName === 'Players' || this.routeName === 'Player') {
                this.selectedMain = { title: 'Players', icon: 'mdi-human-handsup' };
            }
            if (this.routeName === 'Explore') {
                this.selectedMain = { title: 'Explore', icon: 'mdi-human-handsup' };
            }
            if (this.routeName === 'Game') {
                this.selectedMain = this.menuItems[0];
            }
        },

        routeValue() {
            this.selectedCharacterId = this.routeValue;
        },
    },

    created() {
        if (this.routeName === 'Character') {
            this.selectedMain = { title: 'Character', icon: 'mdi-human-handsup' };
            this.selectedCharacterId = this.$route.params.id;
        } else if (this.routeName === 'MatchUps') {
            this.selectedMain = { title: 'Matchups', icon: 'mdi-human-handsup' };
        } else if (this.routeName === 'Game') {
            this.selectedMain = { title: 'Games', icon: 'mdi-human-handsup' };
        } else if (this.routeName === 'Players' || this.routeName === 'Player') {
            this.selectedMain = { title: 'Players', icon: 'mdi-human-handsup' };
        }
    },

    methods: {
        updateMain(item) {
            this.selectedMain = item;
        },

        updateGame(game) {
            var searchQuery = {
                type: 'Game',
                value: game.id,
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
                value: player.id,
            };
            this.setSearch(searchQuery);
        },

        updateCharacter(character) {
            var searchQuery = {
                type: 'Character',
                value: character.id,
            };
            this.setSearch(searchQuery);
        },

        matchupCharacter1(character) {
            eventbus.$emit('matchup-character1', character.id);
        },

        matchupCharacter2(character) {
            eventbus.$emit('matchup-character2', character.id);
        },

        setSearch(searchQuery) {
            var query = {
                name: searchQuery.type,
                value: searchQuery.value,
            };

            this.$router.push(`/${searchQuery.route}/${query.name}/${query.value}`);
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
                name: createType,
            });
        },

        openLoginWidget() {
            eventbus.$emit('open:widget', {
                name: 'login',
            });
        },

        openRegisterWidget() {
            eventbus.$emit('open:widget', {
                name: 'register',
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
                characters: {
                    character1: this.selectedCharacterId,
                    character2: character.id,
                },
            });
        },
    },
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

.navigation .v-navigation-drawer.v-navigation-drawer--mini-variant .v-list {
    width: 100%;
}

.navigation .v-navigation-drawer .v-list {
    width: 83%;
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

.navigation .v-list {
    width: 100%;
}

.navigation .v-list--nav {
    padding: 0px;
}

.navigation .v-list-item {
    padding: 0px;
    justify-content: space-around;
}

.navigation .v-list-item::after {
    display: none;
}
</style>
