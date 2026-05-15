<!-- @format -->
<template>
    <div class="add-creator">
        <h1>Add Creator</h1>
        <div class="form">
            <div>
                <v-text-field
                    v-model="contentCreator.name"
                    dark
                    type="text"
                    name="name"
                    placeholder="Creator Name"
                />

                <v-text-field
                    v-if="!contentCreator.logoUrl"
                    id="import-image"
                    v-model="contentCreator.logoUrl"
                    dark
                    type="text"
                    placeholder="Logo Url"
                />
                <div v-if="contentCreator.logoUrl" class="creator-img-container">
                    <img :src="contentCreator.logoUrl" class="creator-img" />
                    <v-btn @click="contentCreator.logoUrl = ''">X</v-btn>
                </div>

                <v-text-field
                    v-model="contentCreator.youtubeUrl"
                    dark
                    type="text"
                    name="youtubeChannel"
                    placeholder="Youtube Channel"
                />
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addCreator()">Add</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import CreatorsService from '@/services/creators-service';
import moment from 'moment';

export default {
    name: 'NewCreator',
    components: {},
    data() {
        return {
            contentCreator: {
                name: null,
                logoUrl: null,
                youtubeUrl: null,
            },
        };
    },
    computed: {
        timestamp: function () {
            return moment().format();
        },
    },
    mounted() {
        this.getCreators();
    },
    methods: {
        async addCreator() {
            await CreatorsService.addCreator({
                Name: this.contentCreator.name,
                LogoUrl: this.contentCreator.logoUrl,
                YoutubeUrl: this.contentCreator.youtubeUrl,
            });
            this.$emit('closeModal');
        },

        async getCreators() {
            const response = await CreatorsService.fetchCreators();
            this.creators = response.data.creators;
        },

        collectCreatorIds() {
            this.creatorIds = this.selectedCreators.map((x) => x._id);
        },
    },
};
</script>
<style type="text/css">
.add-creator h1 {
    color: #fff;
}

.add-creator input {
    margin-bottom: 10px;
    border: 0;
}

.add-creator .submit-btn {
    margin-top: 20px;
}

.add-creator .creator-img-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.add-creator .creator-img-container .creator-img {
    max-width: 175px;
    border-radius: 50%;
    margin: 0 auto;
    border: 5px solid #000;
}
</style>
