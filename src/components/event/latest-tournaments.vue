<!-- @format -->
<template>
    <div class="tournaments" @click="navigate()">
        <h3>Latest tournaments:</h3>
        <div class="tournament-list">
            <div v-for="tournament in tournaments" :key="tournament.name" class="tournament">
                <tournament-card :tournament="tournament" />
            </div>
        </div>
    </div>
</template>

<script>
import TournamentCard from '@/components/event/tournament-card';
import moment from 'moment';

export default {
    components: {
        'tournament-card': TournamentCard,
    },

    name: 'tournaments',

    props: {},

    data() {
        return {
            tournaments: [
                {
                    name: 'CEO Gaming',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1683496039/events/o5eefi4jeyxtip366lr2.jpg',
                    date: moment('2023-06-23T00:00:00.000+00:00').format('MMM Do YY'),
                },
                {
                    name: 'Combo Braker',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1683496130/events/p6vqtixqmq4nvclbyjmj.jpg',
                    date: moment('2023-05-26T00:00:00.000+00:00').format('MMM Do YY'),
                },
            ],
        };
    },

    mounted() {
        this.getData();
    },

    methods: {
        getData() {
            var tournaments = this.tournaments;
            this.tournaments = tournaments.map((event) => {
                return {
                    name: event.name,
                    imageUrl: event.imageUrl,
                    date: event.date,
                };
            });
        },
    },
};
</script>
<style type="text/css">
.tournaments {
    width: 100%;
}

.tournaments h3 {
    color: #fff;
    margin-bottom: 10px;
}
.tournaments .tournament-list {
    display: flex;
    margin-right: 5px;
    flex-wrap: wrap;
    width: 100%;
}
</style>
