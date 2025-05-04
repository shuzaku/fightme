<!-- @format -->
<template>
    <div class="explore-updates">
        <h3>Explore Updates</h3>
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
            const response = await updatesService.fetchUpdates();
            this.updates = response.data.updates.map((update) => {
                return {
                    id: update._id,
                    type: update.Type,
                    subType: update.SubType,
                    games: update.Games,
                    note: update.Note,
                    date: moment(update.Date).format('MM.DD.YY'),
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
.explore-updates .update {
    max-width: 333px;
    color: #fff;
    padding: 8px;
}

.explore-updates .logo {
    width: 100%;
    border: 1px solid #fff;
}

.explore-updates .updates {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.explore-updates .game {
    margin: 3px;
}

.explore-updates h3 {
    color: #fff;
}

.explore-updates .update {
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
