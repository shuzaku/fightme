<!-- @format -->
<template>
    <div class="update-card" @click="navigate(update.link)">
        <div class="card-inner">
            <div class="shine-effect"></div>
            <div class="logo-container">
                <div class="image-wrapper">
                    <img :src="update.image" class="logo" :alt="update.note || 'Update Image'" />
                    <div class="image-glow"></div>
                </div>
                <div class="overlay">
                    <div class="overlay-content">
                        <div class="view-icon">
                            <i class="fas fa-external-link-alt"></i>
                        </div>
                        <div class="view-text">
                            <i class="fas fa-arrow-right"></i>
                            <span>View Update</span>
                        </div>
                    </div>
                </div>
                <div class="corner-accent"></div>
            </div>
        </div>
        <div class="date-badge">
            <i class="fas fa-calendar"></i>
            <span>{{ update.date }}</span>
        </div>
        <div class="card-glow"></div>
    </div>
</template>

<script>
export default {
    name: 'update-card',
    components: {},

    props: {
        update: {
            type: Object,
            required: true,
        },
    },

    methods: {
        navigate(link) {
            if (link) {
                window.open(link, '_blank');
            }
        },
    },
};
</script>

<style scoped>
.update-card {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    margin: 8px;
    width: 196px;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.update-card:hover {
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
    width: 196px;
    height: 92px;
}

.update-card:hover .card-inner {
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

.update-card:hover .shine-effect {
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

.update-card:hover .card-glow {
    opacity: 1;
}

.logo-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.logo {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
    padding: 0;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: brightness(0.95);
    background: rgba(0, 0, 0, 0.2);
}

.update-card:hover .logo {
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

.update-card:hover .image-glow {
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

.update-card:hover .overlay {
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

.update-card:hover .overlay-content {
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

.update-card:hover .view-icon {
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

.update-card:hover .view-text {
    opacity: 1;
    transform: translateY(0);
}

.update-card:hover .view-text i {
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

.update-card:hover .corner-accent {
    opacity: 1;
}


.date-badge {
    position: absolute;
    top: -10px;
    left: -10px;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%);
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.5), 0 0 10px rgba(62, 180, 137, 0.3);
    z-index: 10;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.date-badge i {
    font-size: 10px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .update-card {
        width: calc((100% - 72px) / 3);
        margin: 12px;
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

@media (max-width: 480px) {
    .update-card {
        width: calc((100% - 48px) / 2);
    }
}
</style>
