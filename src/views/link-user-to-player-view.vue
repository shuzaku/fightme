<!-- @format -->
<template>
    <div class="link-user-player-view">
        <h1>Link user to player</h1>
        <p class="hint">
            Connect a site account to a player profile. Enter the user’s account id (the same id used in
            the database for <code>accounts</code>).
        </p>
        <div class="grid">
            <div class="card">
                <h3>Player</h3>
                <player-search @update:player="onPlayerPicked" />
                <div v-if="player.id" class="summary">
                    <p><strong>{{ player.playerName }}</strong></p>
                    <p class="meta">Id: {{ player.id }}</p>
                </div>
            </div>
            <div class="card">
                <h3>User account</h3>
                <v-text-field
                    v-model="accountId"
                    label="Account id (Mongo _id)"
                    dark
                    outlined
                    dense
                />
            </div>
        </div>
        <div class="actions">
            <v-btn color="primary" :disabled="!canLink" :loading="loading" @click="link()">
                Link
            </v-btn>
            <v-btn
                v-if="player.id && accountId"
                :disabled="loading"
                class="ml-2"
                text
                @click="unlink()"
            >
                Unlink this pair
            </v-btn>
        </div>
    </div>
</template>

<script>
import PlayerSearch from '@/components/players/player-search';
import PlayersService from '@/services/players-service';
import { eventbus } from '@/main';

export default {
    name: 'LinkUserToPlayerView',

    components: {
        'player-search': PlayerSearch,
    },

    data() {
        return {
            accountId: '',
            player: { id: null, playerName: '' },
            loading: false,
        };
    },

    computed: {
        canLink() {
            return !!this.player.id && !!this.accountId.trim() && !this.loading;
        },
    },

    methods: {
        onPlayerPicked(p) {
            this.player = p
                ? {
                      id: p.id,
                      playerName: p.playerName,
                  }
                : { id: null, playerName: '' };
        },

        async link() {
            this.loading = true;
            try {
                await PlayersService.linkPlayerToUser(
                    this.player.id,
                    this.accountId.trim()
                );
                eventbus.$emit('add:new-player');
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(
                    (e && e.response && e.response.data && e.response.data.message) ||
                        e.message ||
                        'Link failed. Does the API support AccountId and LinkedPlayerIds?'
                );
            } finally {
                this.loading = false;
            }
        },

        async unlink() {
            this.loading = true;
            try {
                await PlayersService.unlinkPlayerFromUser(this.player.id);
                eventbus.$emit('add:new-player');
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(
                    (e && e.response && e.response.data && e.response.data.message) ||
                        e.message ||
                        'Unlink failed.'
                );
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.link-user-player-view {
    max-width: 800px;
    margin: 120px auto 64px;
    padding: 24px;
    color: #e0e0e0;
}

.link-user-player-view h1 {
    color: #fff;
    font-size: 1.75rem;
}

.hint {
    color: #aaa;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 12px 0 24px;
}

.hint code {
    color: #8be9fd;
    font-size: 0.85em;
}

.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.card {
    flex: 1;
    min-width: 280px;
    background: #191b24;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #2a2c38;
}

.card h3 {
    color: #fff;
    margin-bottom: 12px;
    font-size: 1rem;
}

.summary .meta {
    font-size: 0.85rem;
    color: #999;
    word-break: break-all;
}

.actions {
    margin-top: 24px;
}

.ml-2 {
    margin-left: 8px;
}
</style>
