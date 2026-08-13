<!-- @format -->
<template>
    <div class="season-rankings-leaderboard">
        <div class="season-rankings-header">
            <p class="season-rankings-blurb">
                A PGR/LumiRank-style season power ranking, not a live rating — every player's
                whole {{ selectedSeason }} season is scored fresh from who they beat (and who
                they lost to), how strong those events were, and how often they showed up.
                #1 is rescaled to a score of 100. This is a separate system from the live
                Glicko-2 Rankings above; the two won't always agree, and that's expected.
            </p>
            <div v-if="seasons.length > 0" class="season-select-wrap">
                <label for="season-select" class="season-select-label">Season</label>
                <select
                    id="season-select"
                    class="season-select"
                    :value="selectedSeason"
                    @change="$emit('change-season', Number($event.target.value))"
                >
                    <option v-for="year in seasons" :key="year" :value="year">
                        {{ year }}{{ computedSeasons.includes(year) ? '' : ' (no data)' }}
                    </option>
                </select>
            </div>
        </div>

        <div v-if="rows.length === 0" class="season-rankings-empty">
            <i class="fas fa-crown"></i>
            <p>No season power ranking computed for {{ selectedSeason }} yet.</p>
        </div>

        <table v-else class="season-rankings-table">
            <thead>
                <tr>
                    <th class="col-rank">#</th>
                    <th class="col-player">Player</th>
                    <th class="col-score">Score</th>
                    <th class="col-attended">Events</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="row in rows"
                    :key="row.playerId || row.rank"
                    class="season-rankings-row"
                    :class="['rank-' + row.rank, { 'season-rankings-row--unlinked': row.unlinked }]"
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
                            <span
                                v-if="row.unlinked"
                                class="unlinked-flag"
                                title="Not yet linked to a Fighters-Edge player profile — tracked across this season via their start.gg account instead."
                            >
                                <i class="fas fa-link-slash"></i>
                            </span>
                        </div>
                    </td>
                    <td class="col-score">
                        <span class="score-value">{{ row.score }}</span>
                        <span v-if="row.notConverged" class="score-flag" title="This season's solve did not fully converge — treat the score with a little extra caution.">
                            <i class="fas fa-triangle-exclamation"></i>
                        </span>
                    </td>
                    <td class="col-attended">{{ row.tournamentsAttended }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { playerPagePath } from '@/utils/game-character-routes';

export default {
    name: 'SeasonPowerRankingsLeaderboard',

    props: {
        rows: {
            type: Array,
            default: () => [],
        },
        seasons: {
            type: Array,
            default: () => [],
        },
        computedSeasons: {
            type: Array,
            default: () => [],
        },
        selectedSeason: {
            type: Number,
            default: null,
        },
    },

    methods: {
        goToPlayer(row) {
            if (row.unlinked) return; // no Fighters-Edge player profile to navigate to
            const path = playerPagePath({ id: row.playerId, name: row.name, slug: row.slug });
            if (path) {
                this.$router.push(path);
            }
        },
    },
};
</script>

<style scoped>
.season-rankings-leaderboard {
    width: 100%;
}

.season-rankings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
}

.season-rankings-blurb {
    color: #ffffff70;
    font-size: 13px;
    line-height: 1.5;
    max-width: 640px;
    margin: 0;
}

.season-select-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.season-select-label {
    color: #ffffff70;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
}

.season-select {
    background: #14161f;
    border: 1px solid #ffffff1a;
    color: #fff;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 14px;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
}

.season-rankings-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
}

.season-rankings-empty i {
    font-size: 36px;
    color: rgba(255, 215, 122, 0.3);
}

.season-rankings-empty p {
    color: rgba(255, 255, 255, 0.4);
    font-size: 15px;
    margin: 0;
}

.season-rankings-table {
    width: 100%;
    border-collapse: collapse;
    background: #14161f;
    border: 1px solid #ffffff1a;
    border-radius: 8px;
    overflow: hidden;
}

.season-rankings-table thead th {
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

.season-rankings-row {
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid #ffffff0f;
}

.season-rankings-row:last-child {
    border-bottom: none;
}

.season-rankings-row:hover {
    background: #1c1f2b;
}

.season-rankings-row--unlinked {
    cursor: default;
}

.season-rankings-row--unlinked:hover {
    background: transparent;
}

.unlinked-flag {
    color: #ffffff40;
    font-size: 11px;
    margin-left: 6px;
}

.season-rankings-row td {
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

.season-rankings-row.rank-1 .rank-badge {
    background: #ffd77a30;
    color: #ffd77a;
    border: 1px solid #ffd77a80;
}

.season-rankings-row.rank-2 .rank-badge {
    background: #ffffff14;
    color: #d9dbe6;
    border: 1px solid #d9dbe680;
}

.season-rankings-row.rank-3 .rank-badge {
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

.score-value {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: #ffd77a;
}

.score-flag {
    margin-left: 8px;
    color: #ff6b6b;
    font-size: 12px;
}

.col-attended {
    color: #ffffff70;
    font-size: 13px;
    white-space: nowrap;
}

.mobile .col-attended {
    display: none;
}

.mobile .season-rankings-table thead th.col-attended {
    display: none;
}
</style>
