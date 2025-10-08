<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import Circle from '@/components/Circle.vue';

const props = defineProps({
    gameActive: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
});

const emit = defineEmits(['endGame', 'incrementScore']);

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
    const vw = window.innerWidth;
    const vh = window.innerHeight;

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
    <div class="game-container">
        <div class="hud">
            <span>Score: {{ score }}</span>
            <span>Time: {{ (time / 1000).toFixed(2) }}s</span>
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
    overflow: hidden;
    height: 100%;
    width: 100%;

    .hud {
        position: absolute;
        color: $color-white;
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
