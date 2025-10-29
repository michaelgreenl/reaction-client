<script setup>
const props = defineProps({
    score: { required: true },
    time: { required: true },
    adjustTimeSize: { type: Boolean, default: false },
});

function timeValueSize(timeMs) {
    const seconds = timeMs / 1000;

    if (seconds >= 100) {
        return '2.8ch';
    } else if (seconds >= 20) {
        return '2.4ch';
    } else if (seconds >= 10) {
        return '2.2ch';
    }

    return '2ch';
}
</script>

<template>
    <div class="stat-wrapper">
        <span class="label">Score:</span>
        <span class="stat">{{ score }}</span>
    </div>
    <span> • </span>
    <div class="stat-wrapper">
        <span class="label">Time:</span>
        <span class="stat" :style="{ width: adjustTimeSize ? timeValueSize(time) : '' }">{{
            (time / 1000).toFixed(2)
        }}</span>
    </div>
</template>

<style lang="scss" scoped>
span {
    color: $color-text-secondary-dark;
    font-weight: 500;
    font-size: 0.7em;
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
