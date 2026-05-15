<!-- @format -->
<template>
    <div class="player-nav">
        <div class="player-header" :style="playerbubbleStyle">
            <div class="options">
                <h2>{{ player.name }}</h2>
                <div v-if="account" class="followed-container">
                    <div v-if="!isFollowed" class="follow-btn info-card" @click="followPlayer()">
                        <v-icon> mdi-heart-outline </v-icon>
                    </div>
                    <div v-else class="unfollow-btn info-card" @click="unfollowPlayer()">
                        <v-icon> mdi-heart </v-icon>
                    </div>
                </div>
                <div class="social-media">
                    <div class="svg-container">
                        <a v-if="player.youtube" :href="player.youtube" target="_blank">
                            <font-awesome-icon :icon="['fab', 'youtube']" />
                        </a>
                        <a v-if="player.twitter" :href="player.twitter" target="_blank">
                            <font-awesome-icon :icon="['fab', 'twitter']" />
                        </a>
                        <a v-if="player.stream" :href="player.stream" target="_blank">
                            <font-awesome-icon :icon="['fab', 'twitch']" />
                        </a>
                    </div>
                </div>
                <div v-if="isAdmin" class="admin-edit-btn info-card" @click="openEditModal()">
                    <v-icon small>mdi-pencil</v-icon> Edit
                </div>
            </div>

            <div class="match-types">
                <div class="info-card matches" @click="queryOnlineMatches()">Online Matches</div>
                <div class="info-card matches" @click="queryTournamentMatches()">
                    Tournament Matches
                </div>
            </div>
            <div
                v-if="account"
                class="player-account-link"
            >
                <div v-if="isOwnPlayerProfile" class="link-pill is-linked">
                    This is your player profile
                    <v-btn
                        v-if="canUnlink"
                        x-small
                        text
                        dark
                        class="ml-1 link-action-text-btn"
                        :disabled="linkLoading"
                        @click="unlinkFromAccount"
                    >
                        Unlink
                    </v-btn>
                </div>
                <div
                    v-else-if="claimedByOther"
                    class="link-pill linked-other"
                >
                    This player is linked to another account
                </div>
                <div
                    v-else-if="canUseInstantLink"
                    class="link-claim"
                >
                    <p class="link-pill subtext">As an admin, you can link this profile directly.</p>
                    <v-btn
                        small
                        color="primary"
                        dark
                        depressed
                        class="link-claim-primary"
                        :loading="linkLoading"
                        :disabled="!resolvedPlayerId"
                        @click="linkToMyAccount"
                    >
                        This is me — link my account
                    </v-btn>
                </div>
                <div
                    v-else-if="hasPendingLinkRequest"
                    class="link-claim"
                >
                    <div class="link-pill is-linked">
                        Link request sent — an admin will review it.
                    </div>
                    <v-btn
                        v-if="linkRequest && linkRequest._id"
                        x-small
                        text
                        dark
                        class="mt-1 link-action-text-btn"
                        :disabled="requestLoading"
                        @click="cancelLinkRequest"
                    >
                        Cancel request
                    </v-btn>
                </div>
                <div
                    v-else-if="hasRejectedLinkRequest"
                    class="link-claim"
                >
                    <div class="link-pill linked-other">
                        Your request to link this player was not approved
                        <span v-if="linkRequest && linkRequest.RejectionNote"
                            >: {{ linkRequest.RejectionNote }}</span
                        >.
                    </div>
                    <v-btn
                        small
                        color="primary"
                        dark
                        depressed
                        class="link-claim-primary mt-1"
                        :loading="linkLoading"
                        :disabled="!resolvedPlayerId"
                        @click="requestLink"
                    >
                        Request again
                    </v-btn>
                </div>
                <div v-else-if="canRequestLink" class="link-claim">
                    <p class="link-pill subtext">
                        Request a link to this player profile. An admin must approve it before the link
                        is created.
                    </p>
                    <v-btn
                        small
                        color="primary"
                        dark
                        depressed
                        class="link-claim-primary"
                        :loading="linkLoading"
                        :disabled="!resolvedPlayerId"
                        @click="requestLink"
                    >
                        Request to link this player
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import PlayerLinkRequestsService from '@/services/player-link-requests-service';
import { eventbus } from '@/main';

