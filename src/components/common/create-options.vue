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

    props: {},

    data() {
        return {
            createOptions: [
                {
                    name: 'video',
                    value: 'video',
                },
                {
                    name: 'game',
                    value: 'game',
                },
                {
                    name: 'player',
                    value: 'player',
                },
                {
                    name: 'creator',
                    value: 'creator',
                },
                {
                    name: 'character',
                    value: 'character',
                },
                {
                    name: 'tournament',
                    value: 'tournament',
                },
                {
                    name: 'article',
                    value: 'article',
                },
                {
                    name: 'event',
                    value: 'event',
                },
            ],
        };
    },

    computed: {},

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
