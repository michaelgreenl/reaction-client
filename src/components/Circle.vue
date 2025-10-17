<script setup>
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

const props = defineProps({
    gameActive: { type: Boolean },
    animation: { type: Boolean, default: true },
    localSize: { required: false },
});

const emit = defineEmits(['click', 'endGame']);

const settingsStore = useSettingsStore();

const animating = ref(false);
const paused = ref(false);

onMounted(() => {
    if (props.animation) {
        animating.value = true;
    }
});

function circleClick() {
    paused.value = true;
    emit('click');
}
</script>

<template>
    <div
        :style="{
            height: `${localSize ? localSize : settingsStore.circleSize}px`,
            width: `${localSize ? localSize : settingsStore.circleSize}px`,
        }"
    >
        <button
            :class="{ animate: animating, 'fade-out': paused || !gameActive }"
            :style="{
                animationDuration: `${settingsStore.shrinkTime}s`,
                height: `${localSize ? localSize : settingsStore.circleSize}px`,
                width: `${localSize ? localSize : settingsStore.circleSize}px`,
            }"
            @mousedown="animation ? circleClick() : null"
            @animationend="$emit('endGame')"
        ></button>
    </div>
</template>

<style lang="scss" scoped>
div {
    display: flex;
    align-items: center;
    justify-content: center;

    button {
        background-color: $color-bg-secondary;
        border-radius: 100%;
        border: 0;
        opacity: 1;
        transition: opacity 0.3s ease;

        @keyframes shrink {
            0% {
                transform: scale(1);
            }

            100% {
                transform: scale(0.1);
            }
        }

        &.animate {
            animation-name: shrink;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
        }

        &.fade-out {
            animation-play-state: paused;
            opacity: 0;
        }
    }
}
</style>
