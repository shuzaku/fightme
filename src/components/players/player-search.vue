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
            :tag-position="tagPosition"
            placeholder="Search or add a Player"
            label="playerName"
            track-by="id"
            @tag="addPlayer($event)"
            @input="setPlayer"
            @search-change="isMatch($event)"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select player
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import {
    loadPlayers,
    getPlayersCache,
    subscribePlayersCache,
} from '@/services/players-cache';
import { eventbus } from '@/main';

export default {
    name: 'PlayersSearch',

    props: {
        player: {
            type: Number,
            default: null,
        },
        value: {
            type: String,
            default: null,
        },
        tagPosition: {
            type: String,
            default: 'bottom',
        },
    },

    data() {
        return {
            players: [],
            selectedPlayer: null,
            isLoading: true,
        };
    },

    watch: {
        value() {
            this.syncSelectedPlayer();
        },
    },

    mounted() {
        this.unsubscribeCache = subscribePlayersCache((players) => {
            this.players = players;
            this.syncSelectedPlayer();
        });
        this.getPlayers();
    },

    created() {
        eventbus.$on('add:new-player', this.onPlayersChanged);
    },

    beforeDestroy() {
        eventbus.$off('add:new-player', this.onPlayersChanged);
        if (this.unsubscribeCache) {
            this.unsubscribeCache();
        }
    },

    methods: {
        async addPlayer(newPlayer) {
            var response = await PlayersService.addPlayer({
                Name: newPlayer.trim(),
            });
            var playerId = response.data.playerId;
            await loadPlayers(true);
            this.syncSelectedPlayer(playerId);
            eventbus.$emit('add:new-player');
        },

        onPlayersChanged() {
            const list = getPlayersCache();
            if (list) {
                this.players = list;
                this.syncSelectedPlayer();
            }
        },

        async getPlayers(newPlayerId) {
            try {
                this.players = await loadPlayers();
            } catch (e) {
                this.players = getPlayersCache() || [];
            }

            if (newPlayerId) {
                this.syncSelectedPlayer(newPlayerId);
                this.setPlayer();
            } else {
                this.syncSelectedPlayer();
            }

            this.isLoading = false;
        },

        syncSelectedPlayer(playerId) {
            const id = playerId != null ? playerId : this.value;
            if (!id) {
                this.selectedPlayer = null;
                return;
            }
            this.selectedPlayer =
                this.players.find((player) => String(player.id) === String(id)) || null;
        },

        setPlayer() {
            this.$emit('update:player', this.selectedPlayer);
        },

        isMatch(searchValue) {
            var match = this.players.filter(
                (player) => player.playerName.toLowerCase() === searchValue.toLowerCase()
            )[0];
            if (match) {
                this.players.splice(this.players.indexOf(match), -1);
                this.players.unshift(match);
            }
        },
    },
};
</script>
<style type="text/css"></style>
