<!-- @format -->
<template>
    <div class="explore-updates">
        <h2>📰 Latest Update</h2>
        <div class="updates updates--grid">
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
    name: 'ExploreUpdate',
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
.explore-updates .updates--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
    gap: clamp(12px, 2.5vw, 18px);
    width: 100%;
    min-width: 0;
    margin: 0 0 20px 0;
    align-items: stretch;
}

.explore-updates .update {
    display: flex;
    min-width: 0;
    max-width: 100%;
    width: 100%;
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

@media (max-width: 600px) {
    .explore-updates .updates--grid {
        grid-template-columns: 1fr;
    }
}
</style>
