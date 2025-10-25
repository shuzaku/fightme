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
    max-width: 200px;
    color: #fff;
    position: relative;
}

.explore-updates .update .date {
    position: absolute;
    top: -10px;
    left: -10px;
    padding: 5px;
    font-size: 10px;
    background-color: #3eb489;
}
</style>
