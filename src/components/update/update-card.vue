<!-- @format -->
<template>
    <div class="update-card">
        <a :href="update.link" target="_blank"><img :src="update.image" class="logo" /></a>
        <div class="date">{{ update.date }}</div>
    </div>
</template>

<script>
export default {
    name: 'update-card',
    components: {},

    props: {
        update: {
            type: Object,
            required: true,
        },
    },
};
</script>

<style>
.update-card {
    max-width: 333px;
    color: #fff;
    padding: 8px;
    position: relative;
}

.explore-updates .update .date {
    position: absolute;
    top: 0;
    left: 0;
    padding: 5px;
    font-size: 10px;
    background-color: #3eb489;
}
</style>
