<script setup>
import { watch, onMounted, onBeforeUnmount, computed, reactive, ref } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
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

const settingsChanged = computed(() => {
    return (
        localSettings.circleSize !== settingsStore.circleSize ||
        localSettings.spawnInterval !== settingsStore.spawnInterval ||
        localSettings.shrinkTime !== settingsStore.shrinkTime
    );
});

const showChildren = ref(false);
const showForm = ref(false);

const settingsTransitionValues = {
    stiffness: 250,
    damping: 23,
    mass: 0.8,
};

const settingsTransition = {
    type: 'spring',
    ...settingsTransitionValues,
    layout: { type: 'spring', ...settingsTransitionValues },
};

const settingsVariants = {
    initial: { opacity: 0, x: -200, height: '5em', width: '5em' },
    open: { opacity: 1, x: 0, height: '180px', width: '20em' },
    exit: { opacity: 0, x: -200, height: 0, width: 0 },
};

onMounted(async () => {
    if (authStore.isAuthenticated) {
        await settingsStore.getSettings();
        resetLocalSettings();
    }

    if (props.showSettings) {
        showForm.value = true;

        setTimeout(() => {
            showChildren.value = true;
        }, 100);
    }
});

watch(
    () => props.showSettings,
    (newVal) => {
        if (newVal) {
            showForm.value = true;

            setTimeout(() => {
                showChildren.value = true;
            }, 100);
        } else {
            if (settingsChanged.value) {
                resetLocalSettings();
            }

            showChildren.value = false;

            setTimeout(() => {
                showForm.value = false;
                isLoading.value = false;
            }, 100);
        }
    },
);

function resetLocalSettings() {
    localSettings.circleSize = settingsStore.circleSize;
    localSettings.spawnInterval = settingsStore.spawnInterval;
    localSettings.shrinkTime = settingsStore.shrinkTime;
}

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

    showChildren.value = false;
    showForm.value = false;

    setTimeout(() => {
        emit('closeSettings');
    }, 200);
}

defineExpose({ saveSettings, resetLocalSettings, settingsChanged, isLoading });
</script>

<template>
    <div class="settings-container">
        <div class="form-circle" :class="showForm ? 'showing-settings' : undefined">
            <form @submit.prevent="saveSettings">
                <AnimatePresence>
                    <motion.div
                        v-if="showForm"
                        class="form-container psuedo-border"
                        layout
                        :transition="settingsTransition"
                        :variants="settingsVariants"
                        :initial="'initial'"
                        :animate="'open'"
                        :exit="'exit'"
                    >
                        <div class="form-header" :style="{ opacity: showChildren ? 1 : 0 }">
                            <h2>Settings</h2>
                            <Button
                                class="close-button"
                                preset="icon-only"
                                :iconLeft="CloseIcon"
                                @click="closeSettings()"
                            />
                        </div>
                        <motion.hr layout />
                        <div class="form-group" :style="{ opacity: showChildren ? 1 : 0 }">
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
                        <div class="form-group" :style="{ opacity: showChildren ? 1 : 0 }">
                            <label for="spawnInterval">Spawn Interval</label>
                            <NumberInput
                                v-model="localSettings.spawnInterval"
                                :stepUpDisabled="isLoading || localSettings.spawnInterval >= 2"
                                :stepDownDisabled="isLoading || localSettings.spawnInterval === 0.25"
                                @stepUp="localSettings.spawnInterval += 0.25"
                                @stepDown="localSettings.spawnInterval -= 0.25"
                            />
                        </div>
                        <div class="form-group" :style="{ opacity: showChildren ? 1 : 0 }">
                            <label for="shrinkTime">Shrink Time</label>
                            <NumberInput
                                v-model="localSettings.shrinkTime"
                                :stepUpDisabled="isLoading || localSettings.shrinkTime >= 2"
                                :stepDownDisabled="isLoading || localSettings.shrinkTime === 0.25"
                                @stepUp="localSettings.shrinkTime += 0.25"
                                @stepDown="localSettings.shrinkTime -= 0.25"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </form>
            <Circle
                class="settings-circle"
                :gameActive="true"
                :animation="false"
                :localSize="localSettings.circleSize"
                :inputActive="rangeInputActive"
            />
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
        flex-direction: column-reverse;
        gap: 0;
        font-size: 0.95em;

        &.showing-settings {
            gap: $size-8;
        }

        @include bp-sm-phone {
            flex-direction: row;
        }

        .form-container {
            position: relative;
            z-index: 2;
            background: $color-bg-secondary;
            margin-bottom: $size-4;
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
                margin: $size-3 $size-4 $size-2;
                opacity: 0;
                transition: opacity 0.3s ease;
                overflow: hidden;

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

                        @include bp-xxl-desktop {
                            font-size: 1.2em;
                        }
                    }
                }
            }

            hr {
                position: relative;
                z-index: 2;
                border: 0;
                height: 2px;
                background-color: $color-primary-light;
                margin: $size-2 $size-4;
            }

            .form-group {
                position: relative;
                z-index: 2;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: $size-1;
                margin: 0 $size-5;
                opacity: 0;
                transition: opacity 0.3s ease;

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
