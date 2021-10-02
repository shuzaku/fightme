<!-- @format -->
<template>
    <div class="counter">
        <div class="player1">
            <h2>Player 1</h2>
            <div class="stat">
                <button class="subtract" @click="player1.counterHit--">-</button>
                <button class="add" @click="player1.counterHit++">+</button
                >{{ player1.counterHit }} Counter Hits
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.burst--">-</button>
                <button class="add" @click="player1.burst++">+</button>{{ player1.burst }} Bursts
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.goldBurst--">-</button>
                <button class="add" @click="player1.goldBurst++">+</button
                >{{ player1.goldBurst }} Gold Burst
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.bars--">-</button>
                <button class="add" @click="player1.bars++">+</button>{{ player1.bars }} Bars
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.barsUsed--">-</button>
                <button class="add" @click="player1.barsUsed++">+</button
                >{{ player1.barsUsed }} Bars Used
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.rrc--">-</button>
                <button class="add" @click="player1.rrc++">+</button>{{ player1.rrc }} RRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.yrc--">-</button>
                <button class="add" @click="player1.yrc++">+</button>{{ player1.yrc }} YRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.brc--">-</button>
                <button class="add" @click="player1.brc++">+</button>{{ player1.brc }} BRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.prc--">-</button>
                <button class="add" @click="player1.prc++">+</button>{{ player1.prc }} PRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.overdrives--">-</button>
                <button class="add" @click="player1.overdrives++">+</button
                >{{ player1.overdrives }} Overdrives
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.throws--">-</button>
                <button class="add" @click="player1.throws++">+</button>{{ player1.throws }} Throws
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.tech--">-</button>
                <button class="add" @click="player1.tech++">+</button>{{ player1.tech }} Techs
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.roundsWon--">-</button>
                <button class="add" @click="player1.roundsWon++">+</button
                >{{ player1.roundsWon }} Rounds Won
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.matchesWon--">-</button>
                <button class="add" @click="player1.matchesWon++">+</button
                >{{ player1.matchesWon }} Matches Won
            </div>
        </div>
        <div class="player2">
            <h2>Player 2</h2>
            <div class="stat">
                <button class="subtract" @click="player2.counterHit--">-</button>
                <button class="add" @click="player2.counterHit++">+</button
                >{{ player2.counterHit }} Counter Hits
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.burst--">-</button>
                <button class="add" @click="player2.burst++">+</button>{{ player2.burst }} Bursts
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.goldBurst--">-</button>
                <button class="add" @click="player2.goldBurst++">+</button
                >{{ player2.goldBurst }} Gold Burst
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.bars--">-</button>
                <button class="add" @click="player2.bars++">+</button>{{ player2.bars }} Bars
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.barsUsed--">-</button>
                <button class="add" @click="player2.barsUsed++">+</button
                >{{ player2.barsUsed }} Bars Used
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.rrc--">-</button>
                <button class="add" @click="player2.rrc++">+</button>{{ player2.rrc }} RRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.yrc--">-</button>
                <button class="add" @click="player2.yrc++">+</button>{{ player2.yrc }} YRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player1.brc--">-</button>
                <button class="add" @click="player1.brc++">+</button>{{ player2.brc }} BRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.prc--">-</button>
                <button class="add" @click="player2.prc++">+</button>{{ player2.prc }} PRC
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.overdrives--">-</button>
                <button class="add" @click="player2.overdrives++">+</button
                >{{ player2.overdrives }} Overdrives
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.throws--">-</button>
                <button class="add" @click="player2.throws++">+</button>{{ player2.throws }} Throws
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.tech--">-</button>
                <button class="add" @click="player2.tech++">+</button>{{ player2.tech }} Techs
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.roundsWon--">-</button>
                <button class="add" @click="player2.roundsWon++">+</button
                >{{ player2.roundsWon }} Rounds Won
            </div>
            <div class="stat">
                <button class="subtract" @click="player2.matchesWon--">-</button>
                <button class="add" @click="player2.matchesWon++">+</button
                >{{ player2.matchesWon }} Matches Won
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Counters',

    data() {
        return {
            player1: {
                counterHit: 0,
                burst: 0,
                goldBurst: 0,
                bars: 0,
                barsUsed: 0,
                throws: 0,
                tech: 0,
                roundsWon: 0,
                matchesWon: 0,
                rrc: 0,
                brc: 0,
                yrc: 0,
                prc: 0,
                overdrives: 0
            },
            player2: {
                counterHit: 0,
                burst: 0,
                goldBurst: 0,
                bars: 0,
                barsUsed: 0,
                throws: 0,
                tech: 0,
                roundsWon: 0,
                matchesWon: 0,
                rrc: 0,
                brc: 0,
                yrc: 0,
                prc: 0,
                overdrives: 0
            }
        };
    },

    methods: {}
};
</script>

<style>
.counter .stat {
    color: #fff;
    margin-bottom: 10px;
}

.counter h2 {
    margin: 40px 0 20px;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 5px;
}

.counter .stat button {
    background: green;
    border-radius: 50%;
    padding: 5px 10px;
    margin-right: 10px;
}

.counter .stat button.subtract {
    background: red;
    border-radius: 50%;
    padding: 5px 10px;
    margin-right: 10px;
}
</style>
