<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import Settings from '@/components/Settings.vue';
import Canvas from '@/components/Canvas.vue';
import Button from '@/components/Button.vue';
import ArrowSVG from '@/components/Icons/ArrowSVG.vue';
import CloseSVG from '@/components/Icons/CloseSVG.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const gameActive = ref(false);
const showSettings = ref(false);
const showRecentGames = ref(false);
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

function toggleSettings() {
    showRecentGames.value = false;
    showSettings.value = true;
}

function toggleRecentGames() {
    showRecentGames.value = !showRecentGames.value;
    console.log(showRecentGames.value);

    if (showRecentGames.value && showSettings.value) {
        showSettings.value = false;
    }
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

function getTimePassed(pastTime) {
    const pastDate = new Date(pastTime);
    const now = new Date();
    const diff = now - pastDate;

    if (diff < 0) {
        return;
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds === 0) return 'just now';
    return `${seconds}s ago`;
}
</script>

<template>
    <div class="game-container">
        <div v-if="!gameActive" class="game-start">
            <div class="recent-games" v-if="authStore.recentUserGames.length">
                <div class="recent-games-header">
                    <h2>Recent Scores</h2>
                    <Button
                        v-if="!showRecentGames || showSettings"
                        preset="icon-only"
                        :iconLeft="ArrowSVG"
                        @click="toggleRecentGames()"
                    />
                    <Button
                        v-if="showRecentGames && !showSettings"
                        preset="icon-only"
                        :iconLeft="CloseSVG"
                        @click="toggleRecentGames()"
                    />
                </div>
                <hr />
                <ul class="recent-games-list" v-if="showRecentGames && !showSettings">
                    <li v-for="game in authStore.recentUserGames" :key="game.createdAt">
                        <span class="label">Score:</span>
                        <span class="stat">{{ game.score }}</span>
                        <span class="label">Time:</span>
                        <span class="stat">{{ formatTime(game.time) }}</span>
                        <span>{{ getTimePassed(game.createdAt) }} </span>
                    </li>
                </ul>
            </div>
            <div v-if="gamePlayed && !showSettings" class="end-screen-wrapper">
                <div class="end-screen">
                    <h1>Game Over!</h1>
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
    position: relative;
    @include flexCenterAll;
    height: 100%;
    width: 100%;

    .game-start {
        .recent-games {
            font-size: 1.1em;
            position: absolute;
            top: $size-1;
            left: $size-3;
            display: flex;
            flex-direction: column;
            padding: $size-2 $size-1 $size-1 $size-3;
            background: $color-bg-secondary;
            border-radius: $border-radius-xs;

            &-header {
                display: flex;
                justify-content: space-between;
                gap: 2px;

                h2 {
                    font-family: $secondary-font-stack;
                    font-size: 1em;
                    color: $color-accent;
                    margin: 0;
                }

                button {
                    padding: 0.6em;
                    margin-top: 1px;
                    transform: scale(0.75) translate(-5px, -4px);

                    &:hover {
                        background: #ec6e9e22;
                    }

                    :deep(.icon) {
                        height: 1em;
                        width: 1em;
                        stroke: $color-accent;
                    }
                }
            }

            hr {
                border: 0;
                height: 2px;
                background-color: $color-primary-light;
                margin: 0 0 $size-1;
                width: 95%;
            }

            &-list {
                font-size: 0.85em;
                display: flex;
                flex-direction: column;
                list-style: none;
                padding: 0 $size-4 $size-1 $size-1;
                margin: 0;
                width: 18em;

                li {
                    display: flex;
                    align-items: center;
                    border-bottom: solid 1px $color-gray2;
                    padding: 0.15em;

                    &:last-child {
                        border: 0;
                    }

                    span {
                        font-size: 0.9em;

                        &:last-child {
                            margin-left: auto;
                            font-size: 0.65em;
                            color: $color-text-muted;
                        }

                        &.label {
                            color: $color-accent;
                            font-style: oblique;
                            font-weight: 600;
                        }

                        &.stat {
                            color: $color-text-secondary-dark;
                            margin: 0 $size-4 0 $size-2;
                        }
                    }
                }
            }
        }

        .buttons {
            display: flex;
            gap: $size-2;
            margin-top: $size-8;
        }

        .end-screen-wrapper {
            @include flexCenterAll;

            .end-screen {
                @include flexCenterAll;
                flex-direction: column;
                background: $color-bg-secondary;
                padding: $size-3 $size-5 $size-3;
                border-radius: $border-radius-md;

                h1 {
                    font-family: $secondary-font-stack;
                    margin: 0;
                    color: $color-accent;
                }

                hr {
                    width: 100%;
                    border: 0;
                    height: 2px;
                    background-color: $color-primary-light;
                    margin: $size-2 0 $size-2;
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
            font-size: 3.5em;
        }

        to {
            font-size: 1.5em;
        }
    }

    .countdown {
        font-family: $primary-font-stack;
        color: $color-text-primary-light;
        font-weight: 600;
        font-size: 3.5em;
        animation: shrink 1s ease-in-out;
        animation-iteration-count: 3;
    }
}
</style>
