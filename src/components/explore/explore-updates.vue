<!-- @format -->
<template>
    <div class="explore-updates">
        <h2>📰 Latest Update</h2>
        <div class="updates">
            <div v-for="update in updates" :key="update.id" class="update">
                <update-card :update="update" />
            </div>
        </div>
    </div>
</template>

<script>
import updatesService from '@/services/updates-service';
import updateCard from '@/components/update/update-card';
import moment from 'moment';

export default {
    name: 'explore-update',
    components: {
        'update-card': updateCard,
    },

    props: {},

    data() {
        return {
            updates: [],
        };
    },
    mounted() {
        this.getupdates();
    },

    methods: {
        async getupdates() {
            const response = await updatesService.fetchRecentUpdates();
            this.updates = response.data.updates.map((update) => {
                return {
                    id: update._id,
                    type: update.Type,
                    subType: update.SubType,
                    games: update.Games,
                    note: update.Note,
                    date: moment(update.Date).add('days', 1).local().format('MM.DD.YY'),
                    image: update.Image,
                    link: update.Link,
                };
            });
        },

        navigate(id) {
            this.$router.push(`/game/${id}`);
        },
    },
};
</script>

<style>
.explore-updates .updates {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    gap: 0;
    margin: -12px;
    margin-bottom: 20px;
}

.explore-updates .update {
    display: flex;
    flex: 0 0 auto;
    position: relative;
}

.explore-updates h2 {
    color: #fff;
    margin-bottom: 48px;
    font-size: 28px;
    font-weight: 700;
    font-family: 'Roboto', sans-serif;
}

.explore-updates h3 {
    color: #fff;
    margin-bottom: 24px;
}

.mobile .explore-updates .update {
    max-width: none;
}
</style>
