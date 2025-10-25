<!-- @format -->
<template>
    <div class="tournament-card">
        <div class="container" @click="navigate(tournament.id)">
            <a target="_blank">
                <img :src="tournament.logoUrl" class="logo" />
            </a>
            <div v-if="!tournament.isFinished" class="date">{{ tournament.eventDate }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'tournament-card',
    components: {},

    props: {
        tournament: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {};
    },

    methods: {
        navigate(id) {
            if (this.tournament.isFinished) {
                this.$router.push(`/tournament/${id}`);
            } else {
                window.location.replace(this.tournament.bracketUrl, '_blank');
            }
        },
    },
};
</script>

<style>
.tournament-card {
    max-width: 175px;
    color: #fff;
    cursor: pointer;
}

.tournament-card .logo {
    width: 175px;
    height: auto;
    border: 1px solid #fff;
    max-width: 100%;
}

.tournament-card {
    position: relative;
}

.tournament-card .date {
    position: absolute;
    top: 0;
    left: 0;
    padding: 5px;
    font-size: 10px;
    background-color: #3eb489;
}

.mobile .tournament {
    max-width: 48%;
}
</style>
