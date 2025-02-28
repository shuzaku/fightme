<!-- @format -->
<template>
    <div class="events" @click="navigate()">
        <h3>Explore Events</h3>
        <div class="event-list">
            <div v-for="event in events" :key="event.name" class="event">
                <event-card :event="event" />
            </div>
        </div>
    </div>
</template>

<script>
import EventCard from '@/components/event/event-card';
import moment from 'moment';

export default {
    components: {
        'event-card': EventCard,
    },

    name: 'events',

    props: {},

    data() {
        return {
            events: [
                {
                    name: 'Street Fighter 6 Release',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1683495616/events/af2ikffo9teutps9xd23.jpg',
                    date: '2023-06-02T00:00:00.000+00:00',
                },
                {
                    name: 'CEO Gaming',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1683496039/events/o5eefi4jeyxtip366lr2.jpg',
                    date: '2023-06-23T00:00:00.000+00:00',
                },
                {
                    name: 'Combo Braker',
                    imageUrl:
                        'https://res.cloudinary.com/shuzchef/image/upload/v1683496130/events/p6vqtixqmq4nvclbyjmj.jpg',
                    date: '2023-05-26T00:00:00.000+00:00',
                },
            ],
        };
    },

    mounted() {
        this.getData();
    },

    methods: {
        getData() {
            var events = this.events;
            this.events = events.map((event) => {
                return {
                    name: event.name,
                    imageUrl: event.imageUrl,
                    date: event.date,
                    daysLeft: this.getDateDiff(event.date),
                };
            });
        },

        getDateDiff(date) {
            var today = moment();
            var diff = moment(date).diff(today, 'days');
            return diff;
        },
    },
};
</script>
<style type="text/css">
.events {
    width: 100%;
}

.events h3 {
    color: #fff;
    margin-bottom: 10px;
}
.event-list {
    display: flex;
    margin-right: 5px;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
}
</style>
