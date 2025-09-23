import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        circleSize: 100,
        spawnInterval: 1,
        shrinkTime: 1,
    }),
});
