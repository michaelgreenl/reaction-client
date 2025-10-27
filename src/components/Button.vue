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
    border: 0;

    span {
        white-space: nowrap;
        letter-spacing: 0.05em;
    }

    &.primary,
    &.secondary {
        font-family: $secondary-font-stack;
        transition: transform 0.1s ease-in;
        border-radius: $border-radius-xs;

        &:hover {
            transform: scale(1.05) translateY(-1px);
            transform: scale(1.05);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    &.primary {
        text-shadow: 1px 1px 2px #00000033;
        background: transparent;
        color: $color-bg-secondary;
        font-style: oblique;

        &:disabled {
            opacity: 0.5;
        }
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
