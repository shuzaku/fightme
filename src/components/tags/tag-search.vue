<!-- @format -->
<template>
    <div class="tags-search">
        <multiselect
            v-model="selectedTags"
            :options="tags"
            :clear-on-select="false"
            :close-on-select="!multiple"
            :multiple="multiple"
            :taggable="taggable"
            placeholder="Search or add a Tag"
            label="name"
            @tag="addTag"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} tags selected
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import TagsService from '@/services/tags-service';

export default {
    name: 'tags-search',
    props: {
        taggable: {
            type: Boolean,
            default: true
        },
        multiple: {
            type: Boolean,
            default: true
        },
        value: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            tags: [],
            selectedTags: null
        };
    },

    watch: {
        selectedTags() {
            this.$emit('update:tags', this.selectedTags);
        }
    },

    mounted() {
        this.selectedTags = this.value;
        this.getTags();
    },

    methods: {
        async addTag(newTag) {
            await TagsService.addTag({
                TagName: newTag,
                CreatedDate: this.timestamp,
                UpdatedDate: null
            });
            this.getTags();
        },

        async getTags() {
            const response = await TagsService.fetchTags();
            this.tags = response.data.tags.map(tag => {
                return {
                    id: tag._id,
                    name: tag.TagName
                };
            });
        }
    }
};
</script>
<style type="text/css"></style>
