<!-- @format -->
<template>
    <div class="video-nav inner-list ">
        <followed-players initialOpen :followedPlayers="followedPlayers" />
        <followed-characters initialOpen :followedCharacters="followedCharacters" />
        <followed-games initialOpen :followedGames="followedGames" />
    </div>
</template>

<script>
import FollowedPlayers from '@/components/players/followed-players';
import FollowedCharacters from '@/components/character/followed-characters';
import FollowedGames from '@/components/games/followed-games';

export default {
    components: {
        'followed-players': FollowedPlayers,
        'followed-characters': FollowedCharacters,
        'followed-games': FollowedGames
    },

    props: {
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            followedCharacters: null,
            followedGames: null,
            followedPlayers: null
        };
    },

    mounted() {
        (this.followedCharacters = this.account.followedCharacters),
            (this.followedGames = this.account.followedGames),
            (this.followedPlayers = this.account.followedPlayers);
    }
};
</script>
