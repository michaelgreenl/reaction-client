<script setup>
import { ref, onBeforeUnmount } from 'vue';
import Settings from '@/components/Settings.vue';
import Game from '@/components/Game.vue';
import Button from '@/components/Button.vue';

const gameActive = ref(false);
const showSettings = ref(false);
const score = ref(0);
const gamePlayed = ref(false);

const elapsedMs = ref(0);
let timerId;
let startTimestamp = 0;

function startTimer() {
    elapsedMs.value = 0;
    startTimestamp = performance.now();
    timerId = setInterval(() => {
        elapsedMs.value = performance.now() - startTimestamp;
    }, 10);
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function startGame() {
    score.value = 0;
    showSettings.value = false;
    gamePlayed.value = true;
    gameActive.value = true;
    startTimer();
}

function handleEndGame() {
    stopTimer();
    gameActive.value = false;
}

function handleScoreIncrement() {
    score.value += 1;
}

onBeforeUnmount(() => {
    stopTimer();
});
</script>

<template>
    <Button v-if="!gameActive" @click="startGame" text="Start" />
    <Button v-if="!gameActive" @click="showSettings = !showSettings" text="Settings" />
    <Game
        v-if="gameActive"
        :gameActive="gameActive"
        :score="score"
        :time="elapsedMs"
        @endGame="handleEndGame"
        @incrementScore="handleScoreIncrement"
    />
    <div v-if="gamePlayed && !gameActive" class="game-over">
        <h1>Game Over</h1>
        <div>Score: {{ score }}</div>
        <div>Time: {{ (elapsedMs / 1000).toFixed(2) }}s</div>
    </div>
    <Settings v-if="showSettings" />
</template>

<style lang="scss">
@use './assets/styles/_variables.scss';

* {
    box-sizing: border-box;
}

html,
body,
#app {
    height: 100%;
    padding: 0;
    margin: 0;
    font-family: $primary-font-stack;
    background: $color-bg-primary;
}

#app {
    position: relative;
    display: flex;
    flex-direction: column;

    @include bp-xxl-desktop {
        font-size: 1.2em;
    }
}

button {
    cursor: pointer;
}

button:focus-visible {
    outline: none;
}

a {
    text-decoration: none;
}
</style>
