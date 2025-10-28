<script setup>
const props = defineProps({
    id: { type: String, required: true },
    modelValue: { required: true },
    min: { required: true },
    max: { required: true },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'mousedown', 'mouseup']);
</script>

<template>
    <input
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :id="id"
        :required="required"
        :disabled="disabled"
        @mousedown="emit('mousedown')"
        @mouseup="emit('mouseup')"
        @input="emit('update:modelValue', $event.target.value)"
    />
</template>

<style lang="scss" scoped>
input[type='range'] {
    appearance: none;
    font-size: 1em;
    height: 0.5em;
    width: 50%;
    margin: 0.5em 0;
    background: $color-gray3;
    border-radius: 10px;

    &::-webkit-slider-thumb {
        appearance: none;
        position: relative;
        cursor: grab;
        height: 1em;
        width: 1em;
        background: $color-accent;
        border-radius: 50%;
        z-index: 2;
        transition: all 25ms ease;
    }

    &:-webkit-slider-thumb:active {
        cursor: grabbing;
    }
}
</style>
