<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'collection-select-menu-item']">
        <ul class="collections">
            <li
                v-for="collection in collections"
                :key="collection.id"
                :class="[{ selected: collection.selected }]"
                @click="selectCollection(collection)"
            >
                {{ collection.name }}
            </li>
        </ul>
    </div>
</template>

<script>
import CollectionsService from '@/services/collections-service';

export default {
    name: 'collection-select',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        },
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            collections: [],
            isOpen: false,
            selectedItem: null
        };
    },

    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    mounted() {
        this.getCollections();
        this.isOpen = this.initialOpen;
    },

    methods: {
        async getCollections() {
            var searchQuery = [
                {
                    queryName: 'OwnerId',
                    queryValue: this.account.id
                }
            ];

            var queryParameter = {
                skip: this.skip,
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
        },
        selectCollection(collection) {
            this.$router.push(`/collection/${collection.id}`);
        },

        open() {
            this.isOpen = !this.isOpen;
        }
    }
};
</script>
<style type="text/css">
.collection-select-menu-item .logo-img {
    width: 50px;
    height: auto;
    border-radius: 50%;
}

.collection-select-menu-item li {
    list-style: none;
    font-weight: 400;
    cursor: pointer;
    padding: 10px 10px;
}

.collection-select-menu-item li:hover,
.collection-select-menu-item li.selected {
    background: #565656;
}

.collection-select-menu-item li:last-child {
    margin-bottom: 0px;
}

.collection-select-menu-item .collections {
    background: #404040;
}

.collection-select-menu-item .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.collection-select-menu-item.opened .mdi-chevron-down {
    transform: rotate(180deg);
    transition: all 0.3s linear;
}
</style>
