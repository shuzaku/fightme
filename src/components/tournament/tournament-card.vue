<!-- @format -->
<template>
    <div class="tournament-card" @click="navigate(tournament.id)">
        <div class="card-inner">
            <div class="shine-effect"></div>
            <div class="logo-container">
                <div class="image-wrapper">
                    <img :src="tournament.logoUrl" class="logo" :alt="tournament.name || 'Tournament Logo'" />
                    <div class="image-glow"></div>
                </div>
                <div class="overlay">
                    <div class="overlay-content">
                        <div class="view-icon">
                            <i :class="tournament.isFinished ? 'fas fa-trophy' : 'fas fa-calendar-alt'"></i>
                        </div>
                        <div class="view-text">
                            <i class="fas fa-arrow-right"></i>
                            <span>{{ tournament.isFinished ? 'View Results' : 'View Bracket' }}</span>
                        </div>
                    </div>
                </div>
                <div class="corner-accent"></div>
            </div>
            <div class="tournament-info">
                <div v-if="tournament.name" class="tournament-name">{{ tournament.name }}</div>
                <div v-if="tournament.location" class="tournament-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ tournament.location }}</span>
                </div>
            </div>
            <div v-if="!tournament.isFinished" class="date-badge">
                <i class="fas fa-calendar"></i>
                <span>{{ tournament.eventDate }}</span>
            </div>
            <div v-if="tournament.isFinished" class="finished-badge">
                <i class="fas fa-check-circle"></i>
                <span>Completed</span>
            </div>
        </div>
        <div class="card-glow"></div>
    </div>
</template>

<script>
export default {
    name: 'tournament-card',
    components: {},

    props: {
        tournament: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {};
    },

    methods: {
        navigate(id) {
            if (this.tournament.isFinished) {
                this.$router.push(`/tournament/${id}`);
            } else {
                window.location.replace(this.tournament.bracketUrl, '_blank');
            }
        },
    },
};
</script>

<style scoped>
.tournament-card {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    margin: 0;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.tournament-card:hover {
    transform: translateY(-10px) scale(1.02);
}

.card-inner {
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(25, 27, 36, 0.95) 0%, rgba(36, 40, 50, 0.98) 100%);
    border-radius: 20px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    z-index: 2;
    height: 100%;
    flex: 1;
}

.tournament-card:hover .card-inner {
    box-shadow: 0 15px 45px rgba(62, 180, 137, 0.25), 0 0 30px rgba(62, 180, 137, 0.15),
        0 0 0 1px rgba(62, 180, 137, 0.2) inset;
    border-color: rgba(62, 180, 137, 0.5);
    background: linear-gradient(135deg, rgba(25, 27, 36, 0.98) 0%, rgba(36, 40, 50, 1) 100%);
}

.shine-effect {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 70%
    );
    transform: rotate(45deg);
    opacity: 0;
    transition: opacity 0.6s ease;
    pointer-events: none;
    z-index: 3;
}

.tournament-card:hover .shine-effect {
    opacity: 1;
    animation: shine 1.5s ease-in-out;
}

@keyframes shine {
    0% {
        transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
        transform: translateX(100%) translateY(100%) rotate(45deg);
    }
}

.card-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(62, 180, 137, 0.2) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    border-radius: 20px;
    z-index: 1;
    pointer-events: none;
}

.tournament-card:hover .card-glow {
    opacity: 1;
}

.logo-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
    min-height: 196px;
    aspect-ratio: 16 / 9;
}

.image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 0;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: brightness(0.95);
    background: rgba(0, 0, 0, 0.2);
}

.tournament-card:hover .logo {
    transform: scale(1.1);
    filter: brightness(1.1);
}

.image-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at center,
        rgba(62, 180, 137, 0.2) 0%,
        transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
}

.tournament-card:hover .image-glow {
    opacity: 1;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.2) 40%,
        rgba(0, 0, 0, 0.6) 80%,
        rgba(0, 0, 0, 0.85) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(2px);
}

.tournament-card:hover .overlay {
    opacity: 1;
}

.overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    transform: translateY(10px);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tournament-card:hover .overlay-content {
    transform: translateY(0);
}

.view-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(62, 180, 137, 0.5), 0 0 20px rgba(62, 180, 137, 0.3);
    transform: scale(0.7) rotate(-10deg);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
}

.view-icon::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3eb489, #2d8a6a);
    opacity: 0.3;
    filter: blur(8px);
    z-index: -1;
    animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.3;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.1;
    }
}

.tournament-card:hover .view-icon {
    transform: scale(1) rotate(0deg);
    box-shadow: 0 12px 35px rgba(62, 180, 137, 0.6), 0 0 30px rgba(62, 180, 137, 0.4);
}

.view-icon i {
    color: #fff;
    font-size: 24px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.view-text {
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0;
    transform: translateY(5px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.view-text i {
    font-size: 12px;
    transition: transform 0.3s ease;
}

.tournament-card:hover .view-text {
    opacity: 1;
    transform: translateY(0);
}

.tournament-card:hover .view-text i {
    transform: translateX(3px);
}

.corner-accent {
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(62, 180, 137, 0.3) 0%, transparent 70%);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.tournament-card:hover .corner-accent {
    opacity: 1;
}

.tournament-info {
    padding: 16px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
    min-height: 70px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    justify-content: center;
}

.tournament-name {
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    margin: 0;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.tournament-card:hover .tournament-name {
    color: #3eb489;
    text-shadow: 0 0 20px rgba(62, 180, 137, 0.5), 0 2px 10px rgba(0, 0, 0, 0.5);
}

.tournament-location {
    color: #ffffff90;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 400;
}

.tournament-location i {
    font-size: 10px;
    color: #3eb489;
}

.date-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    color: #fff;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.4);
    z-index: 4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.date-badge i {
    font-size: 10px;
}

.finished-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #db8c10 0%, #b8750d 100%);
    color: #fff;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 15px rgba(219, 140, 16, 0.4);
    z-index: 4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.finished-badge i {
    font-size: 10px;
}

/* Typography / touch targets; width comes from parent grid */
@media (max-width: 768px) {
    .tournament-name {
        font-size: 13px;
    }

    .view-icon {
        width: 50px;
        height: 50px;
    }

    .view-icon i {
        font-size: 18px;
    }

    .view-text {
        font-size: 11px;
    }
}
</style>
