<!-- @format -->
<template>
    <div class="tournament-detail">
        <loading v-if="isLoading"></loading>

        <div v-else-if="notFound" class="detail-not-found">
            <p>We could not find that tournament.</p>
            <router-link :to="browseBackTo" class="back-link">Browse tournaments</router-link>
        </div>

        <div v-else class="detail-content">
            <div class="detail-header">
                <img v-if="tournament.image" :src="tournament.image" class="header-logo" :alt="tournament.name" />
                <div class="header-text">
                    <router-link :to="browseBackTo" class="back-link">
                        <i class="fas fa-arrow-left"></i> Tournaments
                    </router-link>
                    <h1>{{ tournament.name }}</h1>
                    <div class="header-meta">
                        <span v-if="tournament.eventDateLabel" class="meta-item">
                            <i class="fas fa-calendar"></i>{{ tournament.eventDateLabel }}
                        </span>
                        <span v-if="tournament.location" class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>{{ tournament.location }}
                        </span>
                        <span v-if="tournament.entrantCount" class="meta-item">
                            <i class="fas fa-users"></i>{{ tournament.entrantCount | commaDelimited }} entrants
                        </span>
                        <span v-if="tournament.tier" class="meta-item">
                            <i class="fas fa-medal"></i>Tier {{ tournament.tier }}
                        </span>
                    </div>
                    <div v-if="tournament.gameNames" class="header-games">{{ tournament.gameNames }}</div>
                    <div class="header-links">
                        <a v-if="tournament.bracketUrl" :href="tournament.bracketUrl" target="_blank" rel="noopener" class="ext-link">
                            <i class="fas fa-sitemap"></i> View bracket on start.gg
                        </a>
                        <a v-if="tournament.liquipediaUrl" :href="tournament.liquipediaUrl" target="_blank" rel="noopener" class="ext-link">
                            <i class="fas fa-external-link-alt"></i> Liquipedia
                        </a>
                    </div>
                </div>
            </div>

            <!-- Top players -->
            <div v-if="topStandings.length" class="section">
                <h2>Top Players</h2>
                <div class="standings-list">
                    <div v-for="s in topStandings" :key="s.id" class="standing-row">
                        <div class="placement">{{ placementLabel(s.placement) }}</div>
                        <router-link v-if="s.playerLink" :to="s.playerLink" class="standing-name standing-name--link">
                            {{ s.name }}
                        </router-link>
                        <div v-else class="standing-name">{{ s.name }}</div>
                        <div v-if="s.prizeAmount" class="standing-prize">${{ s.prizeAmount | commaDelimited }}</div>
                    </div>
                </div>
            </div>
            <div v-else-if="!isLoading" class="section empty-note">
                No standings recorded for this tournament yet.
            </div>

            <!-- Round-grouped match list -->
            <div v-if="rounds.length" class="section">
                <h2>Bracket</h2>
                <div class="rounds-list">
                    <div v-for="round in rounds" :key="round.phaseName + round.roundText" class="round-group">
                        <div class="round-heading">
                            <span class="round-phase">{{ round.phaseName }}</span>
                            <span class="round-name">{{ round.roundText }}</span>
                        </div>
                        <div class="sets-list">
                            <div v-for="set in round.sets" :key="set.id" class="set-row">
                                <router-link
                                    v-if="set.entrant1Link"
                                    :to="set.entrant1Link"
                                    :class="['set-entrant', 'set-entrant--link', { winner: set.winnerId && set.winnerId === set.entrant1Id }]"
                                >
                                    {{ set.entrant1Name || 'TBD' }}
                                </router-link>
                                <div v-else :class="['set-entrant', { winner: set.winnerId && set.winnerId === set.entrant1Id }]">
                                    {{ set.entrant1Name || 'TBD' }}
                                </div>
                                <div class="set-score">
                                    {{ set.entrant1Score != null ? set.entrant1Score : '-' }}
                                    &ndash;
                                    {{ set.entrant2Score != null ? set.entrant2Score : '-' }}
                                </div>
                                <router-link
                                    v-if="set.entrant2Link"
                                    :to="set.entrant2Link"
                                    :class="['set-entrant', 'set-entrant--right', 'set-entrant--link', { winner: set.winnerId && set.winnerId === set.entrant2Id }]"
                                >
                                    {{ set.entrant2Name || 'TBD' }}
                                </router-link>
                                <div v-else :class="['set-entrant', 'set-entrant--right', { winner: set.winnerId && set.winnerId === set.entrant2Id }]">
                                    {{ set.entrant2Name || 'TBD' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="!isLoading" class="section empty-note">
                No bracket data recorded for this tournament yet.
            </div>
        </div>
    </div>
</template>

<script>
import TournamentsService from '@/services/tournaments-service';
import Loading from '@/components/common/loading.vue';
import { setOgMeta, tournamentOgUrl } from '@/services/og-meta-service';
import { playerPagePath } from '@/utils/game-character-routes';
import { startggBracketUrl } from '@/utils/startgg-bracket-url';
import { getLastBrowseQuery } from '@/utils/tournaments-browse-state';

// Same reasoning as tournaments-browse.vue: IsFinished isn't set by the
// auto-ingestion pipeline, so derive it from EventDate instead.
function isPastEventDate(eventDate) {
    if (!eventDate) return false;
    const todayStr = new Date().toISOString().slice(0, 10);
    return new Date(eventDate).toISOString().slice(0, 10) < todayStr;
}

export default {
    name: 'TournamentDetail',

    components: {
        loading: Loading,
    },

    filters: {
        commaDelimited(value) {
            if (value == null) return '';
            return Number(value).toLocaleString();
        },
    },

    data() {
        return {
            isLoading: true,
            notFound: false,
            tournament: {},
            topStandings: [],
            rounds: [],
        };
    },

    computed: {
        tournamentId() {
            return this.$route.params.id;
        },

        // Return to the browse page with whatever filters were last applied,
        // so the back link doesn't dump the user into an unfiltered list.
        browseBackTo() {
            return { path: '/tournaments', query: getLastBrowseQuery() };
        },
    },

    watch: {
        tournamentId() {
            this.fetchResults();
        },
    },

    mounted() {
        this.fetchResults();
    },

    methods: {
        placementLabel(placement) {
            if (placement === 1) return '1st';
            if (placement === 2) return '2nd';
            if (placement === 3) return '3rd';
            return placement ? `${placement}th` : '—';
        },

        async fetchResults() {
            this.isLoading = true;
            this.notFound = false;
            try {
                const res = await TournamentsService.getTournamentResults(this.tournamentId, 8);
                const data = res.data;
                if (!data || !data.tournament) {
                    this.notFound = true;
                    this.isLoading = false;
                    return;
                }

                this.tournament = this.hydrateTournament(data.tournament);
                this.topStandings = (data.topStandings || []).map(this.hydrateStanding);
                this.rounds = (data.rounds || []).map(this.hydrateRound);

                setOgMeta({
                    title: this.tournament.name,
                    description: [this.tournament.gameNames, this.tournament.location]
                        .filter(Boolean)
                        .join(' — '),
                    imageUrl: tournamentOgUrl(this.tournamentId),
                    ogType: 'website',
                });
            } catch (e) {
                console.error(e);
                if (e.response && e.response.status === 404) {
                    this.notFound = true;
                } else {
                    this.notFound = true;
                }
            }
            this.isLoading = false;
        },

        hydrateTournament(t) {
            // Manually-entered / backfilled tournaments carry the curated Games
            // array; most auto-ingested ones only reliably have the single
            // GameId until that array's been backfilled — fall back to it so
            // those still show a game/logo.
            const gamesList = (t.Games || []).filter((g) => g && typeof g === 'object');
            const gameId = t.GameId && typeof t.GameId === 'object' ? t.GameId : null;
            if (gamesList.length === 0 && gameId) {
                gamesList.push(gameId);
            }
            const gameNames = gamesList.map((g) => g.Title).filter(Boolean).join(', ');
            const gameLogo = gamesList.length ? gamesList[0].LogoUrl : null;
            return {
                id: t._id,
                name: t.Name,
                image: t.Image || t.LogoUrl || gameLogo,
                location: t.Location,
                tier: t.Tier,
                isFinished: isPastEventDate(t.EventDate),
                entrantCount: t.EntrantCount,
                gameNames,
                bracketUrl: t.BracketUrl || startggBracketUrl(t.StartggSlug),
                liquipediaUrl: t.LiquipediaUrl,
                eventDateLabel: t.EventDate
                    ? new Date(t.EventDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : null,
            };
        },

        hydrateStanding(s) {
            const player = s.PlayerId && typeof s.PlayerId === 'object' ? s.PlayerId : null;
            const entrant = s.EntrantId && typeof s.EntrantId === 'object' ? s.EntrantId : null;
            const name = (player && player.Name) || (entrant && entrant.RawName) || 'Unknown';
            let playerLink = null;
            if (player) {
                playerLink = playerPagePath(player) || null;
            }
            return {
                id: s._id,
                placement: s.Placement,
                prizeAmount: s.PrizeAmount,
                name,
                playerLink,
            };
        },

        // An entrant links to a player page only when the ingestion matcher
        // resolved it to a real Players record; unmatched entrants stay plain
        // text.
        entrantPlayerLink(entrant) {
            const player =
                entrant && entrant.PlayerId && typeof entrant.PlayerId === 'object'
                    ? entrant.PlayerId
                    : null;
            if (!player) return null;
            return playerPagePath(player) || null;
        },

        hydrateRound(r) {
            return {
                phaseName: r.phaseName,
                roundText: r.roundText,
                sets: (r.sets || []).map((set) => {
                    const e1 = set.Entrant1Id && typeof set.Entrant1Id === 'object' ? set.Entrant1Id : null;
                    const e2 = set.Entrant2Id && typeof set.Entrant2Id === 'object' ? set.Entrant2Id : null;
                    const winner =
                        set.WinnerEntrantId && typeof set.WinnerEntrantId === 'object'
                            ? set.WinnerEntrantId._id
                            : set.WinnerEntrantId;
                    return {
                        id: set._id,
                        entrant1Id: e1 ? e1._id : (set.Entrant1Id || null),
                        entrant2Id: e2 ? e2._id : (set.Entrant2Id || null),
                        entrant1Name: e1 ? e1.RawName : null,
                        entrant2Name: e2 ? e2.RawName : null,
                        entrant1Link: this.entrantPlayerLink(e1),
                        entrant2Link: this.entrantPlayerLink(e2),
                        entrant1Score: set.Entrant1Score,
                        entrant2Score: set.Entrant2Score,
                        winnerId: winner,
                    };
                }),
            };
        },
    },
};
</script>

<style scoped>
.tournament-detail {
    padding-top: calc(var(--app-top-bar-height, 84px) + var(--app-follows-bar-height, 72px) + 32px);
    max-width: 900px;
    margin: 0 auto;
    padding-left: clamp(16px, 3vw, 48px);
    padding-right: clamp(16px, 3vw, 48px);
    padding-bottom: 80px;
    box-sizing: border-box;
    width: 100%;
}

.detail-not-found {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    padding: 100px 20px;
}

.back-link {
    color: #3eb489;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
}

.back-link:hover {
    text-decoration: underline;
}

.detail-header {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    background: #1c1c24;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 28px;
}

.header-logo {
    width: 110px;
    height: 110px;
    object-fit: contain;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
}

.header-text {
    min-width: 0;
    flex: 1;
}

.header-text h1 {
    color: #fff;
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: clamp(22px, 3.5vw, 30px);
    margin: 0 0 10px;
    line-height: 1.15;
}

.header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 8px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
}

.meta-item i {
    color: #3eb489;
    font-size: 11px;
}

.header-games {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

.header-links {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.ext-link {
    color: #3eb489;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.ext-link:hover {
    text-decoration: underline;
}

.section {
    margin-bottom: 32px;
}

.section h2 {
    color: #fff;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 18px;
    margin: 0 0 14px;
}

.empty-note {
    color: rgba(255, 255, 255, 0.35);
    font-size: 14px;
}

.standings-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.standing-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    padding: 10px 16px;
}

.placement {
    width: 44px;
    flex-shrink: 0;
    color: #3eb489;
    font-weight: 700;
    font-size: 14px;
}

.standing-name {
    flex: 1;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
}

.standing-name--link {
    text-decoration: none;
    cursor: pointer;
}

.standing-name--link:hover {
    color: #3eb489;
}

.standing-prize {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
}

.rounds-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.round-heading {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
}

.round-phase {
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.round-name {
    color: #fff;
    font-weight: 700;
    font-size: 14px;
}

.sets-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.set-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
}

.set-entrant {
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.set-entrant--right {
    text-align: right;
}

.set-entrant.winner {
    color: #fff;
    font-weight: 700;
}

/* Matches .standing-name--link so linked names read the same in both sections */
.set-entrant--link {
    text-decoration: none;
    cursor: pointer;
}

.set-entrant--link:hover {
    color: #3eb489;
}

.set-score {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    white-space: nowrap;
}

@media (max-width: 600px) {
    .detail-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .header-meta,
    .header-links {
        justify-content: center;
    }
}
</style>
