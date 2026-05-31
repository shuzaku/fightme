<!-- @format -->
<template>
    <div class="character-montages">
        <div v-if="videos.length > 0">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <montage-video-card
                    v-model="video.isPlaying"
                    :montageId="video.montageId"
                    :account="account"
                    @video:delete="removeMontageAt(index)"
                />
            </div>
            <div v-if="isLast" class="feed-end">
                <v-icon class="feed-end-icon">mdi-check-circle-outline</v-icon>
                <p class="feed-end-title">You're all caught up</p>
                <p class="feed-end-subtitle">
                    No more montages for this character. Browse all montages or explore other
                    characters.
                </p>
                <div class="feed-end-actions">
                    <v-btn small outlined class="feed-end-btn" @click="openAddMontage">+ Add Montage</v-btn>
                    <v-btn small outlined class="feed-end-btn" @click="$router.push('/montages/')">
                        Browse Montages
                    </v-btn>
                    <v-btn small outlined class="feed-end-btn" @click="$router.push('/explore')">
                        Explore Characters
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MontageVideoCard from '@/components/videos/montage-video-card';
import MontagesService from '@/services/montages-service';
import { isNearDocumentBottom } from '@/utils/is-near-document-bottom';
import { eventbus } from '@/main';

export default {
    name: 'CharacterMontages',

    components: {
        'montage-video-card': MontageVideoCard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
        characterId: {
            type: String,
            default: null,
        },
        gameId: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            videos: [],
            isLoading: true,
            isLast: false,
            loading: false,
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },

        effectiveCharacterId: function () {
            return this.characterId || this.$route.params.id;
        },
    },

    watch: {
        effectiveCharacterId: function () {
            this.videos = [];
            this.isLast = false;
            this.queryVideos();
        },
    },

    mounted() {
        this.queryVideos();
        window.addEventListener('scroll', this.handleScroll);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },

    methods: {
        async queryVideos() {
            if (this.isLast || this.loading) {
                return;
            }
            this.loading = true;
            this.isLoading = true;
            try {
                const response = await MontagesService.queryMontages({
                    skip: this.skip,
                    characterId: this.effectiveCharacterId,
                });
                const batch = response.data.montages || [];
                if (batch.length === 0) {
                    this.isLast = true;
                } else {
                    this.hydrateVideos(response);
                }
            } catch (e) {
                console.error('queryMontages error:', e);
            } finally {
                this.loading = false;
                this.isLoading = false;
            }
        },

        hydrateVideos(response) {
            (response.data.montages || []).forEach((montage) => {
                this.videos.push({
                    montageId: montage._id,
                    contentType: 'Montage',
                    isEditing: false,
                    isPlaying: false,
                });
            });
        },

        handleScroll() {
            if (isNearDocumentBottom() && !this.isLoading) {
                this.queryVideos();
            }
        },

        removeMontageAt(index) {
            this.videos.splice(index, 1);
        },

        openAddMontage() {
            eventbus.$emit('open:widget', {
                name: 'montage',
                gameId: this.gameId,
                characterId: this.characterId || this.effectiveCharacterId,
            });
        },
    },
};
</script>

<style>
.character-montages {
    position: relative;
    width: 100%;
}
</style>
