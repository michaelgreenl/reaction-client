<script setup>
defineEmits(['click']);

defineProps({
    text: { type: String },
});
</script>

<template>
    <button @click="$emit('click')">
        {{ text }}
    </button>
</template>
