<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
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
const isXlDesktop = ref(window.innerWidth > 1600);
const isMounted = ref(false);

const mainButtons = ref([
    {
        key: 'cancel',
        text: 'Cancel',
        preset: 'primary animated',
        condition: () => showSettings.value,
        disabled: () => !settingsRef.value?.settingsChanged,
        click: () => settingsRef.value?.resetLocalSettings(),
    },
    {
        key: 'save',
        text: 'Save',
        type: 'submit',
        preset: 'primary animated',
        condition: () => showSettings.value,
        isLoading: () => settingsRef.value?.isLoading,
        disabled: () => settingsRef.value?.isLoading || !settingsRef.value?.settingsChanged,
        click: () => settingsRef.value?.saveSettings(),
    },
    {
        key: 'settings',
        text: 'Settings',
        preset: 'primary animated',
        condition: () => !showSettings.value,
        click: () => toggleSettings(),
    },
]);

const buttonList = computed(() => {
    return mainButtons.value.filter((button) => {
        return button.condition ? button.condition() : true;
    });
});

onMounted(() => {
    showButtonsAnim();

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
    const onComplete = async () => {
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
    };

    const tl = gsap.timeline();

    hideButtonsAnim();

    if (gamePlayed.value && !showSettings.value) {
        hideEndScreenAnim(tl, onComplete);
    }

    if (showSettings.value) {
        settingsRef.value?.closeSettingsAnim(tl);
    }

    if (authStore.isAuthenticated) {
        hideRecentGamesAnim(tl);
    }

    if (!gamePlayed.value || showSettings.value) {
        gsap.to('.settings-circle', {
            duration: 0.2,
            ease: 'power3.in',
            scale: 0,
            opacity: 0,
        });

        setTimeout(async () => {
            onComplete();
        }, 500);
    }
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

    const tl = gsap.timeline();
    showEndScreenAnim(tl);
    showButtonsAnim();

    authStore.setGame(
        { score: score.value, time: elapsedMs.value },
        {
            circleSize: settingsStore.circleSize,
            spawnInterval: settingsStore.spawnInterval,
            shrinkTime: settingsStore.shrinkTime,
        },
    );
}

async function toggleSettings() {
    const onComplete = async () => {
        if (!showSettings.value) {
            growButtonDiv();
        }

        const tl = gsap.timeline();
        if (!showSettings.value && showRecentGames.value && authStore.isAuthenticated) {
            const onStart = async () => {
                showRecentGames.value = false;
                showSettings.value = true;

                await nextTick();
                enterButtonAnim(tl);
            };

            const tl2 = gsap.timeline();
            if (!isMobile.value) {
                closeRecentGamesAnim(tl2, onStart);
            } else {
                hideRecentGamesAnim(tl2, onStart);
            }
        } else if (!showSettings.value && !showRecentGames.value) {
            showSettings.value = true;
            await nextTick();
            enterButtonAnim(tl);

            if (isMobile.value && authStore.isAuthenticated) {
                const tl2 = gsap.timeline();
                hideRecentGamesAnim(tl2);
            }
        } else {
            if (isMobile.value && authStore.isAuthenticated) {
                const tl2 = gsap.timeline();
                showRecentGamesAnim(tl2);
            }

            showSettings.value = false;
            await nextTick();

            if (gamePlayed.value) {
                showEndScreenAnim(gsap.timeline());
            }

            enterButtonAnim(tl);
        }
    };

    const tl = gsap.timeline();
    exitButtonAnim(tl, (tl) => onComplete(tl));

    if (gamePlayed.value) {
        hideEndScreenAnim(tl);
    }

    if (showSettings.value) {
        shrinkButtonDiv(0.2);
    }
}

async function toggleRecentGames() {
    const tl = gsap.timeline();
    if (showSettings.value && !showRecentGames.value) {
        settingsRef.value?.closeSettings();
        shrinkButtonDiv();

        exitButtonAnim(tl, async () => {
            showRecentGames.value = true;
            await nextTick();
            openRecentGamesAnim(tl);
        });
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
        duration: 0.3,
        ease: 'expo',
        width: 'auto',
        height: 'auto',
        opacity: 1,
        x: 0,
    }).to(
        '.recent-games-list',
        {
            duration: 0.3,
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
            ease: 'expo',
            opacity: 0,
            onComplete,
        }).to(
            '.recent-games',
            {
                duration: 0.2,
                ease: 'expo',
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
            ease: 'expo',
            width: '11em',
            height: '3em',
            opacity: 0,
            x: -250,
            onComplete,
        });
    }
}

function closeRecentGamesAnim(tl, onStart = () => {}) {
    tl.to('.recent-games-list', {
        duration: 0.2,
        ease: 'expo',
        opacity: 0,
    }).to(
        '.recent-games',
        {
            duration: 0.2,
            ease: 'expo',
            width: '11em',
            height: '3em',
            opacity: 1,
            x: 0,
            onStart,
        },
        0.1,
    );
}

function showRecentGamesAnim(tl) {
    tl.to('.recent-games', {
        duration: 0.2,
        ease: 'expo',
        width: '11em',
        height: '3em',
        opacity: 1,
        x: 0,
    });
}

