<!-- @format -->
<template>
    <div class="character-recommended">
        <h3>Filter by tags:</h3>
        <tag-search
            v-model="selectedTag"
            :taggable="false"
            :multiple="false"
            @update:tags="setTags($event, combo)"
        />
    </div>
</template>

<script>
import TagsService from '@/services/tags-service';
import TagSearch from '@/components/tags/tag-search';
import { eventbus } from '@/main';

export default {
    name: 'CharacterRecommended',
    components: {
        'tag-search': TagSearch
    },

    props: {
        characterId: {
            type: String,
            default: ''
        }
    },

    data() {
        return {
            selectedTag: null,
            tags: null
        };
    },

    watch: {
        selectedTag() {
            eventbus.$emit('filter-tag:update', this.selectedTag);
        }
    },

    mounted() {
        this.getTags();
    },

    methods: {
        async getTags() {
            const response = await TagsService.fetchTags();
            this.tags = response.data.tags.map(tag => {
                return {
                    id: tag._id,
                    name: tag.TagName
                };
            });
            this.selectedTags = this.tags[0];
        },

        setTags(tag) {
            this.selectedTag = tag.id;
        }
    }
};
</script>
<style type="text/css">
.character-recommended {
    padding: 100px 0 50px;
    color: #fff;
}

.character-recommended h3 {
    margin-bottom: 20px;
}
</style>
