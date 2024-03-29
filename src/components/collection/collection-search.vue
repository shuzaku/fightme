<!-- @format -->
<template>
    <div class="collection-search">
        <multiselect
            v-if="collections"
            v-model="selectedCollection"
            :options="collections"
            :close-on-select="true"
            :preserve-search="true"
            :taggable="taggable"
            :multiple="multiple"
            track-by="id"
            placeholder="Select or Add Collections"
            tag-placeholder="Add this as new tag"
            label="name"
            @tag="addCollection"
            @remove="remove()"
        >
            <template slot="selection" slot-scope="{ values, search, isOpen }"
                ><span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen"
                    >{{ values.length }} options selected</span
                ></template
            >
        </multiselect>
    </div>
</template>

<script>
import CollectionsService from '@/services/collections-service';
import AccountsService from '@/services/accounts-service';
import { eventbus } from '@/main';

export default {
    name: 'CollectionSearch',
    props: {
        taggable: {
            type: Boolean,
            default: true
        },
        account: {
            type: Object,
            default: null
        },
        multiple: {
            type: Boolean,
            default: false
        },
        value: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            collections: [],
            selectedCollection: [],
            newCollectionId: null,
            skip: 0
        };
    },

    watch: {
        selectedCollection() {
            this.$emit('update:collection', this.selectedCollection);
        }
    },

    created() {
        eventbus.$on('collection:update', this.getCollections);
    },

    beforeDestroy() {
        eventbus.$off('collection:update', this.getCollections);
    },

    mounted() {
        if(this.account.id){
            this.getCollections();
        }
    },

    methods: {
        async addCollection(newCollection) {
            var response = await CollectionsService.addCollection({
                Name: newCollection,
                OwnerId: this.account.id
            });

            this.newCollectionId = response.data.collections._id;

            this.account.collections.push(this.newCollectionId);

            var accountRequest = {
                id: this.account.id,
                Collections: this.account.collections
            };

            await AccountsService.patchAccount(accountRequest);
        },

        async getCollections() {
            var searchQuery = [
                {
                    queryName: 'OwnerId',
                    queryValue: this.account.id
                }
            ];

            var queryParameter = {
                searchQuery: searchQuery
            };

            const response = await CollectionsService.queryCollections(queryParameter);
            this.collections = response.data.collections.map(collection => {
                return {
                    id: collection._id,
                    name: collection.Name,
                    ownerId: collection.OwnerId,
                    videos: collection.Videos
                };
            });

            if (this.value) {
                this.value.forEach(id => {
                    this.selectedCollection = this.collections.filter(
                        collection => collection.id === id
                    );
                });
            }
        }
    }
};
</script>
<style type="text/css">
.collection-search .multiselect {
    margin-bottom: 0px;
}

.collection-search .multiselect .multiselect__tags {
    background: transparent;
    padding: 0;
}

.collection-search .multiselect .multiselect__tags-wrap {
    padding: 5px 10px;
    display: block;
}

.collection-search .multiselect .multiselect__tag {
    margin: 0;
    padding: 5px 25px 5px 10px;
}

.collection-search .multiselect .multiselect__input {
    padding: 10px 20px;
    border-radius: 0px;
}

.collection-search .multiselect .multiselect__select:before {
    position: relative;
    right: 0;
    top: 7px;
    color: #999;
    margin-top: 4px;
    border: none;
    content: '+';
    font-size: 30px;
    display: none;
}

.collection-search .multiselect__placeholder {
    padding: 5px 10px;
    position: relative;
    top: 5px;
}

.collection-search .multiselect__single {
    margin-bottom: 0;
    padding: 10px;
}

.collection-search .multiselect__option::after {
    display: none;
}

.collection-search .multiselect__option--selected {
    background: #3eb489;
    color: #fff;
}
</style>