function enterButtonAnim(tl) {
    tl.to('.main-button', {
        duration: 0.8,
        ease: 'expo',
        opacity: 1,
        stagger: 0.1,
    });
}

function exitButtonAnim(tl, onComplete = () => {}) {
    tl.to('.main-button', {
        duration: 0.2,
        ease: 'linear',
        opacity: 0,
        stagger: 0.1,
        onComplete,
    });
}

function showButtonsAnim() {
    gsap.to('.main-button, .start-button', {
        duration: 0.8,
        ease: 'expo',
        opacity: 1,
        stagger: 0.1,
    });
}

function hideButtonsAnim() {
    gsap.to('.main-button, .start-button', {
        duration: 0.2,
        ease: 'linear',
        opacity: 0,
        stagger: 0.1,
    });
}

function showEndScreenAnim(tl) {
    const width = !isXlDesktop.value ? '265px' : '328px';
    const height = !isXlDesktop.value ? '114px' : '146px';
    tl.to('.end-screen', {
        duration: 0.3,
        ease: 'expo',
        width,
        height,
    }).to(
        '.end-screen-child',
        {
            duration: 0.3,
            ease: 'linear',
            opacity: 1,
            stagger: 0.05,
        },
        0.1,
    );
}

function hideEndScreenAnim(tl, onComplete = () => {}) {
    tl.to('.end-screen-child', {
        duration: 0.1,
        ease: 'linear',
        opacity: 0,
        stagger: 0.1,
    }).to(
        '.end-screen',
        {
            duration: 0.3,
            ease: 'expo',
            width: 0,
            height: 0,
            opacity: 0,
            onComplete,
        },
        0.1,
    );
}

function shrinkButtonDiv(delay) {
    gsap.to('.buttons', {
        duration: 0.5,
        ease: 'expo',
        width: !isXlDesktop.value ? '222px' : '280px',
        delay,
    });
}

function growButtonDiv() {
    gsap.to('.buttons', {
        duration: 0.4,
        ease: 'expo',
        width: !isXlDesktop.value ? '287px' : '400px',
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
                <hr :style="{ width: `${!showRecentGames ? '96%' : '98%'}` }" />
                <ul class="recent-games-list" v-if="showRecentGames && !showSettings">
                    <li v-for="game in authStore.recentUserGames" :key="game.createdAt">
                        <GameStats :score="game.score" :time="game.time" />
                        <span class="separator"> - </span>
                        <span>{{ getTimePassed(game.createdAt) }} </span>
                    </li>
                </ul>
            </div>
            <div v-if="gamePlayed && !showSettings" class="end-screen psuedo-border">
                <h1 class="end-screen-child">Game Over</h1>
                <hr class="end-screen-child" />
                <div class="stats end-screen-child">
                    <GameStats :score="score" :time="elapsedMs" />
                </div>
            </div>
            <Settings
                ref="settingsRef"
                class="settings"
                :showSettings="showSettings"
                :gamePlayed="gamePlayed"
                @startingCloseSettings="exitButtonAnim(gsap.timeline())"
                @closeSettings="toggleSettings"
            />
            <div class="buttons">
                <Button
                    v-for="button in buttonList"
                    :key="button.key"
                    :class="['main-button', button.class]"
                    :preset="button.preset"
                    :text="button.text"
                    :type="button.type"
                    :is-loading="button.isLoading && button.isLoading()"
                    :disabled="button.disabled && button.disabled()"
                    @click="button.click"
                />
                <Button class="start-button" preset="primary animated" text="Start" @click="startGame" />
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

            padding: $size-2 $size-1 0.2em $size-3;

            @include bp-xxl-desktop {
                margin: $size-2 $size-3 0;
            }

            &-header {
                display: flex;
                justify-content: space-between;
                gap: 2px;

                @include bp-xxl-desktop {
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
                        transform: scale(0.9) translate(-8px, 1px);
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
                margin: 0 0 $size-1;

                @include bp-xxl-desktop {
                    margin: $size-1 0;
                }
            }

            &-list {
                font-size: 0.85em;
                display: flex;
                flex-direction: column;
                list-style: none;
                padding: 0 $size-4 $size-1 $size-1;
                margin: 0 $size-2 0.2em $size-4;
                margin: 0;
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
            height: 0;
            width: 0;

            padding: $size-2;

            h1 {
                position: relative;
                z-index: 2;
                margin: 0;
                color: $color-accent;
                white-space: nowrap;
                opacity: 0;
            }

            hr {
                position: relative;
                z-index: 2;
                width: 86%;
                border: 0;
                min-height: 1px;
                background-color: $color-primary-light;
                margin-top: $size-1;
                opacity: 0;
            }

            .stats {
                position: relative;
                z-index: 2;
                font-size: 1.1em;
                display: flex;
                align-items: center;
                gap: $size-2;
                opacity: 0;
            }
        }

        .buttons {
            display: flex;
            justify-content: flex-end;
            gap: $size-2;
            width: 222px;
            margin: 0 auto;

            @include bp-xxl-desktop {
                width: 280px;
            }

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
