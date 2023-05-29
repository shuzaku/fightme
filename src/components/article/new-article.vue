<!-- @format -->
<template>
    <div class="new-article">
        <h1>Add Article</h1>
        <div class="form">
            <div class="article-container">
                <div v-if="imageUrl" class="article-img-container">
                    <img :src="imageUrl" class="article-img" />
                    <v-btn @click="imageUrl = ''">X</v-btn>
                </div>
                <input
                    v-model="articleTitle"
                    type="text"
                    name="Title"
                    placeholder="Article Title"
                />
                <input
                    id="import-image"
                    v-model="imageUrl"
                    type="text"
                    placeholder="Article Image Url"
                />
                <quill-editor ref="myQuillEditor" v-model="content" />
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addArticle()">Submit</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import ArticlesService from '@/services/articles-service';

export default {
    name: 'NewArticle',
    props: {
        accountId: {
            type: String,
            default: null,
        },
    },
    components: {},

    data() {
        return {
            imageUrl: '',
            articleTitle: '',
            content: null,
        };
    },

    created() {},

    methods: {
        async addArticle() {
            await ArticlesService.addArticle({
                Title: this.articleTitle,
                FeaturedImage: this.imageUrl,
                Content: this.content,
                AuthorId: this.accountId,
            });

            this.$emit('closeModal');
        },
    },
};
</script>
<style type="text/css"></style>
