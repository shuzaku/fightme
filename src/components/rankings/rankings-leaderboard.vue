<!-- @format -->
<template>
    <div class="rankings-leaderboard">
        <p class="rankings-blurb">
            Glicko-2 ratings computed from tournament sets, weighted by tournament tier and
            discounted for repeat matchups. The <span class="rd-label">±</span> range shows how
            confident the rating is; it narrows the more a player competes. Ranking order
            accounts for that confidence too, so a single big upset win won't outrank a
            longer proven track record until it's backed up by more results.
        </p>

        <div v-if="rows.length === 0" class="rankings-empty">
            <i class="fas fa-trophy"></i>
            <p>No ratings computed for this game yet.</p>
        </div>

        <table v-else class="rankings-table">
            <thead>
                <tr>
                    <th class="col-rank">#</th>
                    <th class="col-player">Player</th>
                    <th class="col-rating">Rating</th>
                    <th class="col-record">Record</th>
                    <th class="col-active">Last Active</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="row in rows"
                    :key="row.playerId || row.rank"
                    class="rankings-row"
                    :class="'rank-' + row.rank"
                    @click="goToPlayer(row)"
                >
                    <td class="col-rank">
                        <span class="rank-badge">{{ row.rank }}</span>
                    </td>
                    <td class="col-player">
                        <div class="player-cell">
                            <img
                                v-if="row.imageUrl"
                                class="player-avatar"
                                :src="row.imageUrl"
                                :alt="row.name"
                            />
                            <div v-else class="player-avatar player-avatar--placeholder">
                                <i class="fas fa-user"></i>
                            </div>
                            <span class="player-name">{{ row.name }}</span>
                        </div>
                    </td>
                    <td class="col-rating">
                        <span class="rating-value">{{ row.rating }}</span>
                        <span class="rating-rd">± {{ row.rd }}</span>
                    </td>
                    <td class="col-record">
                        <span class="record-wins">{{ row.wins }}</span
                        >-<span class="record-losses">{{ row.losses }}</span>
                    </td>
                    <td class="col-active">{{ row.lastActiveLabel || '—' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { playerPagePath } from '@/utils/game-character-routes';

export default {
    name: 'RankingsLeaderboard',

    props: {
        rows: {
            type: Array,
            default: () => [],
        },
    },

    methods: {
        goToPlayer(row) {
            const path = playerPagePath({ id: row.playerId, name: row.name, slug: row.slug });
            if (path) {
                this.$router.push(path);
            }
        },
    },
};
</script>

<style scoped>
.rankings-leaderboard {
    width: 100%;
}

.rankings-blurb {
    color: #ffffff70;
    font-size: 13px;
    line-height: 1.5;
    max-width: 640px;
    margin: 0 0 20px;
}

.rd-label {
    color: #3eb489;
    font-weight: 700;
}

.rankings-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
}

.rankings-empty i {
    font-size: 36px;
    color: rgba(62, 180, 137, 0.3);
}

.rankings-empty p {
    color: rgba(255, 255, 255, 0.4);
    font-size: 15px;
    margin: 0;
}

.rankings-table {
    width: 100%;
    border-collapse: collapse;
    background: #14161f;
    border: 1px solid #ffffff1a;
    border-radius: 8px;
    overflow: hidden;
}

.rankings-table thead th {
    text-align: left;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff70;
    padding: 12px 16px;
    border-bottom: 1px solid #ffffff1a;
    background: #1c1f2b;
}

.rankings-row {
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid #ffffff0f;
}

.rankings-row:last-child {
    border-bottom: none;
}

.rankings-row:hover {
    background: #1c1f2b;
}

.rankings-row td {
    padding: 10px 16px;
    color: #fff;
    font-size: 14px;
    vertical-align: middle;
}

.col-rank {
    width: 48px;
}

.rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 26px;
    padding: 0 6px;
    border-radius: 4px;
    background: #ffffff14;
    color: #ffffffcc;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 13px;
}

.rankings-row.rank-1 .rank-badge {
    background: #3eb48930;
    color: #ffd77a;
    border: 1px solid #ffd77a80;
}

.rankings-row.rank-2 .rank-badge {
    background: #ffffff14;
    color: #d9dbe6;
    border: 1px solid #d9dbe680;
}

.rankings-row.rank-3 .rank-badge {
    background: #ffffff14;
    color: #d99a66;
    border: 1px solid #d99a6680;
}

.player-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.player-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background: #333;
    border: 1px solid #ffffff20;
    flex-shrink: 0;
}

.player-avatar--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff40;
    font-size: 13px;
}

.player-name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rating-value {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: #3eb489;
}

.rating-rd {
    color: #ffffff50;
    font-size: 12px;
    margin-left: 6px;
}

.record-wins {
    color: #3eb489;
    font-weight: 700;
}

.record-losses {
    color: #ff6b6b;
    font-weight: 700;
}

.col-active {
    color: #ffffff70;
    font-size: 13px;
    white-space: nowrap;
}

.mobile .col-active {
    display: none;
}

.mobile .rankings-table thead th.col-active {
    display: none;
}
</style>
