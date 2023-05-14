<!-- @format -->
<template>
    <div class="match-timestamps">
        <div class="heading">
            <h2>Timestamps</h2>
            <div class="players">
                <div class="player1">
                    <h3>Player 1</h3>
                    <h4>Counters</h4>
                    <div class="counters label">
                        <div v-for="(timestamp, index) in player1Counter" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                    <h4>Reversal</h4>
                    <div class="reversals label">
                        <div v-for="(timestamp, index) in player1Reversal" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                    <h4>Punish</h4>
                    <div class="punishes label">
                        <div v-for="(timestamp, index) in player1Punish" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                    <h4>Just</h4>
                    <div class="just label">
                        <div v-for="(timestamp, index) in player1Just" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
                <div class="player2">
                    <h3>Player 2</h3>
                    <h4>Counters</h4>
                    <div class="counters label">
                        <div v-for="(timestamp, index) in player2Counter" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                    <h4>Reversal</h4>
                    <div class="reversals label">
                        <div v-for="(timestamp, index) in player2Reversal" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                    <h4>Punish</h4>
                    <div class="punishes label">
                        <div v-for="(timestamp, index) in player2Punish" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                    <h4>Just</h4>
                    <div class="just label">
                        <div v-for="(timestamp, index) in player2Just" :key="index">
                            <a @click="seekToTimeStamp(timestamp.s)">{{
                                timestamp.formattedTime
                            }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';

export default {
    name: 'MatchBox',

    props: {},

    data() {
        return {
            player1TimeStamps: [],
            player2TimeStamps: [],
            baseUrl: 'https://youtu.be/oCVezSyG94',
            timestamps: [
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=11', s: '11' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=13', s: '13' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=14', s: '14' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=14', s: '14' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=15', s: '15' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=15', s: '15' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=18', s: '18' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=19', s: '19' },
                { player: 2, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=27', s: '27' },
                { player: 2, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=28', s: '28' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=34', s: '34' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=35', s: '35' },
                { player: 2, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=41', s: '41' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=53', s: '53' },
                { player: 2, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=55', s: '55' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=73', s: '73' },
                { player: 2, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=73', s: '73' },
                {
                    player: 1,
                    label: 'reversal',
                    url: 'https://youtu.be/oCVezSyG94s?t=74',
                    s: '74',
                },
                { player: 2, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=74', s: '74' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=74', s: '74' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=81', s: '81' },
                { player: 1, label: 'punish', url: 'https://youtu.be/oCVezSyG94s?t=82', s: '82' },
                { player: 1, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=86', s: '86' },
                { player: 1, label: 'counter', url: 'https://youtu.be/oCVezSyG94s?t=87', s: '87' },
                {
                    player: 2,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=113',
                    s: '113',
                },
                {
                    player: 1,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=122',
                    s: '122',
                },
                {
                    player: 1,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=123',
                    s: '123',
                },
                {
                    player: 2,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=132',
                    s: '132',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=145',
                    s: '145',
                },
                {
                    player: 2,
                    label: 'reversal',
                    url: 'https://youtu.be/oCVezSyG94s?t=147',
                    s: '147',
                },
                {
                    player: 2,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=150',
                    s: '150',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=155',
                    s: '155',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=156',
                    s: '156',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=160',
                    s: '160',
                },
                {
                    player: 1,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=167',
                    s: '167',
                },
                {
                    player: 1,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=168',
                    s: '168',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=186',
                    s: '186',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=187',
                    s: '187',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=192',
                    s: '192',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=193',
                    s: '193',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=195',
                    s: '195',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=196',
                    s: '196',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=202',
                    s: '202',
                },
                {
                    player: 1,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=203',
                    s: '203',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=217',
                    s: '217',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=219',
                    s: '219',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=222',
                    s: '222',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=223',
                    s: '223',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=240',
                    s: '240',
                },
                {
                    player: 2,
                    label: 'counter',
                    url: 'https://youtu.be/oCVezSyG94s?t=241',
                    s: '241',
                },
                {
                    player: 2,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=242',
                    s: '242',
                },
                {
                    player: 2,
                    label: 'punish',
                    url: 'https://youtu.be/oCVezSyG94s?t=245',
                    s: '245',
                },
            ],
        };
    },

    computed: {
        player1Counter() {
            return this.player1TimeStamps.filter((t) => t.label === 'counter');
        },
        player1Punish() {
            return this.player1TimeStamps.filter((t) => t.label === 'punish');
        },
        player1Reversal() {
            return this.player1TimeStamps.filter((t) => t.label === 'reversal');
        },
        player1Just() {
            return this.player1TimeStamps.filter((t) => t.label === 'just');
        },
        player2Counter() {
            return this.player2TimeStamps.filter((t) => t.label === 'counter');
        },
        player2Punish() {
            return this.player2TimeStamps.filter((t) => t.label === 'punish');
        },
        player2Reversal() {
            return this.player2TimeStamps.filter((t) => t.label === 'reversal');
        },
        player2Just() {
            return this.player2TimeStamps.filter((t) => t.label === 'just');
        },
    },

    mounted() {
        this.convertSeconds();
        this.setTimestamps();
    },

    methods: {
        convertSeconds() {
            this.timestamps.forEach((t) => {
                t.formattedTime = moment.utc(t.s * 1000).format('mm:ss');
            });
        },
        setTimestamps() {
            this.player1TimeStamps = this.timestamps.filter((t) => t.player === 1);
            this.player2TimeStamps = this.timestamps.filter((t) => t.player === 2);
        },

        seekToTimeStamp(second) {
            this.$emit('seek', second);
        },
    },
};
</script>

<style type="text/css">
.match-timestamps {
    margin: 60px 0;
    display: flex;
    /* background-image: linear-gradient(#515b89, #171b33); */
    background: #242832;
    border: 5px solid #242832;
    border-radius: 15px;
    margin-bottom: 30px;
    position: relative;
    cursor: pointer;
    width: 100%;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.match-timestamps h1,
.match-timestamps h2,
.match-timestamps h3,
.match-timestamps h4 {
    color: #fff;
}

.match-timestamps h3 {
    margin-bottom: 10px;
    margin-top: 10px;
}

.match-timestamps .players,
.match-timestamps .label {
    display: flex;
}

.match-timestamps .label div {
    margin-right: 5px;
}

.match-timestamps .players {
    display: flex;
    justify-content: space-around;
}

.match-timestamps .label {
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.match-timestamps .player1,
.match-timestamps .player2 {
    max-width: 45%;
}
</style>
