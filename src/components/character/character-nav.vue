<!-- @format -->
<template>
    <div class="character-nav">
        <div class="character-header">
            <img class="character-img" :src="character.imageUrl" />
            <div class="options">
                <h2>{{ character.name }}</h2>
            </div>
        </div>
        <div v-if="showMenu" class="quick-nav">
            <div v-if="account" class="followed-container">
                <div v-if="!isFollowed" class="follow-btn info-card" @click="followCharacter()">
                    <v-icon> mdi-heart-outline </v-icon>
                </div>
                <div v-else class="unfollow-btn info-card" @click="unfollowCharacter()">
                    <v-icon> mdi-heart </v-icon>
                </div>
            </div>
            <div class="info-card combos" @click="routeToCharacterCombos()">Combos</div>
            <div class="info-card matches" @click="filter('Match')">Matches</div>
            <!-- <div class="info-card montages" @click="filter('Montage')">Montages</div> -->
            <!-- <div class="info-card players" @click="togglePlayerPopup()">
                Players
                <v-icon> mdi-chevron-down </v-icon>
            </div> -->
            <div class="info-card matchup" @click="toggleMatchupPopup()">
                Matchup
                <v-icon> mdi-chevron-down </v-icon>
            </div>
        </div>
        <div v-if="matchupPopupActive" class="popup">
            <character-search :gameId="character.gameId" @update:character="goToMatchup($event)" />
        </div>
        <div v-if="playerPopupActive" class="popup">
            <multiselect
                :options="character.players"
                :multiple="false"
                :clear-on-select="true"
                :preserve-search="true"
                label="name"
                :placeholder="'Featured Players'"
                @input="goToPlayer($event)"
            >
                <template slot="singleLabel" slot-scope="props">
                    <span class="option__name">{{ props.option.name }}</span>
                </template>
                <template slot="option" slot-scope="props">
                    <div class="option__desc">
                        <span class="option__name">{{ props.option.name }}</span>
                    </div>
                </template>
            </multiselect>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';
import CharacterSearch from '@/components/character/character-search';
import { eventbus } from '@/main';

export default {
    name: 'CharacterNav',

    components: {
        'character-search': CharacterSearch,
    },

    props: {
        characterId: {
            type: String,
            default: '',
        },
        characterSlug: {
            type: String,
            default: '',
        },
        account: {
            type: Object,
            default: null,
        },

        showMenu: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            character: {
                id: this.characterId,
                name: null,
                imageUrl: null,
                gameId: null,
                featuredPlayers: null,
            },
            matchupPopupActive: false,
            playerPopupActive: false,
            isFollowed: false,
        };
    },

    computed: {
        characterbubbleStyle() {
            return {
                'background-image': `url(${this.character.imageUrl})`,
                'background-size': '30%',
                'background-repeat': 'no-repeat',
                'background-position': '0% 20%',
            };
        },
    },

    watch: {
        characterId() {
            this.getCharacter();
        },
    },

    created() {
        eventbus.$on('account:update', this.isCharacterFollowed);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isCharacterFollowed);
    },

    mounted() {
        if (this.characterId) {
            this.getCharacter();
        } else {
            this.getCharacterBySlug();
        }
        this.isCharacterFollowed();
    },

    methods: {
        async getCharacter() {
            const response = await CharactersService.getCharacter({
                id: this.characterId,
            });
            this.character = this.hydrateCharacter(response.data.characters[0]);
        },

        async getCharacterBySlug() {
            const response = await CharactersService.getCharacterBySlug({
                slug: this.characterSlug.toUpperCase(),
            });
            this.character = this.hydrateCharacter(response.data.characters[0]);
        },

        hydrateCharacter(response) {
            console.log('hydrateCharacter', response);
            return {
                id: response._id,
                name: response.Name,
                imageUrl: response.AvatarUrl,
                gameId: response.GameId,
                players: this.hydratePlayer(response.Players),
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

        filter(filterType) {
            this.$emit('character-filter:update', filterType);
        },

        toggleMatchupPopup() {
            this.matchupPopupActive = !this.matchupPopupActive;
            this.playerPopupActive = false;
        },

        togglePlayerPopup() {
            this.playerPopupActive = !this.playerPopupActive;
            this.matchupPopupActive = false;
        },

        goToMatchup(character) {
            this.$router.push(`/matchups/${this.character.id}/${character.id}`);
        },

        unfollowCharacter() {
            eventbus.$emit('character:unfollow', this.character.id);
        },

        followCharacter() {
            eventbus.$emit('character:follow', this.character.id);
        },

        isCharacterFollowed(response) {
            if (this.account) {
                var account = response || this.account;
                this.isFollowed = account.followedCharacters.some(
                    (character) => character.id === this.character.id
                );
            }
        },

        goToPlayer(input) {
            this.$router.push(`/player/${input.id}`);
        },

        routeToCharacterCombos() {
            this.$router.push(`/character/${this.characterId}/combos`);
        },
    },
};
</script>
<style type="text/css">
.character-nav {
    width: 100%;
    z-index: 99;
    max-width: 600px;
}

.character-nav .character-header {
    height: 60px;
    background: #242832;
    color: #4447e2;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 20px 0 0;
    border: 2px solid #4447e2;
    border-radius: 15px;
    margin-bottom: 20px;
}

.character-nav .character-header .character-img {
    border-radius: 50%;
    max-height: 70px;
    width: auto;
    position: relative;
    left: -10px;
}

.character-nav .character-header h2 {
    text-align: right;
    font-size: 40px;
    color: #fff;
}

.character-nav .info-card {
    height: 40px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 2px solid #4447e2;
    color: #4447e2;
    background: #242832;
    cursor: pointer;
    margin-right: 5px;
    position: relative;
    padding: 0 23px;
}

.character-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 8px;
    flex-wrap: wrap;
}

.character-nav .popup {
    background: #4447e2;
    width: 100%;
    margin-top: 20px;
    padding: 2px 2px;
    border-radius: 5px;
}

.character-nav .mdi-chevron-down::before {
    content: '\F0140';
    color: #4447e2;
}

.character-nav .follow-btn,
.character-nav .unfollow-btn {
    width: 50px;
    padding: 0;
}

.character-nav .v-icon.v-icon {
    color: #4447e2;
}

.character-nav .character-header .character-img {
    border-radius: 50%;
    max-height: 70px;
    width: auto;
    position: relative;
    left: -10px;
}
</style>
