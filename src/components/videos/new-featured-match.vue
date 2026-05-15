<!-- @format -->
<template>
    <div class="new-featured-match">
        <h1>Add Featured Match</h1>
        <div class="form">
            <div>
                <v-text-field
                    dark
                    type="text"
                    name="videoUrl"
                    label="YouTube URL or Video ID"
                    placeholder="YouTube URL or Video ID"
                    v-model="videoUrl"
                />

                <creator-search
                    v-model="creatorId"
                    class="mt-4"
                    @update:creator="setCreator"
                />

                <game-search
                    :taggable="true"
                    placeholder="Select Games (optional)"
                    class="mt-4"
                    @update:game="setGames"
                />
            </div>

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>

            <div>
                <v-btn
                    class="submit-btn"
                    rounded
                    :loading="isLoading"
                    :disabled="!videoUrl || isLoading"
                    @click="addFeaturedMatch()"
                >
                    Submit
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import FeaturedMatchesService from '@/services/featured-matches-service';
import CreatorSearch from '@/components/content-creator/creator-search';
import GameSearch from '@/components/games/game-search';

export default {
    name: 'NewFeaturedMatch',

    components: {
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
    },

    data() {
        return {
            videoUrl: '',
            creatorId: null,
            selectedGames: [],
            isLoading: false,
            errorMessage: null,
            successMessage: null,
        };
    },

    methods: {
        extractYouTubeVideoId(url) {
            if (!url) return null;
            if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
            var match = url.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
            );
            return match && match[1] ? match[1] : null;
        },

        setCreator(creator) {
            this.creatorId = creator && creator.id ? creator.id : null;
        },

        setGames(games) {
            if (Array.isArray(games)) {
                this.selectedGames = games;
            } else if (games && games.id) {
                this.selectedGames = [games];
            } else {
                this.selectedGames = [];
            }
        },

        async addFeaturedMatch() {
            this.errorMessage = null;
            this.successMessage = null;

            var videoId = this.extractYouTubeVideoId(this.videoUrl);
            if (!videoId) {
                this.errorMessage = 'Please enter a valid YouTube URL or Video ID.';
                return;
            }

            var gameIdStrings = this.selectedGames.map((g) => g.id || g).filter(Boolean);

            this.isLoading = true;
            try {
                await FeaturedMatchesService.addFeaturedMatch({
                    VideoUrl: videoId,
                    CreatorId: this.creatorId || undefined,
                    GameIds: gameIdStrings,
                });
                this.successMessage = 'Match added to Featured Matches!';
                this.videoUrl = '';
                this.creatorId = null;
                this.selectedGames = [];
            } catch (e) {
                this.errorMessage = 'Failed to add featured match. Please try again.';
                console.error(e);
            }
            this.isLoading = false;
        },
    },
};
</script>

<style scoped>
.new-featured-match h1 {
    color: #fff;
    margin-bottom: 20px;
}

.new-featured-match .form > div {
    margin-bottom: 16px;
}

.new-featured-match .submit-btn {
    margin-top: 20px;
}

.new-featured-match .error-msg {
    color: #ff5252;
    font-size: 14px;
    margin-bottom: 8px;
}

.new-featured-match .success-msg {
    color: #3eb489;
    font-size: 14px;
    margin-bottom: 8px;
}
</style>
