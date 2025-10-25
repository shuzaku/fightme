<!-- @format -->
<template>
    <div ref="videoViewRef" class="match-view">
        <div v-if="video" class="videos-container">
            <match-video-card
                v-if="video.contentType === 'Match'"
                ref="card"
                v-model="video.isPlaying"
                :favoriteVideos="account ? account.favoriteVideos : null"
                :isFirst="video.isFirst"
                :matchId="video.matchId"
                :account="account"
            />
        </div>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import MatchVideoCard from '@/components/videos/match-video-card';

export default {
    name: 'Match',

    components: {
        'match-video-card': MatchVideoCard,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            video: null,
            loading: true,
            query: null,
            savedQuery: null,
            intersectionOptions: {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 1,
            },

            hasTimeStamp: true,
        };
    },

    computed: {
        videoId: function () {
            return this.$route.params.id;
        },
    },

    mounted() {
        this.queryVideos();
    },

    created() {},

    beforeDestroy() {},

    methods: {
        async queryVideos() {
            var queryParameter = {
                skip: this.skip,
                sort: this.sort,
                filter: this.filter,
                tagFilter: this.tagFilter,
                searchQuery: [
                    {
                        queryName: 'Id',
                        queryValue: this.videoId,
                    },
                ],
            };

            const response = await VideosService.queryVideos(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
        },

        hydrateVideos(response) {
            var responseData = response.data.videos[0];
            this.video = {
                comboId: responseData.Combo ? responseData.Combo._id : null,
                matchId: responseData.Match ? responseData.Match._id : null,
                contentType: responseData.ContentType,
                isEditing: false,
                isFirst: false,
            };
        },
    },
};
</script>

<style>
.match-view {
    position: relative;
    padding-top: 160px;
    height: 100%;
    overflow: hidden;
    width: 100%;
}

.match-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.match-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.match-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.match-view .videos-container {
    position: relative;
    width: 100%;
}

.match-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
