<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import Settings from '@/components/Settings.vue';
import Canvas from '@/components/Canvas.vue';
import Button from '@/components/Button.vue';

const authStore = useAuthStore();

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
    authStore.setGame({ score: score.value, time: elapsedMs.value });
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
    <div class="game-container">
        <Button v-if="!gameActive" @click="startGame" text="Start" />
        <Button v-if="!gameActive" @click="showSettings = !showSettings" text="Settings" />
        <Canvas
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
    </div>
</template>

<style lang="scss" scoped>
.game-container {
    height: 100%;
    width: 100%;
}
</style>
