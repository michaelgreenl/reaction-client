<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import Circle from '@/components/Circle.vue';
import GameStats from '@/components/GameStats.vue';

const props = defineProps({
    gameActive: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
});

const emit = defineEmits(['endGame', 'incrementScore']);

const canvas = ref(null);

const settingsStore = useSettingsStore();

const circles = ref([]);
let spawnTimer;

onMounted(() => {
    spawnCircle();
    spawnTimer = setInterval(spawnCircle, 1000 * settingsStore.spawnInterval);
});

onBeforeUnmount(() => {
    if (spawnTimer) clearInterval(spawnTimer);
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnCircle() {
    const circleSize = settingsStore.circleSize;

    // minus 30 to be safe
    const vw = canvas.value.offsetWidth - 30;
    const vh = canvas.value.offsetHeight - 30;

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

const localGameActive = ref(true);

function handleGameEnd() {
    localGameActive.value = false;

    // Timeout for the circle's fade-out transitions
    setTimeout(() => {
        emit('endGame');
    }, 400);
}
</script>

<template>
    <div ref="canvas" class="game-container">
        <div class="hud">
            <GameStats :score="score" :time="time" :adjustTimeSize="true" />
        </div>
        <div class="canvas">
            <div v-for="c in circles" :key="c.id" class="circle-wrapper" :style="{ left: c.x + 'px', top: c.y + 'px' }">
                <Circle @click="handleCircleClick(c.id)" @endGame="handleGameEnd()" :gameActive="localGameActive" />
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
        padding: $size-2 $size-8 $size-2 $size-4;
        border-radius: $border-radius-sm;
        gap: $size-2;
        border: solid 1px $color-gray3;
        box-shadow: $box-shadow;

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
}
</style>
