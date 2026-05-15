<!-- @format -->
<template>
    <div class="new-featured-video">
        <h1>Add Featured Video</h1>
        <div class="form">
            <div>
                <v-text-field
                    v-model="featuredVideo.videoUrl"
                    dark
                    type="text"
                    name="videoUrl"
                    placeholder="YouTube URL or Video ID"
                />

                <creator-search v-model="featuredVideo.creatorId" @update:creator="setCreator" />

                <game-search
                    v-model="featuredVideo.gameIds"
                    :taggable="true"
                    placeholder="Select Games (can select multiple)"
                    @update:game="setGames"
                />

                <v-select
                    v-model="featuredVideo.type"
                    dark
                    :items="typeOptions"
                    label="Type"
                    placeholder="Select Type"
                ></v-select>
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addFeaturedVideo()">Submit</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import FeaturedVideosService from '@/services/featured-videos-service';
import CreatorSearch from '@/components/content-creator/creator-search';
import GameSearch from '@/components/games/game-search';

export default {
    name: 'NewFeaturedVideo',

    components: {
        'creator-search': CreatorSearch,
        'game-search': GameSearch,
    },

    data() {
        return {
            featuredVideo: {
                videoUrl: null,
                creatorId: null,
                gameIds: [],
                type: 'General',
            },
            typeOptions: [
                { text: 'General', value: 'General' },
                { text: 'Game', value: 'Game' },
            ],
        };
    },

    methods: {
        extractYouTubeVideoId(url) {
            if (!url) return null;

            // If it's already just a video ID (11 characters, alphanumeric, hyphens, underscores)
            if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
                return url.trim();
            }

            // Try to extract from various YouTube URL formats
            var videoId = null;

            // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
            var match = url.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
            );
            if (match && match[1]) {
                videoId = match[1];
            }

            // Short URL: https://youtu.be/VIDEO_ID
            if (!videoId) {
                match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
                if (match && match[1]) {
                    videoId = match[1];
                }
            }

            // Embed URL: https://www.youtube.com/embed/VIDEO_ID
            if (!videoId) {
                match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
                if (match && match[1]) {
                    videoId = match[1];
                }
            }

            return videoId;
        },

        async addFeaturedVideo() {
            // Extract YouTube video ID from URL
            var videoId = this.extractYouTubeVideoId(this.featuredVideo.videoUrl);

            if (!videoId) {
                alert('Please enter a valid YouTube URL or Video ID');
                return;
            }

            // Convert gameIds array to array of IDs
            var gameIds = [];
            if (this.featuredVideo.gameIds) {
                if (Array.isArray(this.featuredVideo.gameIds)) {
                    gameIds = this.featuredVideo.gameIds.map((game) => game.id || game);
                } else if (this.featuredVideo.gameIds.id) {
                    gameIds = [this.featuredVideo.gameIds.id];
                }
            }

            await FeaturedVideosService.addFeaturedVideo({
                VideoUrl: videoId,
                CreatorId: this.featuredVideo.creatorId,
                GameIds: gameIds,
                Type: this.featuredVideo.type,
            });

            this.$emit('closeModal');
        },

        setCreator(creator) {
            if (creator && creator.id) {
                this.featuredVideo.creatorId = creator.id;
            } else {
                this.featuredVideo.creatorId = null;
            }
        },

        setGames(games) {
            if (Array.isArray(games)) {
                this.featuredVideo.gameIds = games;
            } else if (games && games.id) {
                this.featuredVideo.gameIds = [games];
            } else {
                this.featuredVideo.gameIds = [];
            }
        },
    },
};
</script>

<style type="text/css">
.new-featured-video h1 {
    color: #fff;
}

.new-featured-video input {
    margin-bottom: 10px;
    border: 0;
}

.new-featured-video .submit-btn {
    margin-top: 20px;
}
</style>
