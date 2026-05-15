<!-- @format -->
<template>
    <div class="new-update">
        <h1>Add Game Update</h1>
        <div class="form">
            <!-- Image preview -->
            <div v-if="update.image" class="image-preview">
                <img :src="update.image" class="preview-img" alt="Update preview" />
                <v-btn small icon @click="update.image = ''">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
            </div>

            <!-- Type -->
            <v-select
                dark
                v-model="update.type"
                :items="typeOptions"
                label="Update Type"
                placeholder="Select Type"
                outlined
                dense
            />

            <!-- Game selector -->
            <div class="field-label">Game(s)</div>
            <game-search
                :taggable="true"
                placeholder="Select Games (can select multiple)"
                @update:game="setGames"
            />

            <!-- Note / description -->
            <v-textarea
                dark
                outlined
                dense
                v-model="update.note"
                label="Note / Description"
                placeholder="e.g. Season 3 balance patch — buffs to Ryu, nerfs to Akuma…"
                rows="3"
                auto-grow
                class="mt-3"
            />

            <!-- Patch image URL -->
            <v-text-field
                dark
                outlined
                dense
                v-model="update.image"
                type="text"
                label="Image URL"
                placeholder="Patch notes banner image URL"
            />

            <!-- Link -->
            <v-text-field
                dark
                outlined
                dense
                v-model="update.link"
                type="text"
                label="Link"
                placeholder="Official patch notes URL"
            />

            <!-- Date -->
            <v-text-field
                dark
                outlined
                dense
                v-model="update.date"
                type="date"
                label="Date"
            />

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>

            <v-btn
                class="submit-btn"
                rounded
                block
                :loading="isLoading"
                :disabled="!canSubmit || isLoading"
                @click="addUpdate()"
            >
                Post Update
            </v-btn>
        </div>
    </div>
</template>

<script>
import UpdatesService from '@/services/updates-service';
import GameSearch from '@/components/games/game-search';

export default {
    name: 'NewUpdate',

    components: {
        'game-search': GameSearch,
    },

    data() {
        return {
            isLoading: false,
            errorMessage: null,
            successMessage: null,
            selectedGames: [],
            update: {
                type: 'Game Update',
                note: '',
                image: '',
                link: '',
                date: new Date().toISOString().substring(0, 10),
            },
            typeOptions: [
                'Game Update',
                'Balance Patch',
                'Season Update',
                'Character DLC',
                'Beta / Demo',
                'Tournament Announcement',
                'Other',
            ],
        };
    },

    computed: {
        canSubmit() {
            return Boolean(this.update.type);
        },
    },

    methods: {
        setGames(games) {
            if (Array.isArray(games)) {
                this.selectedGames = games;
            } else if (games && games.id) {
                this.selectedGames = [games];
            } else {
                this.selectedGames = [];
            }
        },

        async addUpdate() {
            this.errorMessage = null;
            this.successMessage = null;
            this.isLoading = true;

            const gameIds = this.selectedGames.map((g) => g.id || g).filter(Boolean);

            try {
                await UpdatesService.addUpdate({
                    Type:  this.update.type,
                    Games: gameIds,
                    Note:  this.update.note  || undefined,
                    Image: this.update.image || undefined,
                    Link:  this.update.link  || undefined,
                    Date:  this.update.date  || undefined,
                });

                this.successMessage = 'Update posted successfully!';
                this.update = {
                    type: 'Game Update',
                    note: '',
                    image: '',
                    link: '',
                    date: new Date().toISOString().substring(0, 10),
                };
                this.selectedGames = [];
            } catch (e) {
                this.errorMessage = 'Failed to post update. Please try again.';
                console.error(e);
            }

            this.isLoading = false;
        },
    },
};
</script>

<style scoped>
.new-update h1 {
    color: #fff;
    margin-bottom: 20px;
    font-size: 22px;
}

.new-update .form {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.new-update .field-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    margin-bottom: 4px;
    margin-top: 4px;
}

.new-update .image-preview {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
}

.new-update .preview-img {
    width: 100%;
    max-height: 140px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.new-update .submit-btn {
    margin-top: 16px;
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
}

.new-update .error-msg {
    color: #ff5252;
    font-size: 13px;
}

.new-update .success-msg {
    color: #3eb489;
    font-size: 13px;
}
</style>
