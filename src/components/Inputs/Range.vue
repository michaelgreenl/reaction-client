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

<style lang="scss" scoped></style>
