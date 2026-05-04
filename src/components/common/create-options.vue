<!-- @format -->
<template>
    <div class="create-options">
        <div
            v-for="option in createOptions"
            :key="option.value"
            @click="openAddModal(option)"
            class="create-option"
        >
            {{ option.name }}
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    components: {},

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            allCreateOptions: [
                {
                    name: 'match',
                    value: 'match',
                    adminOnly: false,
                },
                {
                    name: 'combo',
                    value: 'combo',
                    adminOnly: false,
                },
                {
                    name: 'game',
                    value: 'game',
                    adminOnly: true,
                },
                {
                    name: 'player',
                    value: 'player',
                    adminOnly: true,
                },
                {
                    name: 'creator',
                    value: 'creator',
                    adminOnly: true,
                },
                {
                    name: 'character',
                    value: 'character',
                    adminOnly: true,
                },
                {
                    name: 'featured-video',
                    value: 'featured-video',
                    adminOnly: true,
                },
            ],
        };
    },

    computed: {
        isAdmin() {
            return (
                this.account &&
                this.account.role === 'admin'
            );
        },
        createOptions() {
            return this.allCreateOptions.filter((option) => {
                // If option requires admin, check if user is admin
                if (option.adminOnly) {
                    return this.isAdmin;
                }
                // Otherwise, show to everyone
                return true;
            });
        },
    },

    created() {},

    beforeDestroy() {},

    methods: {
        openAddModal(option) {
            eventbus.$emit('open:widget', option);
        },
    },
};
</script>

<style>
.create-options {
    color: #fff;
    background: #1c1c24;
    padding: 10px 20px;
}

.create-options .create-option {
    margin-bottom: 10px;
    cursor: pointer;
}
</style>
