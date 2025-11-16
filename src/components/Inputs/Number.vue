<script setup>
defineProps({
    modelValue: { type: Number, required: true },
    required: { type: Boolean, default: false },
    stepUpDisabled: { type: Boolean, default: false },
    stepDownDisabled: { type: Boolean, default: false },
});

defineEmits(['stepUp', 'stepDown']);
</script>

<template>
    <div class="number-input">
        <span> {{ Number.isInteger(modelValue) ? modelValue.toFixed(1) : modelValue.toString() }}s </span>
        <div class="step-buttons">
            <button :disabled="stepUpDisabled" type="button" @click="$emit('stepUp')">+</button>
            <button :disabled="stepDownDisabled" type="button" @click="$emit('stepDown')">−</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.number-input {
    @include flexCenterAll;
    gap: 0.1em;

    span {
        width: $size-10;
        text-align: right;
        color: $color-text-secondary-dark;
    }

    .step-buttons {
        @include flexCenterAll;
        flex-direction: column;
        height: 100%;
        padding-top: 0.1em;

        button {
            flex: 1;
            background: transparent;
            border: 0;
            font-size: 1.5em;
            padding: 0 $size-1;
            color: $color-gray4;
            transition: all 0.1s ease;
            line-height: 0.7em;

            &:hover {
                transform: scale(1.1);
                color: $color-accent;
            }

            &:active {
                transform: scale(0.9);
            }
        }
    }
}
</style>
