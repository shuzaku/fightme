<!-- @format -->
<template>
    <div class="player-nav">
        <!-- Identity card -->
        <div class="player-identity">
            <div v-if="player.imageUrl" class="player-avatar">
                <img :src="player.imageUrl" :alt="player.name" />
            </div>
            <div v-else class="player-avatar player-avatar--initials">
                <span>{{ playerInitials }}</span>
            </div>

            <div class="player-info">
                <h1 class="player-name">{{ player.name }}</h1>

                <div class="player-meta">
                    <div class="social-links">
                        <a v-if="player.twitter" :href="player.twitter" target="_blank" class="social-link" title="Twitter">
                            <font-awesome-icon :icon="['fab', 'twitter']" />
                        </a>
                        <a v-if="player.youtube" :href="player.youtube" target="_blank" class="social-link" title="YouTube">
                            <font-awesome-icon :icon="['fab', 'youtube']" />
                        </a>
                        <a v-if="player.stream" :href="player.stream" target="_blank" class="social-link" title="Twitch">
                            <font-awesome-icon :icon="['fab', 'twitch']" />
                        </a>
                    </div>

                    <div class="player-actions">
                        <div v-if="account && !isFollowed" class="action-btn follow-btn" @click="followPlayer()">
                            <v-icon small>mdi-heart-outline</v-icon>
                            <span>Follow</span>
                        </div>
                        <div v-if="account && isFollowed" class="action-btn unfollow-btn" @click="unfollowPlayer()">
                            <v-icon small>mdi-heart</v-icon>
                            <span>Following</span>
                        </div>
                        <div v-if="isAdmin" class="action-btn edit-btn" @click="openEditModal()">
                            <v-icon small>mdi-pencil</v-icon>
                            <span>Edit</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Match type filters -->
        <div class="filter-section">
            <div class="section-label">View</div>
            <div class="filter-row">
                <div class="filter-pill" :class="{ active: activeView === 'all' }" @click="clearFilter()">
                    All
                </div>
                <div class="filter-pill" :class="{ active: activeView === 'online' }" @click="queryOnlineMatches()">
                    Online
                </div>
                <div class="filter-pill" :class="{ active: activeView === 'tournaments' }" @click="queryTournamentMatches()">
                    Tournaments
                </div>
                <div class="filter-pill" :class="{ active: activeView === 'history' }" @click="queryTournamentHistory()">
                    History
                </div>
            </div>
        </div>

        <!-- Games & characters the player plays -->
        <div v-if="player.gamesPlayed && player.gamesPlayed.length > 0" class="filter-section">
            <div class="section-label">Filter by game or character</div>
            <div class="games-played">
                <div
                    v-for="entry in player.gamesPlayed"
                    :key="entry.game.id"
                    class="game-entry"
                >
                    <button
                        class="game-chip"
                        :class="{ active: activeFilter && activeFilter.queryName === 'GameId' && activeFilter.queryValue === entry.game.id }"
                        @click="filterByGame(entry.game)"
                    >
                        <img
                            v-if="entry.game.logoUrl"
                            :src="entry.game.logoUrl"
                            class="game-logo-sm"
                        />
                        <span>{{ entry.game.abbreviation || entry.game.title }}</span>
                    </button>
                    <div v-if="entry.characters && entry.characters.length" class="character-chips">
                        <button
                            v-for="char in entry.characters"
                            :key="char.id"
                            class="character-chip"
                            :class="{ active: activeFilter && activeFilter.queryName === 'CharacterId' && activeFilter.queryValue === char.id }"
                            :title="char.name"
                            @click="filterByCharacter(char)"
                        >
                            <img
                                v-if="char.avatarUrl || char.imageUrl"
                                :src="char.avatarUrl || char.imageUrl"
                                class="char-avatar"
                            />
                            <span v-else class="char-initials">{{ char.name.charAt(0) }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Account link section -->
        <div v-if="account" class="player-account-link">
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
            <div v-else-if="claimedByOther" class="link-pill linked-other">
                This player is linked to another account
            </div>
            <div v-else-if="canUseInstantLink" class="link-claim">
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
            <div v-else-if="hasPendingLinkRequest" class="link-claim">
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
            <div v-else-if="hasRejectedLinkRequest" class="link-claim">
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
            activeFilter: null,
            activeView: 'all',
            player: {
                id: this.playerId,
                name: null,
                imageUrl: null,
                accountId: null,
                gamesPlayed: [],
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
        playerInitials() {
            var name = this.player && this.player.name;
            if (!name) return '?';
            return name
                .split(' ')
                .slice(0, 2)
                .map((w) => w.charAt(0).toUpperCase())
                .join('');
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
        playerId(val) {
            if (val) this.getPlayer();
        },
        playerSlug(val) {
            if (val) {
                this.player = { id: null, name: null, imageUrl: null, accountId: null, gamesPlayed: [] };
                this.activeFilter = null;
                this.getPlayerBySlug();
            }
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
                gamesPlayed: (response.GamesPlayed || []).map((gp) => {
                    // Backend returns either { Game, Characters } (manual) or { game, characters } (derived)
                    var gameDoc = gp.Game || gp.game;
                    var charList = gp.Characters || gp.characters || [];
                    if (!gameDoc) return null;
                    return {
                        game: {
                            id: String(gameDoc._id || gameDoc.id || gameDoc),
                            title: gameDoc.Title || gameDoc.title || '',
                            logoUrl: gameDoc.LogoUrl || gameDoc.logoUrl || null,
                            abbreviation: gameDoc.Abbreviation || gameDoc.abbreviation || null,
                        },
                        characters: charList.map((c) => ({
                            id: String(c._id || c.id || c),
                            name: c.Name || c.name || '',
                            avatarUrl: c.AvatarUrl || c.avatarUrl || null,
                            imageUrl: c.ImageUrl || c.imageUrl || null,
                            slug: c.Slug || c.slug || null,
                        })),
                    };
                }).filter(Boolean),
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

        filterByGame(game) {
            var f = { queryName: 'GameId', queryValue: game.id };
            if (this.activeFilter && this.activeFilter.queryName === 'GameId' && this.activeFilter.queryValue === game.id) {
                this.clearFilter();
                return;
            }
            this.activeFilter = f;
            this.activeView = 'all';
            this.$emit('player-filter:update', f);
        },

        filterByCharacter(character) {
            var f = { queryName: 'CharacterId', queryValue: character.id };
            if (this.activeFilter && this.activeFilter.queryName === 'CharacterId' && this.activeFilter.queryValue === character.id) {
                this.clearFilter();
                return;
            }
            this.activeFilter = f;
            this.activeView = 'all';
            this.$emit('player-filter:update', f);
        },

        clearFilter() {
            this.activeFilter = null;
            this.activeView = 'all';
            this.$emit('player-filter:update', null);
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
            this.activeView = 'tournaments';
            this.$emit('query-tournament-matches');
        },

        queryOnlineMatches() {
            this.activeView = 'online';
            this.$emit('query-online-matches');
        },

        queryTournamentHistory() {
            this.activeView = 'history';
            this.$emit('query-tournament-history');
        },
    },
};
</script>
<style type="text/css">
/* ── Container ─────────────────────────────────────── */
.player-nav {
    width: 100%;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* ── Identity card ──────────────────────────────────── */
.player-nav .player-identity {
    display: flex;
    align-items: center;
    gap: 18px;
    background: linear-gradient(135deg, #1a1d26 0%, #20232e 100%);
    border: 1px solid #ffffff12;
    border-radius: 16px;
    padding: 20px;
}

.player-nav .player-avatar {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #4447e240;
    background: #1c1f27;
}

.player-nav .player-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.player-nav .player-avatar--initials {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4447e2, #6a6ef5);
}

.player-nav .player-avatar--initials span {
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.02em;
}

.player-nav .player-info {
    flex: 1;
    min-width: 0;
}

.player-nav .player-name {
    font-size: 1.9rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 8px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.player-nav .player-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

/* Social links */
.player-nav .social-links {
    display: flex;
    gap: 6px;
}

.player-nav .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid #4447e240;
    color: #8e92c0;
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.player-nav .social-link svg {
    width: 13px;
    height: 13px;
}

.player-nav .social-link:hover {
    background: #3eb489;
    border-color: #3eb489;
    color: #fff;
}

/* Action buttons (follow / edit) */
.player-nav .player-actions {
    display: flex;
    gap: 6px;
}

.player-nav .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 12px;
    height: 28px;
    border-radius: 14px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #ffffff20;
    color: #c0c4e0;
    background: #ffffff08;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
}

.player-nav .action-btn .v-icon {
    font-size: 14px !important;
    color: inherit !important;
}

.player-nav .follow-btn:hover,
.player-nav .edit-btn:hover {
    background: #3eb48920;
    border-color: #3eb489;
    color: #3eb489;
}

.player-nav .unfollow-btn {
    background: #3eb48920;
    border-color: #3eb489;
    color: #3eb489;
}

.player-nav .unfollow-btn:hover {
    background: #e25e5e20;
    border-color: #e25e5e;
    color: #e25e5e;
}

/* ── Section blocks (filters + games) ──────────────── */
.player-nav .filter-section {
    background: #1a1d26;
    border: 1px solid #ffffff10;
    border-radius: 12px;
    padding: 14px 16px;
}

.player-nav .section-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555870;
    margin-bottom: 10px;
}

/* Match type filter pills */
.player-nav .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.player-nav .filter-pill {
    height: 32px;
    padding: 0 14px;
    border-radius: 16px;
    border: 1px solid #ffffff18;
    background: #242832;
    color: #9095b0;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
    user-select: none;
}

.player-nav .filter-pill:hover {
    background: #2c3040;
    color: #c0c4e0;
    border-color: #ffffff28;
}

.player-nav .filter-pill.active {
    background: #3eb48930;
    border-color: #3eb489;
    color: #3eb489;
    font-weight: 600;
}

/* ── Games played ───────────────────────────────────── */
.player-nav .games-played {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.player-nav .game-entry {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.player-nav .game-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px;
    height: 30px;
    border-radius: 15px;
    border: 1px solid #ffffff18;
    background: #242832;
    color: #9095b0;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
    align-self: flex-start;
}

.player-nav .game-chip:hover {
    background: #2c3040;
    color: #c0c4e0;
    border-color: #ffffff28;
}

.player-nav .game-chip.active {
    background: #4447e225;
    border-color: #4447e2;
    color: #9a9eff;
}

.player-nav .game-logo-sm {
    width: 16px;
    height: 16px;
    object-fit: contain;
    border-radius: 3px;
    flex-shrink: 0;
}

/* Character avatar chips */
.player-nav .character-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-left: 2px;
}

.player-nav .character-chip {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid #ffffff15;
    background: #1c1f27;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-sizing: border-box;
    transition: border-color 0.15s, transform 0.12s, box-shadow 0.15s;
    flex-shrink: 0;
}

.player-nav .character-chip:hover {
    border-color: #4447e2;
    transform: scale(1.08);
}

.player-nav .character-chip.active {
    border-color: #3eb489;
    box-shadow: 0 0 0 2px #3eb48950;
}

.player-nav .char-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.player-nav .char-initials {
    font-size: 0.9rem;
    font-weight: 700;
    color: #6a6ef5;
}

/* ── Account link section ───────────────────────────── */
.player-nav .player-account-link {
    padding: 0 4px;
}

.player-nav .link-claim,
.player-nav .link-pill {
    font-size: 0.87rem;
    color: #7a7f9a;
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
    font-size: 0.82rem;
    color: #555870;
}

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

.player-nav .link-claim .v-btn:not(.v-btn--text):not(.link-claim-primary) {
    color: #f5f5ff !important;
    font-weight: 600;
}

.player-nav .player-account-link .link-action-text-btn {
    color: #c4c8e0 !important;
    opacity: 0.95;
}

.player-nav .player-account-link .link-action-text-btn:hover {
    color: #fff !important;
    opacity: 1;
}
</style>
