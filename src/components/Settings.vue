<script setup>
import { onMounted, onBeforeUnmount, computed, reactive, ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/Loader.vue';
import Button from '@/components/Button.vue';
import Circle from '@/components/Circle.vue';
import CloseIcon from '@/components/Icons/CloseSVG.vue';

const props = defineProps({
    showSettings: { type: Boolean, required: true },
});

const emit = defineEmits(['closeSettings']);

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
                <div class="form-container">
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
                        <input
                            id="circleSize"
                            v-model="localSettings.circleSize"
                            type="range"
                            min="25"
                            max="125"
                            :disabled="isLoading"
                        />
                    </div>
                    <div class="form-group">
                        <label for="spawnInterval">Spawn Interval</label>
                        <div class="number-input">
                            <span>
                                {{
                                    Number.isInteger(localSettings.spawnInterval)
                                        ? localSettings.spawnInterval.toFixed(1)
                                        : localSettings.spawnInterval.toString()
                                }}s
                            </span>
                            <div class="step-buttons">
                                <button
                                    @click="localSettings.spawnInterval += 0.25"
                                    :disabled="isLoading || localSettings.spawnInterval >= 2"
                                    type="button"
                                >
                                    +
                                </button>
                                <button
                                    @click="localSettings.spawnInterval -= 0.25"
                                    :disabled="isLoading || localSettings.spawnInterval === 0.25"
                                    type="button"
                                >
                                    −
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="shrinkTime">Shrink Time</label>
                        <div class="number-input">
                            <span>
                                {{
                                    Number.isInteger(localSettings.shrinkTime)
                                        ? localSettings.shrinkTime.toFixed(1)
                                        : localSettings.shrinkTime.toString()
                                }}s
                            </span>
                            <div class="step-buttons">
                                <button
                                    @click="localSettings.shrinkTime += 0.25"
                                    :disabled="isLoading || localSettings.shrinkTime >= 2"
                                    type="button"
                                >
                                    +
                                </button>
                                <button
                                    @click="localSettings.shrinkTime -= 0.25"
                                    :disabled="isLoading || localSettings.shrinkTime === 0.25"
                                    type="button"
                                >
                                    −
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <Circle
                class="settings-circle"
                :gameActive="true"
                :animation="false"
                :localSize="localSettings.circleSize"
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
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: $size-4;
    margin-bottom: $size-4;

    .form-circle {
        display: flex;
        align-items: center;
        gap: $size-8;

        .form-container {
            margin-bottom: $size-4;
            background: $color-bg-secondary;
            padding: $size-3 $size-5;
            border-radius: $border-radius-md;
            width: 20em;

            .form-header {
                display: flex;
                align-items: center;
                justify-content: space-between;

                h2 {
                    font-size: 1.4em;
                    font-family: $secondary-font-stack;
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
                border: 0;
                height: 2px;
                background-color: $color-primary-light;
                margin: $size-2 0;
            }

            .form-group {
                display: flex;
                justify-content: space-between;

                padding: $size-1;

                label {
                    font-size: 0.9em;
                    font-family: $primary-font-stack;
                    color: $color-text-secondary-dark;
                }

                input[type='range'] {
                    appearance: none;
                    height: 0.5em;
                    width: 40%;
                    margin: 0.5em 0;
                    background: $color-gray3;
                    border-radius: 10px;

                    &::-webkit-slider-thumb {
                        appearance: none;
                        position: relative;
                        cursor: grab;
                        height: 1em;
                        width: 1em;
                        background: $color-accent;
                        border-radius: 50%;
                        z-index: 2;
                        transition: all 25ms ease;
                    }

                    &:-webkit-slider-thumb:active {
                        cursor: grabbing;
                    }
                }

                .number-input {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    span {
                        text-align: center;
                        font-size: 0.85em;
                        font-family: $primary-font-stack;
                        color: $color-text-secondary-dark;
                    }

                    .step-buttons {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;

                        button {
                            flex: 1;
                            background: transparent;
                            border: 0;
                            font-size: 1.1em;
                            padding: 0 $size-1;
                            color: $color-gray4;
                            transition: all 0.1s ease;
                            line-height: 1ch;

                            &:hover {
                                transform: scale(1.1);
                                color: $color-accent;
                            }

                            &:active {
                                transform: scale(0.9);
                            }
                        }
                    }
                }
            }
        }
    }

    .form-buttons {
        display: flex;
        gap: $size-2;
    }
}
</style>