export default {
    name: 'PlayerNav',

    props: {
        playerId: {
            type: String,
            default: '',
        },

        playerSlug: {
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
            popupActive: false,
            isFollowed: false,
            linkLoading: false,
            requestLoading: false,
            linkRequest: null,
            player: {
                id: this.playerId,
                name: null,
                imageUrl: null,
                accountId: null,
            },
        };
    },

    computed: {
        resolvedPlayerId() {
            if (this.playerId) {
                return this.playerId;
            }
            return (this.player && this.player.id) || null;
        },
        isOwnPlayerProfile() {
            return (
                this.account &&
                this.player &&
                this.player.accountId &&
                this.player.accountId === this.account.id
            );
        },
        canUnlink() {
            return this.isOwnPlayerProfile;
        },
        claimedByOther() {
            return (
                this.account &&
                this.player &&
                this.player.accountId &&
                this.player.accountId !== this.account.id
            );
        },
        playerbubbleStyle() {
            return {
                'background-image': `url(${this.player.imageUrl})`,
                'background-size': '30%',
                'background-repeat': 'no-repeat',
                'background-position': '0% 20%',
            };
        },
        isAdmin() {
            return (
                this.account &&
                String((this.account.role || this.account.accountType || '')).toLowerCase() ===
                    'admin'
            );
        },
        canUseInstantLink() {
            return (
                this.isAdmin && !this.player.accountId && this.claimedByOther === false
            );
        },
        canRequestLink() {
            return (
                this.account &&
                !this.isOwnPlayerProfile &&
                !this.claimedByOther &&
                !this.player.accountId &&
                !this.isAdmin
            );
        },
        hasPendingLinkRequest() {
            if (this.isOwnPlayerProfile || this.claimedByOther || this.canUseInstantLink) {
                return false;
            }
            if (this.isAdmin) {
                return false;
            }
            return this.linkRequest && this.linkRequest.Status === 'pending' && !this
                .player.accountId;
        },
        hasRejectedLinkRequest() {
            if (
                this.isOwnPlayerProfile ||
                this.claimedByOther ||
                this.isAdmin ||
                this.player.accountId
            ) {
                return false;
            }
            return this.linkRequest && this.linkRequest.Status === 'rejected' && !this
                .player.accountId;
        },
    },

    watch: {
        playerId() {
            this.getPlayer();
        },
    },

    created() {
        eventbus.$on('account:update', this.isPlayerFollowed);
        eventbus.$on('account:update', this.onAccountUpdate);
    },

    beforeDestroy() {
        eventbus.$off('account:update', this.isPlayerFollowed);
        eventbus.$off('account:update', this.onAccountUpdate);
    },

    mounted() {
        if (this.playerId) {
            this.getPlayer();
        } else {
            this.getPlayerBySlug();
        }
        this.isPlayerFollowed();
    },

    methods: {
        openEditModal() {
            eventbus.$emit('open:widget', { name: 'edit-player', playerId: this.player.id });
        },

        onAccountUpdate() {
            this.loadRequestStatus();
        },
        async loadRequestStatus() {
            if (!this.account || !this.resolvedPlayerId) {
                this.linkRequest = null;
                return;
            }
            if (this.isOwnPlayerProfile) {
                this.linkRequest = null;
                return;
            }
            this.requestLoading = true;
            try {
                const { data } = await PlayerLinkRequestsService.getRequestForPlayer(
                    this.account.id,
                    this.resolvedPlayerId
                );
                this.linkRequest = (data && data.request) || null;
            } catch (e) {
                this.linkRequest = null;
            } finally {
                this.requestLoading = false;
            }
        },
        async getPlayer() {
            const response = await PlayersService.getPlayer({
                id: this.playerId,
            });
            this.player = this.hydratePlayer(response.data);
            await this.$nextTick();
            return this.loadRequestStatus();
        },

        async getPlayerBySlug() {
            const response = await PlayersService.getPlayerBySlug({
                slug: this.playerSlug,
            });
            this.player = this.hydratePlayer(response.data.players[0]);
            await this.$nextTick();
            return this.loadRequestStatus();
        },

        hydratePlayer(response) {
            return {
                id: response._id,
                name: response.Name,
                imageUrl: response.ImageUrl ? response.ImageUrl : null,
                twitter: response.Twitter ? response.Twitter : null,
                stream: response.Stream ? response.Stream : null,
                youtube: response.Youtube ? response.Youtube : null,
                accountId: response.AccountId || null,
            };
        },

        async linkToMyAccount() {
            if (!this.resolvedPlayerId || !this.account) {
                return;
            }
            this.linkLoading = true;
            try {
                await PlayersService.linkPlayerToUser(this.resolvedPlayerId, this.account.id);
                this.linkRequest = null;
                eventbus.$emit('refetch:account');
                if (this.playerId) {
                    await this.getPlayer();
                } else {
                    await this.getPlayerBySlug();
                }
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(
                    (e && e.response && e.response.data && e.response.data.message) ||
                        (e && e.message) ||
                        'Could not link. The API may need to support AccountId and LinkedPlayerIds on the server.'
                );
            } finally {
                this.linkLoading = false;
            }
        },

        async unlinkFromAccount() {
            if (!this.resolvedPlayerId || !this.account) {
                return;
            }
            this.linkLoading = true;
            try {
                await PlayersService.unlinkPlayerFromUser(this.resolvedPlayerId);
                eventbus.$emit('refetch:account');
                if (this.playerId) {
                    await this.getPlayer();
                } else {
                    await this.getPlayerBySlug();
                }
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(
                    (e && e.response && e.response.data && e.response.data.message) ||
                        (e && e.message) ||
                        'Could not unlink profile.'
                );
            } finally {
                this.linkLoading = false;
            }
        },
        async requestLink() {
            if (!this.resolvedPlayerId || !this.account) {
                return;
            }
            this.linkLoading = true;
            try {
                const { data } = await PlayerLinkRequestsService.createRequest(
                    this.account.id,
                    this.resolvedPlayerId
                );
                if (data && data.request) {
                    this.linkRequest = data.request;
                } else {
                    await this.loadRequestStatus();
                }
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(
                    (e && e.response && e.response.data && e.response.data.message) ||
                        (e && e.message) ||
                        'Could not send link request.'
                );
            } finally {
                this.linkLoading = false;
            }
        },
        async cancelLinkRequest() {
            if (!this.linkRequest || !this.linkRequest._id || !this.account) {
                return;
            }
            this.requestLoading = true;
            try {
                await PlayerLinkRequestsService.cancelRequest(
                    this.linkRequest._id,
                    this.account.id
                );
                this.linkRequest = null;
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(
                    (e && e.response && e.response.data && e.response.data.message) ||
                        (e && e.message) ||
                        'Could not cancel the request.'
                );
            } finally {
                this.requestLoading = false;
            }
        },

        filter(filterType) {
            this.$emit('player-filter:update', filterType);
        },

        unfollowPlayer() {
            eventbus.$emit('player:unfollow', this.playerId);
            var player = this.account.followedPlayers.filter((p) => p.id === this.playerId);
            var index = this.account.followedPlayers.indexOf(player);
            this.account.followedPlayers.splice(index, 1);
            this.isFollowed = false;
        },

        followPlayer() {
            eventbus.$emit('player:follow', this.playerId);
            this.account.followedPlayers.push({
                id: this.playerId,
                name: this.player.name,
                type: 'player',
            });
            this.isFollowed = true;
        },

        isPlayerFollowed(response) {
            if (this.account) {
                var account = response || this.account;
                this.isFollowed = account.followedPlayers.some(
                    (player) => player.id === this.playerId
                );
            }
        },

        queryTournamentMatches() {
            this.$emit('query-tournament-matches');
        },

        queryOnlineMatches() {
            this.$emit('query-online-matches');
        },
    },
};
</script>
<style type="text/css">
.player-nav {
    width: 100%;
    z-index: 99;
    max-width: 600px;
    margin-bottom: 40px;
}

