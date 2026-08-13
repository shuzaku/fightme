<!-- @format -->
<template>
    <div class="create-options">
        <div
            v-for="option in createOptions"
            :key="option.value"
            class="create-option"
            @click="openAddModal(option)"
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
                    name: 'montage',
                    value: 'montage',
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
                {
                    name: 'featured-match',
                    value: 'featured-match',
                    adminOnly: true,
                },
                {
                    name: 'game-update',
                    value: 'game-update',
                    adminOnly: true,
                },
                {
                    // Full page rather than a modal widget, so it routes instead.
                    name: 'tournament',
                    value: 'tournament',
                    adminOnly: true,
                    route: '/create-tournament',
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
            if (option.route) {
                this.$router.push(option.route);
                return;
            }
            eventbus.$emit('open:widget', option);
        },
    },
};
</script>

<style>
.create-options {
    color: #fff;
    background: #1c1c24;
    padding: 8px 14px;
    font-size: 11px;
    line-height: 1.35;
    border-radius: 8px;
    min-width: 110px;
}

.create-options .create-option {
    margin-bottom: 6px;
    cursor: pointer;
    text-transform: lowercase;
}

.create-options .create-option:last-child {
    margin-bottom: 0;
}
</style>
