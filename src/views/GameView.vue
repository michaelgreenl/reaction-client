<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import Settings from '@/components/Settings.vue';
import Canvas from '@/components/Canvas.vue';
import Button from '@/components/Button.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

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
    authStore.setGame(
        { score: score.value, time: elapsedMs.value },
        {
            circleSize: settingsStore.circleSize,
            spawnInterval: settingsStore.spawnInterval,
            shrinkTime: settingsStore.shrinkTime,
        },
    );
    gameActive.value = false;
}

function handleScoreIncrement() {
    score.value += 1;
}

onBeforeUnmount(() => {
    stopTimer();
});

function formatDate(isoString) {
    const date = new Date(isoString);
    if (isNaN(date)) throw new Error('Invalid ISO date string');

    const parts = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value;

    const hour = get('hour');
    const minute = get('minute');
    const ampm = get('dayPeriod')?.toLowerCase();
    const month = get('month');
    const day = get('day');
    const year = get('year');

    const now = new Date();
    const sameDay =
        now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();

    return sameDay ? `${hour}:${minute}${ampm}` : `${hour}:${minute}${ampm} ${month}-${day}-${year}`;
}

function formatTime(time) {
    let seconds = (time / 1000).toFixed(2);

    if (seconds < 59.99) {
        return `${seconds}s`;
    } else {
        const mins = Math.floor(seconds / 60);
        seconds = seconds % 60;
        return `${mins}:${seconds}`;
    }
}
</script>

<template>
    <div class="game-container">
        <ul v-if="!gameActive">
            <li v-for="game in authStore.recentUserGames" :key="game.createdAt">
                {{ formatDate(game.createdAt) }} | {{ game.score }} |
            </li>
        </ul>
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
            <div>Time: {{ formatTime(elapsedMs) }}</div>
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
