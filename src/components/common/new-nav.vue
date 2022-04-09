<!-- @format -->
<template>
    <div class="sidebar">
        <follows :account="account" />
    </div>
</template>

<script>
import Follows from '@/components/account/follows';

export default {
    components: {
        follows: Follows,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {};
    },

    created() {},

    methods: {},
};
</script>

<style>
.sidebar {
    width: 200px;
}
</style>
