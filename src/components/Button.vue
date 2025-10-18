<script setup>
import Loader from '@/components/Loader.vue';
defineEmits(['click']);

const props = defineProps({
    text: { type: String },
    showText: { type: Boolean, default: true },
    preset: { type: String, default: 'primary' },
    iconLeft: { type: Object },
    iconRight: { type: Object },
    isLoading: { type: Boolean, default: false },
});
</script>

<template>
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
    font-family: $primary-font-stack;
    border: 0;
    padding: 0.25em 1em;
    border-radius: $border-radius-xs;

    span {
        font-size: 1.1em;
        white-space: nowrap;
        letter-spacing: 0.05em;
    }

    &.primary,
    &.secondary {
        transition: transform 0.1s ease;

        &:hover {
            transform: scale(1.05);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    &.primary {
        background: $color-bg-secondary;

        &:disabled {
            background: $color-gray5;
            color: $color-gray3;
        }
    }

    &.secondary {
        background: $color-accent;
        color: $color-gray1;

        &:disabled {
            background: $color-gray5;
            color: $color-gray3;
        }
    }

    &.icon-only {
        border-radius: 20px;
        padding: $size-2;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $color-bg-secondary;
        transition: background 0.1s ease;
    }
}
</style>
