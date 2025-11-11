<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import { useSettingsStore } from '@/stores/settingsStore';

const props = defineProps({
    gameActive: { type: Boolean },
    gameCircle: { type: Boolean, default: true },
    localSize: { required: false },
    inputActive: { type: Boolean },
});

const emit = defineEmits(['click', 'endGame']);

const settingsStore = useSettingsStore();

const animating = ref(false);
const paused = ref(false);

onMounted(() => {
    if (props.gameCircle) {
        animating.value = true;
    } else {
        openCircle();
    }
});

function circleClick() {
    paused.value = true;
    emit('click');
}

function openCircle() {
    gsap.to('.circle', {
        duration: 0.3,
        ease: 'power3.out',
        scale: 1,
        opacity: 1,
    });
}

function closeCircle() {
    gsap.to('.circle', {
        duration: 0.2,
        ease: 'power3.in',
        scale: 0,
        opacity: 0,
    });
}

defineExpose({ openCircle, closeCircle });
</script>

<template>
    <div
        class="circle"
        :style="{
            height: `${localSize ? localSize : settingsStore.circleSize}px`,
            width: `${localSize ? localSize : settingsStore.circleSize}px`,
            transform: `${!gameCircle ? 'scale(0)' : undefined}`,
            opacity: `${!gameCircle ? 0 : 1}`,
        }"
    >
        <button
            :class="{ animate: animating, 'fade-out': paused || !gameActive }"
            :style="{
                animationDuration: `${settingsStore.shrinkTime}s`,
                height: `${localSize ? localSize : settingsStore.circleSize}px`,
                width: `${localSize ? localSize : settingsStore.circleSize}px`,
            }"
            @mousedown="gameCircle ? circleClick() : null"
            @animationend="$emit('endGame')"
        >
            <span v-if="inputActive && localSize >= 50">{{ localSize }}px</span>
        </button>
        <span v-if="inputActive && localSize < 50" class="outer-value">{{ localSize }}px</span>
    </div>
</template>

<style lang="scss" scoped>
.circle {
    position: relative;
    @include flexCenterAll;

    span {
        font-family: $primary-font-stack;
        color: $color-text-secondary-dark;
        font-weight: 500;

        &.outer-value {
            position: absolute;
            right: -$size-11;
            color: $color-text-primary-light;
            text-shadow: 1px 1px 2px #00000033;
        }
    }

    button {
        background-color: $color-bg-secondary;
        border-radius: 100%;
        border: 0;
        opacity: 1;
        transition: opacity 0.3s ease;
        box-shadow: 1px 2px 3px #00000011;

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