.player-nav .player-header {
    color: #4447e2;
    width: 100%;
    padding: 0 20px;
}

.player-nav .player-header h2 {
    font-size: 4em;
}

.player-nav .info-card {
    height: 40px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 1px solid #ffffff30;
    color: #ffffff;
    background: #242832;
    cursor: pointer;
    margin-right: 5px;
    position: relative;
    padding: 0 16px;
}

.player-nav .quick-nav {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.player-nav .popup {
    background: #4447e2;
    width: 100%;
    margin-top: 20px;
    padding: 2px 2px;
    border-radius: 5px;
}

.player-nav .mdi-chevron-down::before {
    content: '\F0140';
    color: #4447e2;
}

.player-nav .follow-btn,
.player-nav .unfollow-btn {
    width: 50px;
    padding: 0px;
}

.player-nav .v-icon.v-icon {
    color: #4447e2;
}

.player-nav .svg-container a {
    border: 2px solid #4447e2;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-right: 5px;
}

.player-nav .svg-container svg {
    width: 15px;
    height: 15px;
}

.player-nav .svg-container a:hover {
    background: #3eb489;
    border-color: #3eb489;
}

.player-nav .svg-container path {
    color: #4447e2;
}

.player-nav .svg-container {
    display: flex;
}

.player-nav .options {
    display: flex;
    align-items: center;
}

.player-nav .followed-container {
    margin-left: 20px;
}

.player-nav .match-types {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.player-nav .player-account-link {
    margin-top: 16px;
    max-width: 600px;
}

.player-nav .link-claim,
.player-nav .link-pill {
    font-size: 0.9rem;
    color: #b0b3c4;
    line-height: 1.4;
}

.player-nav .link-pill.is-linked {
    color: #3eb489;
}

.player-nav .link-pill.linked-other {
    color: #c4a45a;
}

.player-nav .link-pill.subtext {
    margin-bottom: 8px;
    line-height: 1.4;
    font-size: 0.85rem;
    color: #8e92a0;
}

/* Filled CTA: same green as .game-title pills on match cards (#3eb489) */
.player-nav .link-claim .v-btn.link-claim-primary {
    background: #3eb489 !important;
    border-color: #3eb489 !important;
    color: #fff !important;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.player-nav .link-claim .v-btn.link-claim-primary .v-btn__content {
    color: #fff !important;
}

.player-nav .link-claim .v-btn.link-claim-primary:hover,
.player-nav .link-claim .v-btn.link-claim-primary:focus {
    background: #2d8a6a !important;
    border-color: #2d8a6a !important;
}

/* Other non-text in link-claim (if any) */
.player-nav .link-claim .v-btn:not(.v-btn--text):not(.link-claim-primary) {
    color: #f5f5ff !important;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.player-nav .link-claim .v-btn:not(.v-btn--text):not(.link-claim-primary) .v-btn__content {
    color: inherit;
}

.player-nav .player-account-link .link-action-text-btn {
    color: #c4c8e0 !important;
    opacity: 0.95;
}

.player-nav .player-account-link .link-action-text-btn:hover {
    color: #fff !important;
    opacity: 1;
}

.player-nav .admin-edit-btn {
    border-color: #3eb489;
    color: #3eb489;
    gap: 4px;
}
.player-nav .admin-edit-btn:hover {
    background: #3eb48920;
}
</style>
