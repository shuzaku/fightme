<!-- @format -->
<template>
    <div ref="videoViewRef" class="test-view"></div>
</template>

<script>
import MatchesService from '@/services/matches-service';

export default {
    name: 'test',

    components: {},

    props: {},

    data() {
        return {
            matches: null,
        };
    },

    computed: {},

    mounted() {
        this.queryMatch();
    },

    methods: {
        async queryMatch() {
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'GameId',
                        queryValue: '606d42021ddff92064798667',
                    },
                ],
            };

            const response = await MatchesService.queryMatches(queryParameter);
            this.hydrateVideos(response);
            this.isLoading = false;
        },

        async hydrateVideos(response) {
            this.matches = response.data.matches.map((match) => {
                return {
                    id: match._id,
                    GameVersion: 1.03,
                };
            });

            // await MatchesService.patchMatches(this.matches);
        },
    },
};
</script>

<style>
.test-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-top: 20px;
    height: 100%;
    flex-direction: column;
}

.test-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.test-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.test-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.test-view .videos-container {
    position: relative;
    margin-top: 0;
}

.test-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}

.test-view .combo-card:first-child {
    margin-top: 30px;
}
</style>
