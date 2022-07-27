<!-- @format -->
<template>
    <div class="sidebar">
        <follows :account="account" />
        <div class="social-media">
            <div class="svg-container">
                <a href="https://www.youtube.com/channel/UCEQbjKp4CDP1JzrzAcQEh8Q" target="_blank">
                    <font-awesome-icon :icon="['fab', 'youtube']" />
                </a>
                <a href="https://twitter.com/fightersedgefgc" target="_blank">
                    <font-awesome-icon :icon="['fab', 'twitter']" />
                </a>
                <a href="https://www.tiktok.com/@fighters_edge?lang=en" target="_blank">
                    <font-awesome-icon :icon="['fab', 'tiktok']" />
                </a>
                <a href="https://www.instagram.com/fighters_edge_fgc/" target="_blank">
                    <font-awesome-icon :icon="['fab', 'instagram']" />
                </a>
                <a href="https://discord.gg/n373TGP727" target="_blank">
                    <font-awesome-icon :icon="['fab', 'discord']" />
                </a>
            </div>
        </div>
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
    width: 175px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.sidebar .svg-container {
    display: flex;
    justify-content: space-between;
    max-width: 150px;
}

.sidebar .svg-container path {
    fill: #3eb489;
}
</style>
