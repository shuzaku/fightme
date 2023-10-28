<!-- @format -->
<template>
    <div class="edit-creators">
        <h1>Edit Creator</h1>
        <v-text-field
            id="import-image"
            type="text"
            v-model="creator.logo"
            placeholder="image Url"
            v-if="!creator.logo"
        />
        <div class="creator-img-container" v-if="creator.logo">
            <img :src="creator.logo" class="creator-img" />
            <v-btn @click="creator.logo = ''">X</v-btn>
        </div>
        <div class="form">
            <div>
                <input type="text" name="name" placeholder="Creator Name" v-model="creator.name" />
            </div>
            <div>
                <input
                    type="text"
                    name="youtubeChannel"
                    placeholder="Youtube Channel"
                    v-model="creator.youtubeChannel"
                />
            </div>
            <div>
                <button class="app_post_btn" @click="updateCreator">Update</button>
            </div>
        </div>
    </div>
</template>

<script>
import CreatorsService from '@/services/creators-service';
import moment from 'moment';

export default {
    name: 'EditCreator',

    components: {
        'creator-search': CreatorSearch,
    },

    data() {
        return {
            creator: {
                name: null,
                youtubeChannel: null,
                updatedDate: null,
                creatorLogo: null,
            },
            selectedCharacter: null,
        };
    },
    methods: {
        async getCreator() {
            const response = await CreatorsService.getCreator({
                id: this.$route.params.id,
            });
            this.creator = response.data.map((creator) => {
                return {
                    name: response.data.Name,
                    youtubeChannel: response.data.YoutubeChannel,
                    creatorLogo: response.data.Logo,
                    createdDate: response.data.CreatedDate,
                };
            });
        },

        async updateCreator() {
            await CreatorsService.updateCreator({
                id: this.$route.params.id,
                Name: this.creator.name,
                YoutubeChannel: this.creator.youtubeChannel,
                UpdatedDate: this.creator.timestamp,
                Logo: this.creator.Logo,
            });
            this.$router.push({ name: 'Creators' });
        },

        setCreator(creator) {
            this.creator = creator;
        },
    },

    computed: {
        timestamp: function () {
            return moment().format();
        },
    },

    created() {
        this.getCreator();
    },
};
</script>
<style type="text/css">
.edit-creators {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.edit-creators .form input,
.edit-creators .form textarea,
.edit-creators .multiselect-container .multiselect {
    width: 100%;
    padding: 10px;
    border: 1px solid #e0dede;
    outline: none;
    font-size: 12px;
    margin: 0 auto;
}

.edit-creators .game-search {
    margin: 0;
}

.edit-creators .app_post_btn {
    width: 100%;
}
.edit-creators .form div {
    margin: 20px 0;
}

.edit-creators .form .multiselect__select {
    margin: 0;
}

.edit-creators .multiselect--active .multiselect__tags-wrap {
    display: none;
}

.edit-creators .multiselect__tags,
.edit-creators .multiselect__select {
    margin: 0;
}

.edit-creators .creator-games {
    list-style: none;
    padding: 5px;
    border-radius: 5px;
    margin: 5px;
    background: green;
    color: #fff;
    display: block;
}

.edit-creators .list-of-games {
    display: flex;
    flex-direction: row;
    width: 500px;
    margin: 0 auto;
}

.edit-creators .creator-img-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.edit-creators .creator-img-container .creator-img {
    max-width: 175px;
    border-radius: 50%;
    margin: 0 auto;
    border: 5px solid #000;
}
</style>
