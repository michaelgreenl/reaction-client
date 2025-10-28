<script setup>
const props = defineProps({
    id: { type: String, required: true },
    modelValue: { type: String, required: true },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showPassword: { type: Boolean, default: true },
    passwordHideButton: { type: Boolean, default: false },
});

const emit = defineEmits(['toggleHideButton', 'update:modelValue', 'focus', 'blur']);
</script>

<template>
    <input
        :id="id"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        :required="required"
        :disabled="disabled"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="emit('update:modelValue', $event.target.value)"
    />
    <button
        v-if="passwordHideButton"
        type="button"
        class="toggle-password"
        @click="emit('toggleHideButton')"
        @mousedown.prevent
    >
        {{ showPassword ? 'Hide' : 'Show' }}
    </button>
</template>

<style lang="scss" scoped>
input[type='text'],
input[type='password'] {
    border-radius: $border-radius-sm;
    padding: $size-2;
    outline: 0;
    border: 2px solid $color-primary-light;
    background-color: $color-bg-secondary;
    color: $color-text-secondary-dark;
    width: 100%;

    &:focus {
        border-color: $color-accent;
    }
}

.toggle-password {
    font-size: 0.8em;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: $color-accent-light;

    &:hover {
        color: $color-accent;
    }
}
</style>
