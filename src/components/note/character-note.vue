<!-- @format -->
<template>
    <div class="character-note">
        <div class="note-container" v-if="!isLoading">
            <div class="title-row" @click="toggleContent()">
                <div
                    class="character-bubble"
                    :style="{ backgroundImage: `url('${character.imageUrl}')` }"
                />
                <h3>{{ note.heading }}</h3>
                <v-icon> mdi-chevron-down </v-icon>
            </div>
            <div v-if="showContent" class="note-content">
                <div v-html="note.content"></div>
            </div>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    components: {},

    name: 'CharacterNotes',

    props: {
        note: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            character: {
                imageUrl: null,
            },
            opposingCharacter: null,
            isLoading: false,
            showContent: false,
        };
    },

    mounted() {
        this.getCharacter();
    },

    methods: {
        async getCharacter() {
            this.isLoading = true;

            const response = await CharactersService.getCharacter({
                id: this.note.target1,
            });
            var character = response.data.characters[0];
            this.character = {
                id: character._id,
                name: character.Name,
                imageUrl: character.AvatarUrl,
            };
            this.isLoading = false;
        },

        toggleContent() {
            this.showContent = !this.showContent;
        },
    },
};
</script>
<style type="text/css">
.character-note .title-row {
    display: flex;
    align-items: center;
    background: #4447e2;
    width: 100%;
    border-radius: 5px;
    padding: 8px 10px;
    position: relative;
}

.character-note .character-bubble {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3eb489;
    background-size: cover;
    background-position: top center;
    background-color: #e8e8e8;
    margin-right: 10px;
}

.character-note h3 {
    color: #fff;
    margin-left: 90px;
}

.character-note .v-icon {
    position: absolute;
    right: 20px;
}

.character-note .note-content {
    background: #1c1c24;
    color: #fff;
    padding: 20px;
}

.character-note ul {
    margin-left: 20px;
}

.character-note li {
    margin-bottom: 5px;
}

.character-note .ql-indent-1 {
    margin-left: 20px;
}
</style>
