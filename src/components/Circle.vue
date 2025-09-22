<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    gameActive: { type: Boolean },
});

const emit = defineEmits(['click', 'endGame']);

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
    <div>
        <button
            :class="{ animate: animating, 'fade-out': paused || !gameActive }"
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
    height: 100px;
    width: 100px;

    button {
        background-color: $color-white;
        height: 100px;
        width: 100px;
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
            animation: shrink 1s linear forwards;
        }

        &.fade-out {
            animation-play-state: paused;
            opacity: 0;
        }
    }
}
</style>
