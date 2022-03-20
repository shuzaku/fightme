<!-- @format -->
<template>
    <div class="montage-step">
        <p class="error-msg">
            {{ error }}
        </p>
        <!--- montage --->
        <div class="players-container">
            <h2>Players</h2>
            <player-search
                v-model="montage.playerIds"
                @update:player="addPlayerToMontage($event)"
            />
            <div class="character-container">
                <h3>Characters</h3>
                <character-search
                    v-model="montage.characterIds"
                    :gameId="gameId"
                    @update:character="addCharacterToMontage($event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search';

export default {
    name: 'MatchVideoSettings',

    components: {
        'character-search': CharacterSearch,
    },

    props: {
        gameId: {
            type: String,
            default: null,
        },
        videoUrl: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            montage: {
                type: null,
                players: [],
                characters: [],
            },
        };
    },

    computed: {},

    watch: {
        montage() {
            this.$emit('update:montage', this.match);
        },
    },

    mounted() {},

    methods: {
        addPlayerToMontage(item) {
            this.video.montage.players.push(item.id);
            this.$emit('update:montage', this.match);
        },

        addCharacterToMontage(character) {
            this.video.montage.characters.push(character);
            this.$emit('update:montage', this.match);
        },
    },
};
</script>

<style type="text/css"></style>
