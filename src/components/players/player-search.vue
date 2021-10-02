<!-- @format -->
<template>
    <div class="players-search">
        <multiselect
            v-if="!isLoading"
            v-model="selectedPlayer"
            :options="players"
            :multiple="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :taggable="true"
            placeholder="Search or add a Player"
            label="playerName"
            @tag="addPlayer($event)"
            @input="setPlayer"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Creator
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import { eventbus } from '@/main';

export default {
    name: 'PlayersSearch',

    props: {
        player: {
            type: Number,
            default: null
        },
        value: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            players: [],
            selectedPlayer: null,
            isLoading: true
        };
    },

    watch: {},

    mounted() {
        this.getPlayers();
    },

    created() {
        eventbus.$on('add:new-player', this.getPlayers);
    },

    beforeDestroy() {
        eventbus.$off('add:new-player', this.getPlayers);
    },

    methods: {
        async addPlayer(newPlayer) {
            var response = await PlayersService.addPlayer({
                Name: newPlayer.trim()
            });
            var playerId = response.data.playerId;
            this.getPlayers(playerId);
            eventbus.$emit('add:new-player');
        },

        async getPlayers(newPlayerId) {
            const response = await PlayersService.fetchPlayers();
            this.players = response.data.players.map(player => {
                return {
                    id: player._id,
                    playerName: player.Name
                };
            });

            if (newPlayerId) {
                this.selectedPlayer = this.players.filter(player => player.id === newPlayerId)[0];
                this.setPlayer();
            }

            if (this.value) {
                this.selectedPlayer = this.players.filter(player => player.id === this.value);
            }

            this.isLoading = false;
        },

        setPlayer() {
            this.$emit('update:player', this.selectedPlayer);
        }
    }
};
</script>
<style type="text/css"></style>
