<!-- @format -->
<template>
    <div class="browse-card" @click="navigate">
        <div class="browse-card-inner">
            <div class="browse-logo-wrap">
                <img
                    v-if="tournament.image"
                    :src="tournament.image"
                    class="browse-logo"
                    :alt="tournament.name"
                />
                <div v-else class="browse-logo-fallback">
                    <i class="fas fa-trophy"></i>
                </div>
                <div v-if="tournament.tier" class="tier-badge">Tier {{ tournament.tier }}</div>
                <div :class="['status-badge', tournament.isFinished ? 'finished' : 'upcoming']">
                    {{ tournament.isFinished ? 'Completed' : 'Upcoming' }}
                </div>
            </div>
            <div class="browse-info">
                <div class="browse-name">{{ tournament.name }}</div>
                <div class="browse-meta">
                    <span v-if="tournament.eventDateLabel" class="meta-item">
                        <i class="fas fa-calendar"></i>{{ tournament.eventDateLabel }}
                    </span>
                    <span v-if="tournament.location" class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>{{ tournament.location }}
                    </span>
                    <span v-if="tournament.entrantCount" class="meta-item">
                        <i class="fas fa-users"></i>{{ tournament.entrantCount | commaDelimited }}
                    </span>
                </div>
                <div v-if="tournament.gameNames" class="browse-games">{{ tournament.gameNames }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TournamentBrowseCard',

    filters: {
        commaDelimited(value) {
            if (value == null) return '';
            return Number(value).toLocaleString();
        },
    },

    props: {
        tournament: {
            type: Object,
            required: true,
        },
    },

    methods: {
        navigate() {
            this.$router.push(`/tournaments/${this.tournament.id}`);
        },
    },
};
</script>

<style scoped>
.browse-card {
    cursor: pointer;
    height: 100%;
}

.browse-card-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, rgba(25, 27, 36, 0.95) 0%, rgba(36, 40, 50, 0.98) 100%);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.25s ease;
}

.browse-card:hover .browse-card-inner {
    border-color: rgba(62, 180, 137, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.browse-logo-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #b8bec8;
    display: flex;
    align-items: center;
    justify-content: center;
}

.browse-logo {
    max-width: 100%;
    max-height: 120px;
    width: auto;
    height: auto;
    object-fit: contain;
}

.browse-logo-fallback {
    color: rgba(0, 0, 0, 0.12);
    font-size: 40px;
}

.tier-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.status-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    color: #fff;
}

.status-badge.upcoming {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
}

.status-badge.finished {
    background: linear-gradient(135deg, #db8c10 0%, #b8750d 100%);
}

.browse-info {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.browse-name {
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    line-height: 1.3;
    font-family: 'Roboto', sans-serif;
}

.browse-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 12px;
}

.meta-item i {
    color: #3eb489;
    font-size: 10px;
}

.browse-games {
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: auto;
}
</style>
