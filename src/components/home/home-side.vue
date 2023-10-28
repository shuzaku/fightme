<!-- @format -->
<template>
    <div class="home-side">
        <div class="card" @click="navigate('/games')">
            Games
            <img
                class="controller-icon"
                :src="`https://res.cloudinary.com/shuzchef/image/upload/v1684093167/icons/qu7sea5htapglub3lzn6.png`"
            />
        </div>
        <div class="card" @click="navigate('/notes')">
            My Notes
            <img
                class="notes-icon"
                :src="`https://res.cloudinary.com/shuzchef/image/upload/v1684093170/icons/cvhtitudtxmckt2gfeqp.png`"
            />
        </div>
        <div class="card">
            FGC Content
            <img
                class="content-icon"
                :src="`https://res.cloudinary.com/shuzchef/image/upload/v1684093171/icons/xxow8flwglq1zkj03sea.png`"
            />
        </div>
        <div class="new-character">
            New Characters
            <latest-characters />
        </div>
        <div class="calendar">
            FGC Calendar
            <events />
        </div>
    </div>
</template>

<script>
import Events from '@/components/event/events';
import LatestCharacters from '@/components/character/latest-characters';

export default {
    name: 'HomeSide',

    components: {
        'latest-characters': LatestCharacters,
        events: Events,
    },

    data() {
        return {};
    },

    computed: {},

    methods: {
        navigate(route) {
            this.$router.push(route);
        },
    },

    mounted() {},

    created() {},

    beforeDestroy() {},
};
</script>

<style type="text/css">
.home-side .card {
    width: 100%;
    height: 100px;
    background: #1c1c24;
    color: #fff;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 30px;
    text-transform: uppercase;
    cursor: pointer;
}

.home-side .calendar {
    width: 100%;
    background: #1c1c24;
    color: #fff;
    padding: 20px;
    border-radius: 15px;
    color: #fff;
    font-size: 20px;
    text-transform: uppercase;
}

.home-side .new-character {
    width: 100%;
    background: #1c1c24;
    color: #fff;
    padding: 20px;
    border-radius: 15px;
    color: #fff;
    font-size: 20px;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.home-side .controller-icon {
    max-width: 60px;
    width: 100%;
    height: auto;
    filter: brightness(0) invert(1);
}

.home-side .notes-icon {
    max-width: 40px;
    width: 100%;
    height: auto;
    filter: brightness(0) invert(1);
}

.home-side .content-icon {
    max-width: 40px;
    width: 100%;
    height: auto;
    filter: brightness(0) invert(1);
}

.home-side .events,
.home-side .latest-characters {
    margin-top: 20px;
}
</style>
