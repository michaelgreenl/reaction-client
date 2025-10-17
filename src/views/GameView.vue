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

const count = ref(3);
const showCount = ref(false);

function countdown(n) {
    count.value = n;
    return new Promise((resolve) => {
        if (n === 0) {
            showCount.value = false;
            resolve(true);
            return;
        }
        setTimeout(() => {
            countdown(n - 1).then(resolve);
        }, 1000);
    });
}

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

async function startGame() {
    count.value = 3;
    score.value = 0;
    showSettings.value = false;
    gamePlayed.value = true;
    gameActive.value = true;
    showCount.value = true;
    await countdown(3);
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
        <div v-if="!gameActive" class="game-start">
            <ul v-if="authStore.recentUserGames.length">
                <li v-for="game in authStore.recentUserGames" :key="game.createdAt">
                    {{ formatDate(game.createdAt) }} | {{ game.score }} |
                </li>
            </ul>
            <div v-if="gamePlayed && !showSettings" class="end-screen-wrapper">
                <div class="end-screen">
                    <h1>Game Over</h1>
                    <hr />
                    <div class="stats">
                        <div class="stat-wrapper">
                            <span class="label">Score:</span>
                            <span class="value">{{ score }}</span>
                        </div>
                        <div class="stat-wrapper">
                            <span class="label">Time:</span>
                            <span class="value">{{ formatTime(elapsedMs) }}</span>
                        </div>
                    </div>
                </div>
                <div class="buttons">
                    <Button @click="showSettings = !showSettings" text="Settings" />
                    <Button @click="startGame" text="Start" />
                </div>
            </div>
            <div v-else>
                <Settings class="settings" :showSettings="showSettings" @closeSettings="showSettings = false">
                    <template #startButton>
                        <Button @click="startGame" text="Start" />
                    </template>
                </Settings>
                <div v-if="!showSettings" class="buttons">
                    <Button @click="showSettings = !showSettings" text="Settings" />
                    <Button @click="startGame" text="Start" />
                </div>
            </div>
        </div>
        <div class="countdown" v-if="showCount">
            <span>{{ count }}</span>
        </div>
        <Canvas
            v-if="gameActive && count === 0"
            :gameActive="gameActive"
            :score="score"
            :time="elapsedMs"
            @endGame="handleEndGame"
            @incrementScore="handleScoreIncrement"
        />
    </div>
</template>

<style lang="scss" scoped>
.game-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;

    .game-start {
        .buttons {
            display: flex;
            gap: $size-2;
            margin-top: $size-8;
        }

        .end-screen-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;

            .end-screen {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: $color-bg-secondary;
                padding: $size-2 $size-5 $size-3;
                border-radius: $border-radius-md;

                h1 {
                    margin: 0;
                    color: $color-accent;
                    font-weight: 600;
                }

                hr {
                    width: 100%;
                    border: 0;
                    height: 2px;
                    background-color: $color-primary-light;
                    margin: 0 0 $size-2;
                }

                .stats {
                    font-size: 1.1em;
                    display: flex;
                    gap: $size-2;

                    .stat-wrapper {
                        display: flex;
                        gap: $size-1;

                        .label {
                            color: $color-accent;
                            font-weight: 600;
                            font-style: oblique;
                        }
                    }
                }
            }
        }
    }

    @keyframes shrink {
        from {
            font-size: 2.5em;
        }

        to {
            font-size: 1.5em;
        }
    }

    .countdown {
        font-family: $primary-font-stack;
        color: $color-text-primary-light;
        font-weight: 600;
        font-size: 2.5em;
        animation: shrink 1s ease-in-out;
        animation-iteration-count: 3;
    }
}
</style>
