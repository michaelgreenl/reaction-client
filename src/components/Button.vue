<script setup>
import { motion, AnimatePresence } from 'motion-v';
import Loader from '@/components/Loader.vue';

const props = defineProps({
    text: { type: String },
    showText: { type: Boolean, default: true },
    preset: { type: String, default: 'primary' },
    iconLeft: { type: Object },
    iconRight: { type: Object },
    isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

// const buttonTransitionValues = {
//     stiffness: 1000000,
//     damping: 100,
//     mass: 1,
// };

// const buttonTransition = {
//     type: 'spring',
//     ...buttonTransitionValues,
//     layout: { type: 'spring', ...buttonTransitionValues },
// };

// const buttonTransition = {
//     duration: 0.2,
//     easing: 'easeInOut',
// };

// const buttonVariants = {
//     init: { opacity: 0, x: -10 },
//     enter: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: 10 },
// };
</script>

<template>
    <!-- <motion.button -->
    <!--     :class="preset" -->
    <!--     @click="$emit('click')" -->
    <!--     :variants="buttonVariants" -->
    <!--     :initial="'init'" -->
    <!--     :animate="'enter'" -->
    <!--     :exit="'exit'" -->
    <!--     layout -->
    <!--     :transition="buttonTransition" -->
    <!-- > -->
    <!--     <component class="icon icon-left" :is="iconLeft" /> -->
    <!--     <span v-if="showText && !isLoading">{{ text }}</span> -->
    <!--     <Loader v-if="isLoading" /> -->
    <!--     <component class="icon icon-right" :is="iconRight" /> -->
    <!-- </motion.button> -->
    <button :class="preset" @click="$emit('click')">
        <component class="icon icon-left" :is="iconLeft" />
        <span v-if="showText && !isLoading">{{ text }}</span>
        <Loader v-if="isLoading" />
        <component class="icon icon-right" :is="iconRight" />
    </button>
</template>

<style lang="scss" scoped>
button {
    position: relative;
    cursor: pointer;
    border: 0;

    span {
        white-space: nowrap;
        letter-spacing: 0.05em;
    }

    &.primary,
    &.primary-alt,
    &.secondary {
        font-family: $primary-font-stack;
        transition: transform 0.1s ease-in;
        border-radius: $border-radius-xs;

        &:hover {
            transform: scale(1.05);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    &.primary,
    &.primary-alt {
        background: transparent;
        font-style: oblique;

        &:disabled {
            color: #dee2e699;
        }
    }

    &.primary {
        text-shadow: 1px 1px 2px #00000033;
        color: $color-bg-secondary;
    }

    &.primary-alt {
        color: $color-accent;
    }

    &.secondary {
        padding: $size-2 $size-4;
        background: $color-accent;
        color: $color-gray1;

        &:disabled {
            background: $color-gray5;
            color: $color-gray3;
        }
    }

    &.icon-only {
        @include flexCenterAll;
        border-radius: 20px;
        padding: 0.6em;
        background: $color-bg-secondary;
        transition: background 0.1s ease;
    }
}
</style>
