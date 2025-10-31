<script setup>
import { onMounted, onBeforeUnmount, computed, reactive, ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/Loader.vue';
import Button from '@/components/Button.vue';
import Circle from '@/components/Circle.vue';
import RangeInput from '@/components/Inputs/Range.vue';
import NumberInput from '@/components/Inputs/Number.vue';
import CloseIcon from '@/components/Icons/CloseSVG.vue';

const props = defineProps({
    showSettings: { type: Boolean, required: true },
});

const emit = defineEmits(['closeSettings']);

const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const isLoading = ref(false);
const rangeInputActive = ref(false);

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
    if (!settingsChanged.value) return;

    isLoading.value = true;
    await settingsStore.setSettings({ ...localSettings }).then(() => {
        settingsStore.$patch({ ...localSettings });
        isLoading.value = false;
    });
}

function closeSettings() {
    if (settingsChanged.value) {
        resetLocalSettings();
    }

    isLoading.value = false;
    emit('closeSettings');
}

onBeforeUnmount(() => {
    if (settingsChanged.value) {
        resetLocalSettings();
    }
});
</script>

<template>
    <div class="settings-container">
        <div class="form-circle">
            <form v-if="showSettings" @submit.prevent="saveSettings">
                <div class="form-container psuedo-border">
                    <div class="form-header">
                        <h2>Settings</h2>
                        <Button
                            class="close-button"
                            preset="icon-only"
                            :iconLeft="CloseIcon"
                            @click="closeSettings()"
                        />
                    </div>
                    <hr />
                    <div class="form-group">
                        <label for="circleSize">Circle Size</label>
                        <RangeInput
                            id="circleSize"
                            v-model="localSettings.circleSize"
                            :min="25"
                            :max="125"
                            :disabled="isLoading"
                            @mousedown="rangeInputActive = true"
                            @mouseup="rangeInputActive = false"
                        />
                    </div>
                    <div class="form-group">
                        <label for="spawnInterval">Spawn Interval</label>
                        <NumberInput
                            v-model="localSettings.spawnInterval"
                            :stepUpDisabled="isLoading || localSettings.spawnInterval >= 2"
                            :stepDownDisabled="isLoading || localSettings.spawnInterval === 0.25"
                            @stepUp="localSettings.spawnInterval += 0.25"
                            @stepDown="localSettings.spawnInterval -= 0.25"
                        />
                    </div>
                    <div class="form-group">
                        <label for="shrinkTime">Shrink Time</label>
                        <NumberInput
                            v-model="localSettings.shrinkTime"
                            :stepUpDisabled="isLoading || localSettings.shrinkTime >= 2"
                            :stepDownDisabled="isLoading || localSettings.shrinkTime === 0.25"
                            @stepUp="localSettings.shrinkTime += 0.25"
                            @stepDown="localSettings.shrinkTime -= 0.25"
                        />
                    </div>
                </div>
            </form>
            <Circle
                class="settings-circle"
                :gameActive="true"
                :animation="false"
                :localSize="localSettings.circleSize"
                :inputActive="rangeInputActive"
            />
        </div>
        <div v-if="showSettings" class="form-buttons">
            <Button text="Cancel" @click="resetLocalSettings()" :disabled="!settingsChanged" />
            <Button
                type="submit"
                @click="saveSettings()"
                text="Save"
                :isLoading="isLoading"
                :disabled="isLoading || !settingsChanged"
            />
            <slot name="startButton"></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.settings-container {
    @include flexCenterAll;
    flex-direction: column;
    gap: $size-4;
    margin-bottom: $size-4;

    .form-circle {
        display: flex;
        align-items: center;
        gap: $size-8;

        .form-container {
            position: relative;
            z-index: 2;
            margin-bottom: $size-4;
            background: $color-bg-secondary;
            padding: $size-3 $size-5;
            border-radius: $border-radius-md;
            box-shadow: $box-shadow;
            border: solid 1px $color-gray3;
            width: 20em;

            .form-header {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: space-between;

                h2 {
                    font-size: 1.4em;
                    margin: 0;
                    color: $color-accent;
                }

                .close-button {
                    &:hover {
                        background: #ec6e9e22;
                    }

                    :deep(.icon) {
                        height: 0.9em;
                        width: 0.9em;
                        stroke: $color-accent;

                        path {
                            stroke-width: 14 !important;
                        }
                    }
                }
            }

            hr {
                position: relative;
                z-index: 2;
                border: 0;
                height: 1px;
                background-color: $color-primary-light;
                margin: $size-2 0;
            }

            .form-group {
                position: relative;
                z-index: 2;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: $size-1;

                label {
                    font-size: 0.9em;
                    color: $color-text-secondary-dark;
                }

                input[type='range'] {
                    width: 40% !important;
                }

                :deep(.number-input) {
                    span {
                        font-size: 0.85em;
                    }
                }
            }
        }
    }

    .form-buttons {
        display: flex;
        gap: $size-2;

        :deep(button) {
            font-size: 1.2em;
        }
    }
}
</style>
