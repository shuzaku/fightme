<!-- @format -->
<template>
    <div class="character-nav">
        <div class="character-header" :style="characterbubbleStyle">
            <div class="options">
                <h2>{{ name }}</h2>
            </div>
        </div>
        <div class="quick-nav">
            <div v-if="account" class="followed-container">
                <div v-if="!isFollowed" class="follow-btn info-card" @click="followCharacter()">
                    <v-icon> mdi-heart-outline </v-icon>
                </div>
                <div v-else class="unfollow-btn info-card" @click="unfollowCharacter()">
                    <v-icon> mdi-heart </v-icon>
                </div>
            </div>
            <div class="info-card combos" @click="filter('Combo')">Combos</div>
            <div class="info-card matches" @click="filter('Match')">Matches</div>
            <div class="info-card montages" @click="filter('Montage')">Montages</div>
            <div class="info-card matchup">
                Matchup
                <v-icon @click="togglePopup()"> mdi-chevron-down </v-icon>
            </div>
        </div>
        <div v-show="popupActive" class="popup">
            <character-search :gameId="gameId" @update:character="goToMatchup($event)" />
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

        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            name: null,
            imageUrl: null,
            gameId: null,
            popupActive: false,
            isFollowed: false,
        };
    },

    computed: {
        characterbubbleStyle() {
            return {
                'background-image': `url(${this.imageUrl})`,
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
        this.getCharacter();
        this.isCharacterFollowed();
    },

    methods: {
        async getCharacter() {
            const response = await CharactersService.getCharacter({
                id: this.characterId,
            });
            this.name = response.data.Name;
            this.imageUrl = response.data.AvatarUrl;
            this.gameId = response.data.GameId;
        },

        filter(filterType) {
            this.$emit('character-filter:update', filterType);
        },

        togglePopup() {
            this.popupActive = !this.popupActive;
        },

        goToMatchup(character) {
            this.$router.push(`/matchups/${this.characterId}/${character.id}`);
        },

        unfollowCharacter() {
            eventbus.$emit('character:unfollow', this.characterId);
        },

        followCharacter() {
            eventbus.$emit('character:follow', this.characterId);
        },

        isCharacterFollowed(response) {
            if (this.account) {
                var account = response || this.account;
                this.isFollowed = account.followedCharacters.some(
                    (character) => character.id === this.characterId
                );
            }
        },
    },
};
</script>
<style type="text/css">
.character-nav {
    width: 100%;
    min-width: 500px;
    width: 566px;
    z-index: 99;
}

.character-nav .character-header {
    height: 80px;
    background: #242832;
    color: #4447e2;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    border: 2px solid #4447e2;
    border-radius: 15px;
}

.character-nav .character-header h2 {
    text-align: right;
}

.character-nav .info-card {
    width: 130px;
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
}

.character-nav .quick-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
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
}

.character-nav .v-icon.v-icon {
    color: #4447e2;
}
</style>
