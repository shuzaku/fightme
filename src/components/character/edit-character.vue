<!-- @format -->
<template>
    <div class="edit-character">
        <h1>Edit Character</h1>
        <div v-if="isLoading" class="loading-msg">Loading...</div>
        <div v-else class="form">
            <div v-if="character.imageUrl" class="char-img-preview">
                <img :src="character.imageUrl" class="char-img" />
            </div>

            <v-text-field v-model="character.name" dark        type="text" placeholder="Character Name" />
            <v-text-field v-model="character.slug" dark        type="text" placeholder="URL Slug (optional)" />
            <v-text-field v-model="character.imageUrl" dark    type="text" placeholder="Image URL (full art)" />
            <v-text-field v-model="character.avatarUrl" dark   type="text" placeholder="Avatar URL (portrait)" />
            <v-text-field v-model="character.archetype" dark   type="text" placeholder="Archetype (e.g. Zoner)" />
            <v-textarea   v-model="character.gameplan" dark    placeholder="Gameplan" rows="2" auto-grow />
            <v-textarea   v-model="character.strengths" dark   placeholder="Strengths" rows="2" auto-grow />
            <v-textarea   v-model="character.weakness" dark    placeholder="Weakness" rows="2" auto-grow />
            <v-text-field v-model="character.overviewUrl" dark type="text" placeholder="Overview YouTube Video ID" />
            <v-text-field v-model="character.wiki" dark        type="text" placeholder="Wiki URL" />
            <v-text-field v-model="character.releaseDate" dark type="date" placeholder="Release Date" />

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>

            <v-btn class="submit-btn" rounded :loading="isSaving" @click="saveCharacter()">
                Save Changes
            </v-btn>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'EditCharacter',

    props: {
        characterId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            isLoading: true,
            isSaving: false,
            errorMessage: null,
            successMessage: null,
            character: {
                name: '',
                slug: '',
                imageUrl: '',
                avatarUrl: '',
                archetype: '',
                gameplan: '',
                strengths: '',
                weakness: '',
                overviewUrl: '',
                wiki: '',
                releaseDate: '',
            },
        };
    },

    created() {
        if (this.characterId) this.fetchCharacter();
    },

    methods: {
        async fetchCharacter() {
            this.isLoading = true;
            try {
                const res = await CharactersService.getCharacter({ id: this.characterId });
                const c = (res.data.characters && res.data.characters[0]) || {};
                this.character = {
                    name:        c.Name        || '',
                    slug:        c.Slug        || '',
                    imageUrl:    c.ImageUrl    || '',
                    avatarUrl:   c.AvatarUrl   || '',
                    archetype:   c.Archetype   || '',
                    gameplan:    c.Gameplan    || '',
                    strengths:   c.Strengths   || '',
                    weakness:    c.Weakness    || '',
                    overviewUrl: c.OverviewUrl || '',
                    wiki:        c.Wiki        || '',
                    releaseDate: c.releaseDate ? c.releaseDate.substring(0, 10) : '',
                };
            } catch (e) {
                this.errorMessage = 'Failed to load character data.';
            }
            this.isLoading = false;
        },

        async saveCharacter() {
            this.errorMessage = null;
            this.successMessage = null;
            this.isSaving = true;
            try {
                const body = { id: this.characterId };
                const addField = (key, val) => { if (val && String(val).trim()) body[key] = String(val).trim(); };

                addField('Name',        this.character.name);
                addField('Slug',        this.character.slug);
                addField('ImageUrl',    this.character.imageUrl);
                addField('AvatarUrl',   this.character.avatarUrl);
                addField('Archetype',   this.character.archetype);
                addField('Gameplan',    this.character.gameplan);
                addField('Strengths',   this.character.strengths);
                addField('Weakness',    this.character.weakness);
                addField('OverviewUrl', this.character.overviewUrl);
                addField('Wiki',        this.character.wiki);
                if (this.character.releaseDate) body.releaseDate = this.character.releaseDate;

                await CharactersService.updateCharacter(body);
                this.successMessage = 'Character updated successfully!';
            } catch (e) {
                this.errorMessage = 'Failed to save changes.';
            }
            this.isSaving = false;
        },
    },
};
</script>

<style scoped>
.edit-character h1 {
    color: #fff;
    margin-bottom: 20px;
}
.edit-character .form {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.edit-character .char-img-preview {
    margin-bottom: 12px;
}
.edit-character .char-img {
    max-width: 120px;
    height: auto;
    border-radius: 8px;
}
.edit-character .submit-btn {
    margin-top: 16px;
}
.edit-character .error-msg {
    color: #ff5252;
    font-size: 13px;
}
.edit-character .success-msg {
    color: #3eb489;
    font-size: 13px;
}
.edit-character .loading-msg {
    color: #fff;
}
</style>
