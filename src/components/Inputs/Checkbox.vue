<script setup>
const props = defineProps({
    id: { type: String, required: true },
    modelValue: { required: true },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <input
        :value="modelValue"
        :checked="modelValue"
        :id="id"
        type="checkbox"
        :required="required"
        :disabled="disabled"
        @input="emit('update:modelValue', $event.target.checked)"
    />
</template>

<style lang="scss" scoped>
input[type='checkbox'] {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.2em;
    height: 1.2em;
    margin: 0;
    border: solid 2px $color-primary-light;
    border-radius: 5px;

    @include bp-xl-desktop {
        font-size: 0.8em;
    }

    &::before {
        content: '✓';
        color: white;
        text-align: center;
        width: 1.2em;
        height: 1.2em;
        background-color: $color-primary-light;
        border-radius: 5px;
        margin: 0;
        opacity: 0;
    }

    &:checked::before {
        opacity: 1;
    }
}
</style>
