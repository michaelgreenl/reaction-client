<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    text: { type: String, default: 'Loading' },
});

const dotCount = ref(0);
const loadingText = computed(() => `${props.text}${'.'.repeat(dotCount.value)}`);

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
    <div class="loading-text" :style="{ width: `${text.length}ch` }">
        <span>
            {{ loadingText }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
span {
    text-wrap: nowrap;
}
</style>
