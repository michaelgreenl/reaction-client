<script setup>
import { formatTime } from '@/util/time.js';

const props = defineProps({
    score: { required: true },
    time: { required: true },
    adjustTimeSize: { type: Boolean, default: false },
});

function timeValueSize(timeMs) {
    const seconds = timeMs / 1000;

    if (seconds >= 60) {
        return '2.2ch';
    } else if (seconds >= 20) {
        return '2.6ch';
    } else if (seconds >= 10) {
        return '2.4ch';
    }

    return '2.2ch';
}
</script>

<template>
    <div class="stat-wrapper">
        <span class="label">Score:</span>
        <span class="stat">{{ score }}</span>
    </div>
    <span> | </span>
    <div class="stat-wrapper">
        <span class="label">Time:</span>
        <span class="stat" :style="{ width: adjustTimeSize ? timeValueSize(time) : '' }">{{ formatTime(time) }}</span>
    </div>
</template>

<style lang="scss" scoped>
span {
    font-size: 0.5em;
    font-weight: 500;
    color: $color-gray3;
}

.stat-wrapper {
    display: flex;
    gap: $size-1;

    span {
        font-size: 1em !important;
        color: $color-text-secondary-dark;
        line-height: 1.6ch;

        &.label {
            color: $color-accent;
        }
    }
}
</style>
