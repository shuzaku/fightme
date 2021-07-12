<!-- @format -->
<template>
    <div ref="videoViewRef" class="players-view" v-if="results">{{ results }}</div>
</template>

<script>
export default {
    name: 'Videos',

    components: {},

    data() {
        return {
            results: null,
            error: null
        };
    },

    mounted() {
        this.fetch();
    },

    methods: {
        async fetch() {
            try {
                const url = `https://www.googleapis.com/youtube/v3/search?key=936424237721-3988kr9bnjlqbmrsfu45nnm4ueba6pqc.apps.googleusercontent.com
&channelId=UCVsmYrE8-v3VS7XWg3cXp9g&part=snippet,id&order=date&maxResults=20`;
                const response = await this.axios.get(url);
                const results = response.data.results;
                this.results = results;
            } catch (err) {
                this.error = err;
            }
        }
    }
};
</script>

<style>
.players-view {
    display: flex;
    align-items: flex-start;
    position: relative;
    justify-content: space-around;
    padding-top: 100px;
    height: 100%;
    overflow: hidden;
}

.players-view::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: #1f1d2b;
}

.players-view::-webkit-scrollbar {
    width: 12px;
    background-color: #1f1d2b;
}

.players-view::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    background-color: #515b89;
}

.players-view .videos-container {
    position: relative;
    padding: 0 40px;
}

.players-view .videos-container video {
    max-width: 900px;
    margin: 0 auto;
    display: block;
}
</style>
