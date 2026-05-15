<!-- @format -->
<template>
    <div class="character-slideshow">
        <div class="slideshow-container">
            <div
                v-for="(character, index) in characters"
                :key="character.id"
                class="slide"
                :class="{ active: index === currentIndex }"
            >
                <img
                    :src="isMobile ? character.avatarUrl : character.imageUrl"
                    :alt="character.name"
                    class="character-image"
                />
                <div class="character-info">
                    <v-btn class="character-name" @click="routeToCharacter(character)">
                        Check Out {{ character.name }}
                    </v-btn>
                </div>
            </div>
        </div>

        <!-- Navigation dots -->
        <div v-if="characters && characters.length > 1" class="dots">
            <span
                v-for="(character, index) in characters"
                :key="index"
                class="dot"
                :class="{ active: index === currentIndex }"
                @click="goToSlide(index)"
            ></span>
        </div>
    </div>
</template>

<script>
import { characterPagePath } from '@/utils/game-character-routes';

export default {
    name: 'CharacterSlideshow',

    props: {
        characters: {
            type: Array,
            default: () => [],
        },
        autoPlay: {
            type: Boolean,
            default: true,
        },
        interval: {
            type: Number,
            default: 3000,
        },
        isMobile: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            currentIndex: 0,
            intervalId: null,
        };
    },

    watch: {
        characters: {
            handler(newCharacters) {
                if (newCharacters && newCharacters.length > 0) {
                    this.currentIndex = 0;
                    if (this.autoPlay && newCharacters.length > 1) {
                        this.startAutoPlay();
                    }
                }
            },
            immediate: true,
        },
    },

    mounted() {
        if (this.autoPlay && this.characters && this.characters.length > 1) {
            this.startAutoPlay();
        }
    },

    beforeDestroy() {
        this.stopAutoPlay();
    },

    methods: {
        nextSlide() {
            if (this.characters && this.characters.length > 0) {
                this.currentIndex = (this.currentIndex + 1) % this.characters.length;
            }
        },

        goToSlide(index) {
            this.currentIndex = index;
        },

        startAutoPlay() {
            this.stopAutoPlay();
            this.intervalId = setInterval(() => {
                this.nextSlide();
            }, this.interval);
        },

        stopAutoPlay() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        routeToCharacter(character) {
            var gameLike =
                character && character.gameAbbrev
                    ? { Abbreviation: character.gameAbbrev }
                    : null;
            var path = characterPagePath(gameLike, character);
            if (path) {
                this.$router.push(path);
            }
        },
    },
};
</script>

<style scoped>
.character-slideshow {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.slideshow-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.slide.active {
    opacity: 1;
    pointer-events: initial;
}

.character-image {
    width: 100%;
    height: auto;
    max-height: 80%;
    object-fit: contain;
    border-radius: 10px;
}

.character-info {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
}

.character-info .character-name {
    background-color: transparent;
    box-shadow: none;
    border: 2px solid #3eb489;
    background-color: #3eb48950;
    padding: 10px 20px;
    border-radius: 20px;
}

.character-info .character-name:hover {
    background-color: #3eb489;
}

.character-name {
    color: white;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
}

.dots {
    position: absolute;
    bottom: 12%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: background 0.3s ease;
}

.dot.active {
    background: rgba(255, 255, 255, 1);
}

.dot:hover {
    background: rgba(255, 255, 255, 0.8);
}

.mobile .character-slideshow {
    height: 325px;
    overflow: visible;
}

.mobile .character-info {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
}

.mobile .character-image {
    max-height: 100%;
    border: 2px solid #3eb489;
}

.mobile .dots {
    bottom: -30px;
}

.mobile .character-info .character-name {
    background-color: #3eb489;
}
</style>
