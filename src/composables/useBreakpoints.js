import { ref, onMounted, onUnmounted } from 'vue';

export function useBreakpoints() {
    const isMobile = ref(false);
    const isLgDesktop = ref(false);
    const isXlDesktop = ref(false);

    const update = () => {
        const width = window.innerWidth;

        isMobile.value = width < 682;
        isLgDesktop.value = width > 1200;
        isXlDesktop.value = width > 1600;
    };

    onMounted(() => {
        window.addEventListener('resize', update);
        update();
    });

    onUnmounted(() => {
        window.removeEventListener('resize', update);
    });

    return { isMobile, isLgDesktop, isXlDesktop };
}
