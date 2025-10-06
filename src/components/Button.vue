<script setup>
defineEmits(['click']);

const props = defineProps({
    text: { type: String },
    showText: { type: Boolean, default: true },
});
</script>

<template>
    <button @click="$emit('click')">
        {{ showText ? text : null }}
    </button>
</template>
