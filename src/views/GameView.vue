<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import { useBreakpoints } from '@/composables/useBreakpoints.js';
import { useGameAnimations } from '@/composables/animations/useGameAnimations.js';
import { getTimePassed } from '@/util/time.js';
import { gsap } from 'gsap';
import Settings from '@/components/Settings.vue';
import Canvas from '@/components/Canvas.vue';
import Button from '@/components/Button.vue';
import GameStats from '@/components/GameStats.vue';
import ArrowSVG from '@/components/Icons/ArrowSVG.vue';
import CloseSVG from '@/components/Icons/CloseSVG.vue';

const isMounted = ref(false);

const { isMobile, isLgDesktop, isXlDesktop } = useBreakpoints();

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

const mainButtons = ref([
    {
        key: 'cancel',
        text: 'Cancel',
        preset: 'primary',
        condition: () => showSettings.value,
        disabled: () => !settingsRef.value?.settingsChanged,
        click: () => settingsRef.value?.resetLocalSettings(),
    },
    {
        key: 'save',
        text: 'Save',
        type: 'submit',
        preset: 'primary',
        condition: () => showSettings.value,
        disabled: () => settingsRef.value?.isLoading || !settingsRef.value?.settingsChanged,
        click: () => settingsRef.value?.saveSettings(),
    },
    {
        key: 'settings',
        text: 'Settings',
        preset: 'primary',
        condition: () => !showSettings.value,
        click: () => toggleSettings(),
    },
]);

const buttonList = computed(() => {
    return mainButtons.value.filter((button) => {
        return button.condition ? button.condition() : true;
    });
});

const {
    initContext,
    openRecentGamesAnim,
    hideRecentGamesAnim,
    closeRecentGamesAnim,
    showRecentGamesAnim,
    enterButtonAnim,
    exitButtonAnim,
    showButtonsAnim,
    hideButtonsAnim,
    showEndScreenAnim,
    hideEndScreenAnim,
    shrinkButtonDivAnim,
    growButtonDivAnim,
} = useGameAnimations({ isXlDesktop, showRecentGames });

onMounted(() => {
    initContext();
    showButtonsAnim();

    if (authStore.isAuthenticated) {
        showRecentGamesAnim();
    }

    window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 682;
        isXlDesktop.value = window.innerWidth > 1600;
    });

    isMounted.value = true;
});

onBeforeUnmount(() => {
    stopTimer();
    window.removeEventListener('resize', () => {});
});

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
        elapsedMs.value = 0;
        score.value = 0;
        showSettings.value = false;
        showRecentGames.value = false;
        gamePlayed.value = true;
        gameActive.value = true;
        authStore.gameActive = true;
    };

    const tl = gsap.timeline();
    hideButtonsAnim();

    if (gamePlayed.value && !showSettings.value) {
        hideEndScreenAnim({ tl, onComplete });
    }

    if (showSettings.value) {
        settingsRef.value?.closeSettingsAnim({ tl });
    }

    if (authStore.isAuthenticated) {
        hideRecentGamesAnim({ tl });
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
        showRecentGamesAnim();
    }

    showEndScreenAnim();
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
            growButtonDivAnim();
        }

        const tl = gsap.timeline();
        if (!showSettings.value && showRecentGames.value && authStore.isAuthenticated) {
            const onStart = async () => {
                showRecentGames.value = false;
                showSettings.value = true;
                await nextTick();
                enterButtonAnim({ tl });
            };

            const tl2 = gsap.timeline();

            if (!isMobile.value && !isLgDesktop.value) {
                closeRecentGamesAnim({ onStart });
            } else if (isMobile.value) {
                hideRecentGamesAnim({ onComplete: onStart });
            } else {
                showSettings.value = true;
                await nextTick();
                enterButtonAnim();
            }
        } else if (!showSettings.value && !showRecentGames.value) {
            showSettings.value = true;
            await nextTick();
            enterButtonAnim({ tl });

            if (isMobile.value && authStore.isAuthenticated) {
                hideRecentGamesAnim();
            }
        } else {
            if (isMobile.value && authStore.isAuthenticated) {
                showRecentGamesAnim();
            }

            showSettings.value = false;
            await nextTick();

            if (gamePlayed.value) {
                showEndScreenAnim();
            }

            enterButtonAnim({ tl });
        }
    };

    const tl = gsap.timeline();
    exitButtonAnim({ tl, onComplete: (tl) => onComplete(tl) });

    if (gamePlayed.value && !showSettings.value) {
        hideEndScreenAnim({ tl });
    }

    if (showSettings.value) {
        shrinkButtonDivAnim({ delay: 0.2 });
    }
}

async function toggleRecentGames() {
    if (showSettings.value && !showRecentGames.value && !isLgDesktop.value) {
        settingsRef.value?.closeSettings();
        shrinkButtonDivAnim();

        exitButtonAnim({
            onComplete: async () => {
                showRecentGames.value = true;
                await nextTick();
                openRecentGamesAnim();
            },
        });
    } else if (!showRecentGames.value) {
        showRecentGames.value = true;
        await nextTick();
        openRecentGamesAnim();
    } else {
        closeRecentGamesAnim({ onStart: () => (showRecentGames.value = false) });
    }
}
</script>

<template>
    <div class="game-container" :class="`${showSettings ? 'showing-settings' : undefined}`">
        <div v-if="!gameActive" class="game-start">
            <div v-if="authStore.recentUserGames.length" key="recentGames" class="recent-games">
                <div class="recent-games-header">
                    <h2>Recent Scores</h2>
                    <Button
                        v-if="!showRecentGames"
                        preset="icon-only"
                        :icon-left="ArrowSVG"
                        @click="toggleRecentGames"
                    />
                    <Button
                        v-if="showRecentGames"
                        preset="icon-only"
                        :icon-left="CloseSVG"
                        @click="toggleRecentGames"
                    />
                </div>
                <hr :style="{ width: `${!showRecentGames ? '96%' : '98%'}` }" />
                <ul v-if="showRecentGames && (!showSettings || isLgDesktop)" class="recent-games-list">
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
                :show-settings="showSettings"
                :game-played="gamePlayed"
                @starting-close-settings="exitButtonAnim(gsap.timeline())"
                @close-settings="toggleSettings"
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
        <Canvas
            v-if="gameActive"
            :game-active="gameActive"
            :score="score"
            :time="elapsedMs"
            @end-game="handleEndGame"
            @increment-score="score += 1"
            @start-timer="startTimer"
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
}

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
}

.recent-games-header {
    display: flex;
    justify-content: space-between;
    gap: 2px;

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

.recent-games-list {
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
        opacity: 0;
        will-change: transform, opacity;
    }
}
</style>
