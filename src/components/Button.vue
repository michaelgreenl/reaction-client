<script setup>
defineEmits(['click']);

const props = defineProps({
    text: { type: String },
    showText: { type: Boolean, default: true },
    preset: { type: String, default: 'primary' },
});
</script>

<template>
    <button :class="preset" @click="$emit('click')">
        <span>{{ showText ? text : null }}</span>
    </button>
</template>

<style lang="scss" scoped>
button {
    position: relative;
    cursor: pointer;
    font-family: $primary-font-stack;
    border: 0;
    padding: 0.25em 1em;
    border-radius: 8px;

    span {
        font-size: 1.1em;
        white-space: nowrap;
        letter-spacing: 0.05em;
    }

    &.primary {
        background: $color-gray2;
    }

    &.secondary {
        background: $color-accent;
    }

    &:disabled {
        background: $color-gray5;
        color: $color-gray3;
    }
}
</style>
