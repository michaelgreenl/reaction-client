<script setup>
import { onMounted, onBeforeUnmount, computed, reactive, ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/Loader.vue';
import Button from '@/components/Button.vue';

const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const isLoading = ref(false);

const localSettings = reactive({
    circleSize: settingsStore.circleSize,
    spawnInterval: settingsStore.spawnInterval,
    shrinkTime: settingsStore.shrinkTime,
});

function resetLocalSettings() {
    localSettings.circleSize = settingsStore.circleSize;
    localSettings.spawnInterval = settingsStore.spawnInterval;
    localSettings.shrinkTime = settingsStore.shrinkTime;
}

const settingsChanged = computed(() => {
    return (
        localSettings.circleSize !== settingsStore.circleSize ||
        localSettings.spawnInterval !== settingsStore.spawnInterval ||
        localSettings.shrinkTime !== settingsStore.shrinkTime
    );
});

onMounted(async () => {
    if (authStore.isAuthenticated) {
        await settingsStore.getSettings();
        resetLocalSettings();
    }
});

async function saveSettings() {
    if (!settingsChanged) return;

    isLoading.value = true;
    await settingsStore.setSettings({ ...localSettings }).then(() => {
        settingsStore.$patch({ ...localSettings });
        isLoading.value = false;
    });
}

onBeforeUnmount(() => {
    if (settingsChanged) {
        resetLocalSettings();
    }
});
</script>

<template>
    <div>
        <h1>Settings</h1>
        <form @submit.prevent="saveSettings">
            <div class="form-group">
                <label for="circleSize">Circle Size</label>
                <input
                    id="circleSize"
                    v-model="localSettings.circleSize"
                    type="range"
                    min="50"
                    max="150"
                    :disabled="isLoading"
                />
            </div>
            <div class="form-group">
                <label for="spawnInterval">Spawn Interval</label>
                <input
                    id="spawnInterval"
                    v-model.number="localSettings.spawnInterval"
                    type="number"
                    min="0.25"
                    max="2"
                    step="0.25"
                    :disabled="isLoading"
                />
            </div>
            <div class="form-group">
                <label for="shrinkTime">Shrink Time</label>
                <input
                    id="shrinkTime"
                    v-model.number="localSettings.shrinkTime"
                    type="number"
                    min="0.25"
                    max="2"
                    step="0.25"
                    :disabled="isLoading"
                />
            </div>
            <Button text="Cancel" @click="resetLocalSettings()" :disabled="!settingsChanged" />

            <!-- TODO: Add <Loader /> after adding api call -->
            <Button type="submit" text="Save" :disabled="isLoading || !settingsChanged" />
        </form>
    </div>
</template>

<style lang="scss" scoped></style>
