<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useUtilAnimations } from '@/composables/animations/useUtilAnimations.js';

const props = defineProps({
    text: { type: [String, Number, null], required: true },
    enterOnly: { type: Boolean, default: false },
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
        if (!props.enterOnly) {
            fadeOut({
                selector: changingSpan.value,
                onComplete: async () => {
                    localText.value = newVal;
                    await nextTick();
                    fadeIn({ selector: changingSpan.value });
                },
            });
        } else {
            localText.value = newVal;
        }
    },
);
</script>

<template>
    <span ref="changingSpan">
        {{ localText }}
    </span>
</template>
