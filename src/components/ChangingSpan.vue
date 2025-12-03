<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useUtilAnimations } from '@/composables/animations/useUtilAnimations.js';

const props = defineProps({
    text: { type: [String, Number], required: true },
});

const { fadeIn, fadeOut } = useUtilAnimations();

const changingSpan = ref(null);
const localText = ref(props.text);

onMounted(() => {
    fadeIn({ selector: changingSpan.value });
});

watch(
    () => props.text,
    (newVal) => {
        fadeOut({
            selector: changingSpan.value,
            onComplete: async () => {
                localText.value = newVal;
                await nextTick();
                fadeIn({ selector: changingSpan.value });
            },
        });
    },
);
</script>

<template>
    <span ref="changingSpan">
        {{ localText }}
    </span>
</template>
