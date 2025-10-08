<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const dotCount = ref(0);
const loadingText = computed(() => `Loading${'.'.repeat(dotCount.value)}`);

let intervalId = null;
onMounted(() => {
    intervalId = setInterval(() => {
        dotCount.value = (dotCount.value + 1) % 4;
    }, 500);
});

onUnmounted(() => {
    clearInterval(intervalId);
});
</script>

<template>
    <div class="loading-text">{{ loadingText }}</div>
</template>
