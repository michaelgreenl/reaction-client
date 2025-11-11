<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { gsap } from 'gsap';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import { formatTime, getTimePassed } from '@/util/time.js';
import Settings from '@/components/Settings.vue';
import Canvas from '@/components/Canvas.vue';
import Button from '@/components/Button.vue';
import GameStats from '@/components/GameStats.vue';
import ArrowSVG from '@/components/Icons/ArrowSVG.vue';
import CloseSVG from '@/components/Icons/CloseSVG.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const settingsRef = ref(null);

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

const isMobile = ref(window.innerWidth < 682);
const isMounted = ref(false);

onMounted(() => {
    if (authStore.isAuthenticated) {
        const tl = gsap.timeline();
        showRecentGamesAnim(tl);
    }

    window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 682;
    });

    isMounted.value = true;
});

onBeforeUnmount(() => {
    stopTimer();
    window.removeEventListener('resize', () => {});
});

function startCountdown(n) {
    count.value = n;
    return new Promise((resolve) => {
        if (n === 0) {
            showCount.value = false;
            resolve(true);
            return;
        }

        setTimeout(() => {
            startCountdown(n - 1).then(resolve);
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
    showRecentGames.value = false;
    gamePlayed.value = true;
    gameActive.value = true;
    authStore.gameActive = true;
    showCount.value = true;
    await startCountdown(3);
    startTimer();
}

async function handleEndGame() {
    stopTimer();
    authStore.gameActive = false;
    gameActive.value = false;
    await nextTick();

    if (authStore.isAuthenticated) {
        const tl = gsap.timeline();
        showRecentGamesAnim(tl);
    }

    authStore.setGame(
        { score: score.value, time: elapsedMs.value },
        {
            circleSize: settingsStore.circleSize,
            spawnInterval: settingsStore.spawnInterval,
            shrinkTime: settingsStore.shrinkTime,
        },
    );
}

function toggleSettings() {
    const tl = gsap.timeline();
    if (!showSettings.value && showRecentGames.value) {
        const onComplete = () => {
            showRecentGames.value = false;
            showSettings.value = true;
        };

        if (!authStore.isAuthenticated) {
            onComplete();
            return;
        }

        if (!isMobile.value) {
            closeRecentGamesAnim(tl, onComplete);
        } else {
            hideRecentGamesAnim(tl, onComplete);
        }
    } else if (!showSettings.value && !showRecentGames.value) {
        showSettings.value = true;

        if (isMobile.value && authStore.isAuthenticated) {
            hideRecentGamesAnim(tl);
        }
    } else {
        if (isMobile.value && authStore.isAuthenticated) {
            showRecentGamesAnim(tl);
        }

        showSettings.value = false;
    }
}

async function toggleRecentGames() {
    const tl = gsap.timeline();
    if (showSettings.value && !showRecentGames.value) {
        showSettings.value = false;
        showRecentGames.value = true;
        await nextTick();

        openRecentGamesAnim(tl);
    } else if (!showRecentGames.value) {
        showRecentGames.value = true;
        await nextTick();
        openRecentGamesAnim(tl);
    } else {
        closeRecentGamesAnim(tl, () => (showRecentGames.value = false));
    }
}

function openRecentGamesAnim(tl) {
    tl.to('.recent-games', {
        duration: 0.2,
        ease: 'power3.out',
        width: 'auto',
        height: 'auto',
        opacity: 1,
        x: 0,
    }).to(
        '.recent-games-list',
        {
            duration: 0.2,
            ease: 'power3.out',
            opacity: 1,
        },
        0.1,
    );
}

function hideRecentGamesAnim(tl, onComplete = () => {}) {
    if (showRecentGames.value) {
        tl.to('.recent-games-list', {
            duration: 0.2,
            ease: 'power3.out',
            opacity: 0,
            onComplete,
        }).to(
            '.recent-games',
            {
                duration: 0.2,
                ease: 'power3.out',
                width: '11em',
                height: '3em',
                opacity: 0,
                x: -250,
            },
            0.1,
        );
    } else {
        tl.to('.recent-games', {
            duration: 0.2,
            ease: 'power3.out',
            width: '11em',
            height: '3em',
            opacity: 0,
            x: -250,
            onComplete,
        });
    }
}

function closeRecentGamesAnim(tl, onComplete = () => {}) {
    tl.to('.recent-games-list', {
        duration: 0.2,
        ease: 'power3.out',
        opacity: 0,
        onComplete,
    }).to(
        '.recent-games',
        {
            duration: 0.2,
            ease: 'power3.out',
            width: '11em',
            height: '3em',
            opacity: 1,
            x: 0,
        },
        0.1,
    );
}

function showRecentGamesAnim(tl) {
    tl.to('.recent-games', {
        duration: 0.2,
        ease: 'power3.out',
        width: '11em',
        height: '3em',
        opacity: 1,
        x: 0,
    });
}
</script>

<template>
    <div class="game-container" :class="`${showSettings ? 'showing-settings' : undefined}`">
        <div v-if="!gameActive" class="game-start">
            <div v-if="authStore.recentUserGames.length" class="recent-games" key="recentGames">
                <div class="recent-games-header">
                    <h2>Recent Scores</h2>
                    <Button
                        v-if="!showRecentGames || showSettings"
                        preset="icon-only"
                        :iconLeft="ArrowSVG"
                        @click="toggleRecentGames"
                    />
                    <Button
                        v-if="showRecentGames && !showSettings"
                        preset="icon-only"
                        :iconLeft="CloseSVG"
                        @click="toggleRecentGames"
                    />
                </div>
                <hr :style="{ width: `${!showRecentGames ? '88%' : '92%'}` }" />
                <ul class="recent-games-list" v-if="showRecentGames && !showSettings">
                    <li v-for="game in authStore.recentUserGames" :key="game.createdAt">
                        <GameStats :score="game.score" :time="game.time" />
                        <span class="separator"> - </span>
                        <span>{{ getTimePassed(game.createdAt) }} </span>
                    </li>
                </ul>
            </div>
            <div v-if="gamePlayed && !showSettings" class="end-screen psuedo-border">
                <h1>Game Over!</h1>
                <hr />
                <div class="stats">
                    <GameStats :score="score" :time="elapsedMs" />
                </div>
            </div>
            <Settings
                ref="settingsRef"
                class="settings"
                :showSettings="showSettings"
                :gamePlayed="gamePlayed"
                @closeSettings="toggleSettings"
            />
            <div class="buttons">
                <Button
                    v-if="showSettings"
                    class="main-button"
                    text="Cancel"
                    :disabled="!settingsRef?.settingsChanged"
                    @click="settingsRef?.resetLocalSettings"
                />
                <Button
                    v-if="showSettings"
                    type="submit"
                    class="main-button"
                    text="Save"
                    :isLoading="settingsRef?.isLoading"
                    :disabled="settingsRef?.isLoading || !settingsRef?.settingsChanged"
                    @click="settingsRef?.saveSettings"
                />
                <Button v-if="!showSettings" class="main-button" text="Settings" @click="toggleSettings" />
                <Button class="main-button" text="Start" @click="startGame" />
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
            @incrementScore="score += 1"
        />
    </div>
</template>

<style lang="scss" scoped>
.game-container {
    position: relative;
    z-index: 1;
    @include flexCenterAll;
    height: $height-minus-nav;
    width: 100%;

    &.showing-settings {
        .game-start {
            .buttons {
                margin-top: 0;
            }
        }
    }

    .game-start {
        .recent-games {
            font-size: 1.1em;
            position: absolute;
            z-index: 3;
            top: $size-1;
            left: $size-3;
            display: flex;
            flex-direction: column;
            background: $color-bg-secondary;
            box-shadow: $box-shadow;
            border-radius: $border-radius-md;
            border: solid 1px $color-gray3;
            overflow: hidden;
            transform: translateX(-250px);

            &-header {
                margin: $size-2 $size-1 0 $size-3;
                display: flex;
                justify-content: space-between;
                gap: 2px;

                @include bp-xxl-desktop {
                    margin: $size-2 $size-3 0 $size-3;
                }

                h2 {
                    font-size: 1em;
                    color: $color-accent;
                    margin: 0;
                    line-height: 1.6ch;
                    white-space: nowrap;

                    @include bp-xs-phone {
                        line-height: normal;
                    }
                }

                button {
                    padding: 0.6em;
                    margin-top: 1px;
                    transform: scale(0.75) translate(-5px, -4px);
                    border-radius: 100%;

                    @include bp-xxl-desktop {
                        transform: none;
                    }

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
                min-height: 2px;
                max-height: 2px;
                background-color: $color-primary-light;
                margin: 0 auto $size-1;

                @include bp-xxl-desktop {
                    margin: $size-1 auto $size-1;
                    width: 100%;
                }
            }

            &-list {
                font-size: 0.85em;
                display: flex;
                flex-direction: column;
                list-style: none;
                padding: 0 $size-4 $size-1 $size-1;
                margin: 0 $size-2 0.2em $size-4;
                width: 20em;
                overflow: hidden;
                opacity: 0;

                li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: solid 1px $color-gray2;
                    padding: 0.3em 0.15em;

                    &:last-child {
                        border: 0;
                    }

                    span {
                        font-size: 1em;

                        &:last-child,
                        &.separator {
                            font-family: $secondary-font-stack;
                            color: $color-text-muted;
                        }

                        &:last-child {
                            font-size: 0.65em;
                        }

                        &.separator {
                            font-size: 0.7em;
                            margin: 0 $size-2;
                        }
                    }
                }
            }
        }

        .end-screen {
            position: relative;
            @include flexCenterAll;
            flex-direction: column;
            background: $color-bg-secondary;
            border-radius: $border-radius-md;
            border: solid 1px $color-gray3;
            box-shadow: $box-shadow;
            overflow: hidden;

            h1 {
                position: relative;
                z-index: 2;
                margin: 0;
                margin: $size-2 $size-2 0;
                color: $color-accent;
                white-space: nowrap;
            }

            hr {
                position: relative;
                z-index: 2;
                width: 86%;
                border: 0;
                height: 1px;
                background-color: $color-primary-light;
                margin: $size-1 0 $size-2;
            }

            .stats {
                position: relative;
                z-index: 2;
                font-size: 1.1em;
                display: flex;
                align-items: center;
                gap: $size-2;
                margin: 0 $size-6 $size-4;
            }
        }

        .buttons {
            display: flex;
            justify-content: center;
            gap: $size-2;
            margin-top: $size-8;

            :deep(button) {
                font-size: 1.4em;
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
        color: $color-text-primary-light;
        font-weight: 600;
        font-size: 3.5em;
        text-shadow: 1px 1px 2px #00000033;
        animation: shrink 1s ease-in-out;
        animation-iteration-count: 3;
    }
}
</style>
