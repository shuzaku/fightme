<!-- @format -->
<template>
    <div class="players-search">
        <multiselect
            v-model="selectedPlayer"
            :options="players"
            :multiple="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :taggable="true"
            placeholder="Search or add a Player"
            label="name"
            @tag="addPlayer"
            @input="setPlayer"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Player
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
            selectedPlayer: null
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
            await PlayersService.addPlayer({
                Name: newPlayer.trim()
            });
            eventbus.$emit('add:new-player');
            this.getPlayers(newPlayer);
        },

        async getPlayers(newPlayer) {
            const response = await PlayersService.fetchPlayers();
            this.players = response.data.players.map(player => {
                return {
                    id: player._id,
                    name: player.Name
                };
            });

            if (newPlayer) {
                this.selectedPlayer = this.players.filter(
                    player => player.name === newPlayer.trim()
                )[0];
                this.setPlayer();
            }

            if (this.value) {
                this.selectedPlayer = this.players.filter(player => player.id === this.value);
            }
        },

        setPlayer() {
            this.$emit('update:player', this.selectedPlayer);
        }
    }
};
</script>
<style type="text/css"></style>
