<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';
import { useSettingsStore } from '@/stores/settingsStore';
import Circle from '@/components/Circle.vue';
import GameStats from '@/components/GameStats.vue';

defineProps({
    gameActive: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
});

const emit = defineEmits(['startTimer', 'endGame', 'incrementScore']);

const canvasRef = ref(null);

const settingsStore = useSettingsStore();

const circles = ref([]);
let spawnTimer;

const count = ref(3);
const showCount = ref(false);

const localGameActive = ref(true);

onMounted(async () => {
    showCount.value = true;
    await startCountdown(3);
    emit('startTimer');

    spawnCircle();
    spawnTimer = setInterval(spawnCircle, 1000 * settingsStore.spawnInterval);
});

onBeforeUnmount(() => {
    if (spawnTimer) clearInterval(spawnTimer);
});

function startCountdown(n) {
    count.value = n;

    if (n === 2) {
        const tl = gsap.timeline();
        enterHudAnim(tl);
    }

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnCircle() {
    const circleSize = settingsStore.circleSize;

    // minus 30 to be safe
    const vw = canvasRef.value.offsetWidth - 30;
    const vh = canvasRef.value.offsetHeight - 30;

    const maxX = Math.max(0, vw - circleSize);
    const maxY = Math.max(0, vh - circleSize);

    const x = getRandomInt(0, maxX);
    const y = getRandomInt(0, maxY);

    circles.value.push({
        id: crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        x,
        y,
    });
}

function handleCircleClick(id) {
    emit('incrementScore');
    circles.value = circles.value.filter((c) => c.id !== id);
}

function handleGameEnd() {
    const tl = gsap.timeline();
    exitHudAnim(tl);
    localGameActive.value = false;

    // Timeout for the hud exit animation & all of the circle's fade-out transitions
    setTimeout(() => {
        emit('endGame');
    }, 900);
}

function enterHudAnim(tl) {
    tl.to('.hud', {
        duration: 0.3,
        ease: 'power4.out',
        y: 0,
    })
        .to(
            '.stat-wrapper',
            {
                duration: 0.3,
                ease: 'power4.out',
                width: 'auto',
            },
            0.3,
        )
        .to(
            '.hud',
            {
                duration: 0.3,
                ease: 'power4.out',
                paddingRight: '2em',
            },
            0.3,
        )
        .to(
            '.stat-wrapper',
            {
                duration: 0.3,
                ease: 'linear',
                opacity: 1,
                stagger: 0.05,
            },
            0.4,
        );
}

function exitHudAnim(tl) {
    tl.to('.stat-wrapper', {
        duration: 0.3,
        ease: 'linear',
        opacity: 0,
        stagger: 0.05,
    })
        .to(
            '.stat-wrapper',
            {
                duration: 0.3,
                ease: 'power4.out',
                width: 0,
            },
            0.3,
        )
        .to(
            '.hud',
            {
                duration: 0.3,
                ease: 'power4.out',
                paddingRight: '1em',
            },
            0.3,
        )
        .to(
            '.hud',
            {
                duration: 0.3,
                ease: 'power4.out',
                y: '-60px',
            },
            0.6,
        );
}
</script>

<template>
    <div ref="canvasRef" class="game-container">
        <div class="hud">
            <GameStats :adjust-time-size="true" :score="score" :time="time" />
        </div>
        <div v-if="showCount" class="countdown">
            <span>{{ count }}</span>
        </div>
        <div v-else class="canvas">
            <div v-for="c in circles" :key="c.id" class="circle-wrapper" :style="{ left: c.x + 'px', top: c.y + 'px' }">
                <Circle :game-active="localGameActive" @click="handleCircleClick(c.id)" @end-game="handleGameEnd()" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.game-container {
    position: relative;
    height: 100%;
    width: 100%;

    .hud {
        position: absolute;
        top: $size-1;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: fit-content;
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: $color-bg-secondary;
        padding: $size-2 $size-4 $size-2 $size-4;
        border-radius: $border-radius-sm;
        gap: $size-2;
        border: solid 1px $color-gray3;
        box-shadow: $box-shadow;

        transform: translateY(-60px);
        overflow: hidden;

        :deep(.stat-wrapper) {
            opacity: 0;
            width: 0;
        }

        @include bp-custom-min(400) {
            margin-left: auto;
            margin-right: 0.4em;
            top: -2.8em;
        }

        @include bp-sm-phone {
            font-size: 1em;
            top: -2.8em;
            margin: 0 auto;
        }
    }

    .canvas {
        position: relative;
        height: 100%;
        width: 100%;
    }

    .circle-wrapper {
        position: absolute;
        height: 100px;
        width: 100px;
        pointer-events: none;

        :deep(button) {
            pointer-events: auto;
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

    @keyframes shrink {
        from {
            font-size: 3.5em;
        }

        to {
            font-size: 1.5em;
        }
    }
}
</style>
