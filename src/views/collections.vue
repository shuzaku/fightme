<!-- @format -->
<template>
    <div class="collections">
        <loading v-if="loading"></loading>

        <div v-else class="collection-cards">
            <div
                v-for="(collection, index) in collections"
                :key="index"
                class="card"
                @click="routeToCollection(collection.id)"
            >
                {{ collection.name }}
            </div>
        </div>
    </div>
</template>

<script>
import CollectionsService from '@/services/collections-service';
import Loading from '@/components/common/loading';

export default {
    name: 'Collections',

    components: {
        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            loading: true,
            collections: null,
        };
    },

    computed: {},

    watch: {},

    mounted() {
        this.getCollections();
    },

    beforeDestroy() {},

    methods: {
        async getCollections() {
            this.loading = true;
            var searchQuery = [
                {
                    queryName: 'OwnerId',
                    queryValue: this.account.id,
                },
            ];

            var queryParameter = {
                searchQuery: searchQuery,
            };

            const response = await CollectionsService.queryCollections(queryParameter);
            this.collections = response.data.collections.map((collection) => {
                return {
                    id: collection._id,
                    name: collection.Name,
                    ownerId: collection.OwnerId,
                    videos: collection.Videos,
                };
            });

            if (this.value) {
                this.value.forEach((id) => {
                    this.selectedCollection = this.collections.filter(
                        (collection) => collection.id === id
                    );
                });
            }

            this.loading = false;
        },

        routeToCollection(collectionId) {
            this.$router.push(`/collection/${collectionId}`);
        },
    },
};
</script>

<style>
.collections {
    width: 100%;
    padding-top: 50px;
}

.collections .collection-cards {
    display: flex;
}

.collections .card {
    background: #1c1c24;
    height: 200px;
    width: 200px;
    margin: 20px;
    padding: 20px;
    color: #fff;
    cursor: pointer;
}
</style>
