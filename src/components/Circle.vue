<script setup>
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

const props = defineProps({
    gameActive: { type: Boolean },
});

const emit = defineEmits(['click', 'endGame']);

const settingsStore = useSettingsStore();

const animating = ref(false);
const paused = ref(false);

onMounted(() => {
    animating.value = true;
});

function circleClick() {
    paused.value = true;
    emit('click');
}
</script>

<template>
    <div :style="{ height: `${settingsStore.circleSize}px`, width: `${settingsStore.circleSize}px` }">
        <button
            :class="{ animate: animating, 'fade-out': paused || !gameActive }"
            :style="{
                animationDuration: `${settingsStore.shrinkTime}s`,
                height: `${settingsStore.circleSize}px`,
                width: `${settingsStore.circleSize}px`,
            }"
            @click="circleClick()"
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
        background-color: $color-white;
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
