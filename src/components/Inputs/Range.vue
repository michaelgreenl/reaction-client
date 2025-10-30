<script setup>
import { ref } from 'vue';

const props = defineProps({
    id: { type: String, required: true },
    modelValue: { required: true },
    min: { required: true },
    max: { required: true },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showValue: { type: Boolean, default: false },
    inputActive: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'mousedown', 'mouseup']);

const rangeInput = ref(null);

function getCircleSizePercent() {
    const percent = (props.modelValue - 25) / 100;

    const outerLeft = rangeInput?.value.offsetWidth - rangeInput?.value.offsetWidth * 0.167;
    const outerRight = rangeInput?.value.offsetWidth - rangeInput?.value.offsetWidth * 0.056;

    return `${outerLeft - percent * outerRight}px`;
}
</script>

<template>
    <input
        ref="rangeInput"
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
    <span
        v-if="showValue && inputActive"
        class="range-value"
        :style="{ right: getCircleSizePercent(modelValue), top: '-0.9em' }"
    >
        {{ modelValue }}px
    </span>
</template>

<style lang="scss" scoped>
input[type='range'] {
    position: relative;
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
        transition: all 75ms ease;

        &:active {
            cursor: grabbing;
            height: 0.5em;
            width: 0.5em;
        }
    }

    &:active {
        &::-webkit-slider-thumb {
            transition: all 75ms ease;
            cursor: grabbing;
            height: 0.5em;
            width: 0.5em;
        }
    }
}

.range-value {
    position: absolute;
    right: 0;
    color: $color-text-secondary-dark;
}
</style>
