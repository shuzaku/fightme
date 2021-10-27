<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'followed-characters']">
        <div class="menu-item" @click="toggleOpen">
            Followed Characters
            <v-icon>
                mdi-chevron-down
            </v-icon>
        </div>

        <div v-if="isOpen" class="characters">
            <div v-for="character in characters" :key="character.id">
                <div class="followed-character" @click="routeToCharacter(character.id)">
                    <div class="avatar">
                        <img v-if="character.imageUrl" :src="character.imageUrl" />
                        <div v-else class="blank-avatar"></div>
                    </div>
                    {{ character.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'followed-characters',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        },
        followedCharacters: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            characters: [],
            isOpen: false,
            isLoading: false
        };
    },
    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    watch: {
        followedCharacters() {
            this.getCharacters();
        }
    },

    mounted() {
        this.isOpen = this.initialOpen;
    },

    methods: {
        getCharacters() {
            this.isLoading = true;
            this.characters = this.followedCharacters;
            this.isLoading = false;
        },

        toggleOpen() {
            this.isOpen = !this.isOpen;
        },

        collapse() {
            this.isOpen = false;
        },

        routeToCharacter(characterId) {
            this.$router.push(`/character/${characterId}`);
        }
    }
};
</script>
<style type="text/css">
.followed-characters .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.followed-characters.opened .mdi-chevron-down {
    transform: rotate(-90deg);
    transition: all 0.3s linear;
}
.followed-characters .followed-character {
    color: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 5px;
}

.followed-characters .avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    background: #fff;
}

.followed-characters .avatar img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    border: 2px solid #3eb489;
}
</style>
