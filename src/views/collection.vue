<!-- @format -->
<template>
    <div class="collections-view">
        <div v-if="videos.length > 0" class="videos-container">
            <div
                v-for="(video, index) in videos"
                :key="index"
                :class="{ selected: video.selected }"
            >
                <match-video-card
                    v-if="video.contentType === 'Match'"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :isFirst="video.isFirst"
                    :matchId="video.matchId"
                    :account="account"
                />
                <combo-video-card
                    v-if="video.contentType === 'Combo'"
                    v-model="video.isPlaying"
                    :favoriteVideos="account ? account.favoriteVideos : null"
                    :isFirst="video.isFirst"
                    :comboClipId="video.comboClipId"
                    :account="account"
                />
            </div>
        </div>
    </div>
</template>

<script>
import MatchVideoCard from '@/components/videos/match-video-card';
import ComboVideoCard from '@/components/videos/combo-video-card';

import CollectionsService from '@/services/collections-service';

import { eventbus } from '@/main';

export default {
    name: 'Collection',

    components: {
        'match-video-card': MatchVideoCard,
        'combo-video-card': ComboVideoCard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            videos: [],
            loading: true,
            query: null,
            savedQuery: null,
            favorites: [],
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },
        };
    },

    computed: {
        skip: function () {
            return this.videos.length;
        },
        collectionId: function () {
            return this.$route.params.id;
        },
    },

    watch: {
        collectionId: function () {
            this.getCollection();
        },
    },

    mounted() {
        this.getCollection(this.$route.params);
        window.addEventListener('scroll', this.handleScroll);
        eventbus.$on('newVideoPosted', this.addedNewVideo);
        eventbus.$on('search', this.queryVideos);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        eventbus.$off('newVideoPosted', this.addedNewVideo);
        eventbus.$off('search', this.queryVideos);
    },

    methods: {
        async getCollection() {
            const response = await CollectionsService.queryCollection(this.collectionId);
            this.hydrateVideos(response);
        },

        hydrateVideos(response) {
            response.data.collection[0].Videos.forEach((video) => {
                this.videos.push({
                    comboClipId: video.ContentType === 'Combo' ? video.Id : null,
                    matchId: video.ContentType === 'Match' ? video.Id : null,
                    montageId: video.Montage ? video.Montage._id : null,
                    contentType: video.ContentType,
                    isEditing: false,
                    isFirst: false,
                });
            });
            if (this.videos.length > 0) {
                this.videos[0].isFirst = true;
            }
        },

        handleScroll() {
            var bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (bottomOfWindow) {
                // this.queryVideos();
            }
        },

        spliceVideo(video) {
            this.videos.splice(this.videos.indexOf(video), 1);
        },

        addedNewVideo() {
            this.videos = [];
            this.queryVideos();
        },
    },
};
</script>

<style>
.collections-view {
    position: relative;
    padding-top: 30px;
    height: 100%;
    overflow: hidden;
}

.collections-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.collections-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.collections-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.collections-view .videos-container {
    position: relative;
}

.collections-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
