<!-- @format -->
<template>
    <div class="character-recommended">
        <h3>Filter by tags:</h3>
        <tag-search :taggable="false" :multiple="false" @update:tags="setTags($event)" />
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
            selectedTag: [],
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
            this.selectedTags = null;
        },

        setTags(tag) {
            this.selectedTag = [];
            this.selectedTag.push(tag.id);
        }
    }
};
</script>
<style type="text/css">
.character-recommended {
    color: #fff;
    display: flex;
    align-items: center;
    padding: 0 20px;
    margin-top: 20px;
}

.character-recommended h3 {
    margin-bottom: 20px;
    margin-right: 20px;
}

.character-recommended .tag-search {
    width: 300px;
}

.character-recommended .multiselect__option::after {
    display: none;
}
</style>
