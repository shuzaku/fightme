<!-- @format -->
<template>
    <div class="admin-plr">
        <div class="admin-plr__header">
            <h1>Player link requests</h1>
            <p>Approve or reject requests to link a player profile to a user account.</p>
        </div>

        <v-alert
            v-if="!isAdmin"
            type="error"
            outlined
            class="mb-4"
        >
            You do not have access to this page.
        </v-alert>

        <div v-else-if="requests.length > 0" class="admin-plr__list">
            <v-card
                v-for="(row, index) in requests"
                :key="row._id + '-' + index"
                class="admin-plr__card"
                dark
            >
                <v-card-text>
                    <p class="admin-plr__meta">
                        <strong>Requested</strong> {{ formatDate(row.createdAt) }}
                    </p>
                    <p v-if="row.PlayerId && row.PlayerId.Name">
                        <strong>Player</strong> {{ row.PlayerId.Name }} &nbsp;·&nbsp; ID
                        {{ (row.PlayerId && row.PlayerId._id) || row.PlayerId }}
                    </p>
                    <p v-if="row.AccountId && row.AccountId.DisplayName">
                        <strong>Account</strong> {{ row.AccountId.DisplayName }} ({{ row.AccountId.Email
                        }})
                    </p>
                    <p v-if="playerPath(row)" class="mt-2">
                        <router-link :to="playerPath(row)">View player</router-link>
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="success"
                        :loading="row._approving"
                        :disabled="row._approving || row._rejecting"
                        @click="approve(row)"
                    >
                        <v-icon left>mdi-check</v-icon> Approve
                    </v-btn>
                    <v-btn
                        color="error"
                        :loading="row._rejecting"
                        :disabled="row._approving || row._rejecting"
                        @click="openReject(row)"
                    >
                        <v-icon left>mdi-close</v-icon> Reject
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>

        <v-alert v-else-if="!loading" type="info" outlined> No pending player link requests. </v-alert>

        <v-dialog v-model="rejectOpen" max-width="480" dark>
            <v-card v-if="rejectingRow">
                <v-card-title>Reject request</v-card-title>
                <v-card-text>
                    <v-textarea
                        v-model="rejectNote"
                        label="Optional note to store with the request"
                        rows="3"
                        dark
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="rejectOpen = false">Cancel</v-btn>
                    <v-btn color="error" @click="submitReject()">Reject</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <loading v-show="loading" />

        <v-snackbar v-model="snack.show" :color="snack.color" :timeout="4000">{{ snack.text }}</v-snackbar>
    </div>
</template>

<script>
import moment from 'moment';
import PlayerLinkRequestsService from '@/services/player-link-requests-service';
import Loading from '@/components/common/loading';

export default {
    name: 'AdminPlayerLinkApproval',
    components: { loading: Loading },
    props: {
        account: { type: Object, default: null },
    },
    data() {
        return {
            requests: [],
            loading: true,
            rejectOpen: false,
            rejectNote: '',
            rejectingRow: null,
            snack: { show: false, text: '', color: 'success' },
        };
    },
    computed: {
        isAdmin() {
            return (
                this.account &&
                (this.account.role === 'Admin User' ||
                    (this.account.role && String(this.account.role).toLowerCase() === 'admin'))
            );
        },
    },
    watch: {
        account() {
            this.checkAccess();
        },
    },
    mounted() {
        this.checkAccess();
    },
    methods: {
        checkAccess() {
            if (this.account == null) {
                return;
            }
            if (!this.isAdmin) {
                this.$router.push('/');
                return;
            }
            this.load();
        },
        formatDate(created) {
            if (!created) {
                return '—';
            }
            return moment(created).format('lll');
        },
        playerPath(row) {
            const id = (row.PlayerId && row.PlayerId._id) || row.PlayerId;
            if (!id) {
                return null;
            }
            return '/player/' + id;
        },
        showSnack(text, color) {
            this.snack = { show: true, text, color };
        },
        async load() {
            this.loading = true;
            try {
                const res = await PlayerLinkRequestsService.listPending();
                this.requests = (res.data.requests || []).map((r) => {
                    r._approving = false;
                    r._rejecting = false;
                    return r;
                });
            } catch (e) {
                this.showSnack('Could not load requests', 'error');
            } finally {
                this.loading = false;
            }
        },
        async approve(row) {
            row._approving = true;
            try {
                await PlayerLinkRequestsService.approveRequest(row._id);
                this.showSnack('Link created', 'success');
                await this.load();
            } catch (e) {
                this.showSnack(
                    (e.response && e.response.data && e.response.data.message) ||
                        (e && e.message) ||
                        'Approve failed',
                    'error'
                );
            } finally {
                row._approving = false;
            }
        },
        openReject(row) {
            this.rejectingRow = row;
            this.rejectNote = '';
            this.rejectOpen = true;
        },
        async submitReject() {
            if (!this.rejectingRow) {
                return;
            }
            this.rejectingRow._rejecting = true;
            try {
                await PlayerLinkRequestsService.rejectRequest(
                    this.rejectingRow._id,
                    this.rejectNote
                );
                this.rejectOpen = false;
                this.showSnack('Request rejected', 'success');
                await this.load();
            } catch (e) {
                this.showSnack(
                    (e.response && e.response.data && e.response.data.message) || 'Reject failed',
                    'error'
                );
            } finally {
                this.rejectingRow._rejecting = false;
            }
        },
    },
};
</script>

<style scoped>
.admin-plr {
    max-width: 800px;
    margin: 120px auto 64px;
    padding: 24px;
    color: #e0e0e0;
}
.admin-plr__header h1 {
    color: #fff;
    font-size: 1.5rem;
}
.admin-plr__header p {
    color: #aaa;
    font-size: 0.9rem;
}
.admin-plr__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.admin-plr__card {
    background: #191b24;
    border: 1px solid #2a2c38;
}
.admin-plr__card a {
    color: #8b9cf7;
}
</style>
