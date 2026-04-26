<!-- @format -->
<template>
    <div class="game-card" @click="navigate(game.id)">
        <div class="game-card-inner">
            <div class="shine-effect"></div>
            <div class="cover-art-container">
                <div class="image-wrapper">
                    <img class="cover-art" :src="game.coverArt" :alt="game.title || 'Game Cover'" />
                    <div class="image-glow"></div>
                </div>
                <div class="overlay">
                    <div class="overlay-content">
                        <div class="play-icon">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="view-text">
                            <i class="fas fa-gamepad"></i>
                            <span>View Game</span>
                        </div>
                    </div>
                </div>
                <div class="corner-accent"></div>
            </div>
            <div class="game-info" v-if="game.title">
                <div class="title-wrapper">
                    <h3 class="game-title">{{ game.title }}</h3>
                    <div class="title-underline"></div>
                </div>
            </div>
        </div>
        <div class="card-glow"></div>
    </div>
</template>

<script>
export default {
    name: 'game-card',
    components: {},

    props: {
        game: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            games: [],
        };
    },
    mounted() {},

    methods: {
        navigate(id) {
            this.$router.push(`/game/${id}`);
        },
    },
};
</script>

<style scoped>
.game-card {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    margin: 0;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    position: relative;
    flex: none;
}

.game-card:hover {
    transform: translateY(-12px) scale(1.02);
}

.game-card-inner {
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
}

.game-card:hover .game-card-inner {
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

.game-card:hover .shine-effect {
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

.game-card:hover .card-glow {
    opacity: 1;
}

.cover-art-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.image-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.cover-art {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    object-fit: cover;
    aspect-ratio: 3 / 4;
    filter: brightness(0.95);
}

.game-card:hover .cover-art {
    transform: scale(1.15);
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

.game-card:hover .image-glow {
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

.game-card:hover .overlay {
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

.game-card:hover .overlay-content {
    transform: translateY(0);
}

.play-icon {
    width: 70px;
    height: 70px;
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

.play-icon::before {
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

.game-card:hover .play-icon {
    transform: scale(1) rotate(0deg);
    box-shadow: 0 12px 35px rgba(62, 180, 137, 0.6), 0 0 30px rgba(62, 180, 137, 0.4);
}

.play-icon i {
    color: #fff;
    font-size: 24px;
    margin-left: 4px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.view-text {
    color: #fff;
    font-size: 14px;
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
    gap: 8px;
}

.view-text i {
    font-size: 16px;
    transition: transform 0.3s ease;
}

.game-card:hover .view-text {
    opacity: 1;
    transform: translateY(0);
}

.game-card:hover .view-text i {
    transform: scale(1.2) rotate(5deg);
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

.game-card:hover .corner-accent {
    opacity: 1;
}

.game-info {
    padding: 20px 16px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
    position: relative;
}

.title-wrapper {
    position: relative;
}

.game-title {
    color: #fff;
    font-size: 17px;
    font-weight: 700;
    margin: 0;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.3px;
}

.game-card:hover .game-title {
    color: #3eb489;
    text-shadow: 0 0 20px rgba(62, 180, 137, 0.5), 0 2px 10px rgba(0, 0, 0, 0.5);
    transform: scale(1.05);
}

.title-underline {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 60%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #3eb489, transparent);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 0 10px rgba(62, 180, 137, 0.5);
}

.game-card:hover .title-underline {
    transform: translateX(-50%) scaleX(1);
}

@media (max-width: 768px) {
    .game-title {
        font-size: 14px;
    }

    .play-icon {
        width: 55px;
        height: 55px;
    }

    .play-icon i {
        font-size: 18px;
    }

    .view-text {
        font-size: 12px;
    }
}
</style>
