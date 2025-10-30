<script setup>
import { computed, ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import { formatDate, formatTime } from '@/util/time.js';
import Button from '@/components/Button.vue';
import Loader from '@/components/Loader.vue';
import RangeInput from '@/components/Inputs/Range.vue';
import NumberInput from '@/components/Inputs/Number.vue';
import LogoSVG from '@/components/Icons/LogoSVG.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const isLoading = ref(true);
const loadingGames = ref(true);

const offset = ref(0);
const activePage = ref(1);
const activeGames = reactive({
    filtered: false,
    sorted: { by: 'createdAt', order: 'DESC' },
    games: [],
});

const filterDropdownRef = ref(null);
const showFilters = ref(false);
const filterToggles = reactive({ circleSize: true, spawnInterval: false, shrinkTime: false });

const settingsFilters = reactive({ ...settingsStore });
const showSettings = ref(true);
const rangeInputActive = ref(false);

const filtersAdded = computed(() => {
    return filterToggles.circleSize || filterToggles.spawnInterval || filterToggles.shrinkTime;
});

onMounted(async () => {
    await getUnfilteredGames().then(() => {
        isLoading.value = false;
        loadingGames.value = false;
    });
});

async function switchPage(newOffset, pageNum) {
    activePage.value = pageNum;
    offset.value = newOffset;

    if (!filtersAdded.value && !activeGames.filtered) {
        getUnfilteredGames();
    } else {
        filterGamesBySettings();
    }
}

async function getUnfilteredGames() {
    activeGames.filtered = false;

    loadingGames.value = true;
    const games = await authStore.getGames(10, offset.value, activeGames.sorted);
    loadingGames.value = false;
    activeGames.games.length = 0;
    activeGames.games.push(...games);
}

async function resetFilters() {
    settingsFilters.circleSize = 100;
    settingsFilters.spawnInterval = 1;
    settingsFilters.shrinkTime = 1;

    Object.keys(filterToggles).forEach((toggle) => {
        filterToggles[`${toggle}`] = false;
    });

    offset.value = 0;
    activePage.value = 1;
    await getUnfilteredGames();
}

async function filterGamesBySettings() {
    if (!filtersAdded.value && activeGames.filtered) {
        await resetFilters();
        return;
    } else if (!activeGames.filtered) {
        activeGames.filtered = true;
    }

    let filters = [];
    Object.keys(filterToggles).forEach((toggle) => {
        if (filterToggles[`${toggle}`]) {
            filters.push({ filter: toggle, value: settingsFilters[`${toggle}`] });
        }
    });

    loadingGames.value = true;
    const games = await authStore.getGamesBySettings(10, offset.value, filters, activeGames.sorted);
    loadingGames.value = false;
    activeGames.games.length = 0;
    activeGames.games.push(...games);
}

async function handleSort(by) {
    if (activeGames.sorted.by === by) {
        activeGames.sorted.order = activeGames.sorted.order === 'DESC' ? 'ASC' : 'DESC';
    } else {
        activeGames.sorted.by = by;
        activeGames.sorted.order = 'DESC';
    }

    if (!filtersAdded.value && !activeGames.filtered) {
        await getUnfilteredGames();
    } else {
        await filterGamesBySettings();
    }
}

function addAllFilters() {
    Object.keys(filterToggles).forEach((filter) => {
        filterToggles[`${filter}`] = true;
    });

    showFilters.value = false;
}

const dropdownListener = (e) => {
    if (!showFilters.value) {
        showFilters.value = true;
    } else if (e) {
        if (e.target !== filterDropdownRef.value && !e.composedPath().includes(filterDropdownRef.value)) {
            showFilters.value = false;
            window.removeEventListener('click', dropdownListener);
        }
    } else {
        showFilters.value = false;
        window.removeEventListener('click', dropdownListener);
    }
};

function toggleDropdown() {
    if (!showFilters.value) {
        window.addEventListener('click', dropdownListener);
    } else {
        dropdownListener();
    }
}
</script>

<template>
    <div class="profile-container">
        <div class="loader" v-if="isLoading">
            <Loader text="Loading Games" />
        </div>
        <div v-else class="main-wrapper">
            <div class="table-container" :class="`${showSettings ? 'show-settings' : undefined}`">
                <div class="table-header">
                    <div class="logo">
                        <LogoSVG />
                        <h1>Game History</h1>
                    </div>
                    <div class="toggle-buttons">
                        <Button
                            preset="primary-alt"
                            :text="`${showSettings ? 'Hide' : 'Show'} Settings`"
                            @click="showSettings = !showSettings"
                        />
                        <Button preset="primary-alt" text="Add Filters ▾" @click="toggleDropdown()" />
                    </div>
                    <div
                        v-if="showFilters"
                        ref="filterDropdownRef"
                        class="filter-toggles"
                        :class="`${showSettings ? 'showing-settings' : undefined}`"
                    >
                        <div v-for="key in Object.keys(settingsStore.settingsKeyVal)" :key="key" class="form-group">
                            <input
                                :id="`${key}Filter`"
                                type="checkbox"
                                v-model="filterToggles[`${key}`]"
                                :disabled="loadingGames"
                            />
                            <label :for="`${key}Filter`">
                                {{ settingsStore.settingsKeyVal[`${key}`] }}
                            </label>
                        </div>
                        <Button preset="primary-alt" text="+All" @click="addAllFilters()" />
                    </div>
                </div>
                <div class="filters">
                    <form v-if="filtersAdded" @submit.prevent="filterGamesBySettings">
                        <div class="form-groups">
                            <div class="form-group" v-if="filterToggles.circleSize">
                                <label for="circleSize">Circle Size</label>
                                <RangeInput
                                    id="circleSize"
                                    v-model="settingsFilters.circleSize"
                                    :min="25"
                                    :max="125"
                                    :disabled="loadingGames || !filterToggles.circleSize"
                                    :showValue="true"
                                    :inputActive="rangeInputActive"
                                    @mousedown="rangeInputActive = true"
                                    @mouseup="rangeInputActive = false"
                                />
                            </div>
                            <!-- TODO: Add seporater here with v-if="filterToggles.spawnInterval" (make sure to style differently if showSettings === true) -->
                            <div class="form-group" v-if="filterToggles.spawnInterval">
                                <label>Spawn Interval</label>
                                <NumberInput
                                    v-model="settingsFilters.spawnInterval"
                                    :stepUpDisabled="
                                        isLoading || !filterToggles.spawnInterval || settingsFilters.spawnInterval >= 2
                                    "
                                    :stepDownDisabled="
                                        isLoading ||
                                        !filterToggles.spawnInterval ||
                                        settingsFilters.spawnInterval === 0.25
                                    "
                                    @stepUp="settingsFilters.spawnInterval += 0.25"
                                    @stepDown="settingsFilters.spawnInterval -= 0.25"
                                />
                            </div>
                            <!-- TODO: Add seporater here with v-if="filterToggles.shrinkTime" (make sure to style differently if showSettings === true) -->
                            <div class="form-group" v-if="filterToggles.shrinkTime">
                                <label>Shrink Time</label>
                                <NumberInput
                                    v-model="settingsFilters.shrinkTime"
                                    :stepUpDisabled="
                                        loadingGames || !filterToggles.shrinkTime || settingsFilters.shrinkTime >= 2
                                    "
                                    :stepDownDisabled="
                                        loadingGames || !filterToggles.shrinkTime || settingsFilters.shrinkTime === 0.25
                                    "
                                    @stepUp="settingsFilters.shrinkTime += 0.25"
                                    @stepDown="settingsFilters.shrinkTime -= 0.25"
                                />
                            </div>
                        </div>
                        <div class="filter-form-buttons">
                            <Button
                                v-if="filtersAdded"
                                preset="primary-alt"
                                type="button"
                                text="Reset"
                                :disabled="loadingGames || !filtersAdded"
                                @click="resetFilters"
                            />
                            <Button
                                v-if="filtersAdded"
                                preset="primary-alt"
                                type="submit"
                                text="Save"
                                :disabled="loadingGames || (!filtersAdded && !activeGames.filtered)"
                            />
                        </div>
                    </form>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <Button
                                        preset="primary-alt"
                                        :text="`${activeGames.sorted.by !== 'score' ? 'Score' : activeGames.sorted.order === 'ASC' ? '▴ Score' : '▾ Score'}`"
                                        :disabled="loadingGames"
                                        @click="handleSort('score')"
                                    />
                                </th>
                                <th>
                                    <Button
                                        preset="primary-alt"
                                        :text="`${activeGames.sorted.by !== 'time' ? 'Time' : activeGames.sorted.order === 'ASC' ? '▴ Time' : '▾ Time'}`"
                                        :disabled="loadingGames"
                                        @click="handleSort('time')"
                                    />
                                </th>
                                <th v-if="showSettings">
                                    <Button text="Circle Size" class="setting" />
                                </th>
                                <th v-if="showSettings">
                                    <Button text="Spawn Interval" class="setting" />
                                </th>
                                <th v-if="showSettings">
                                    <Button text="Shrink Time" class="setting" />
                                </th>
                                <th>
                                    <Button
                                        preset="primary-alt"
                                        :text="`${activeGames.sorted.by !== 'createdAt' ? 'Date' : activeGames.sorted.order === 'ASC' ? '▴ Date' : '▾ Date'}`"
                                        :disabled="loadingGames"
                                        @click="handleSort('createdAt')"
                                    />
                                </th>
                            </tr>
                        </thead>
                        <div v-if="loadingGames" class="loader">
                            <Loader text="Loading" />
                        </div>
                        <div v-if="activeGames.games.length === 0 && !loadingGames" class="loader">
                            <span>No Games Found.</span>
                        </div>
                        <tbody
                            :style="{
                                // hiding element so the height can still affect the table size
                                visibility: `${loadingGames ? 'hidden' : 'visible'}`,
                                height: `${activeGames.games.length > 0 ? activeGames.games.length * 26 : 260}px`,
                            }"
                        >
                            <tr v-for="(game, i) in activeGames.games">
                                <td :class="`${activeGames.sorted.by === 'score' ? 'sorted' : undefined}`">
                                    {{ game.score }}
                                </td>
                                <td :class="`${activeGames.sorted.by === 'time' ? 'sorted' : undefined}`">
                                    {{ formatTime(game.time) }}
                                </td>
                                <td v-if="showSettings">{{ game.settings.circleSize }}px</td>
                                <td v-if="showSettings">
                                    {{
                                        game.settings.spawnInterval.toString().length === 4
                                            ? game.settings.spawnInterval.toFixed(2)
                                            : game.settings.spawnInterval.toFixed(1)
                                    }}
                                </td>
                                <td v-if="showSettings">
                                    {{
                                        game.settings.shrinkTime.toString().length === 4
                                            ? game.settings.shrinkTime.toFixed(2)
                                            : game.settings.shrinkTime.toFixed(1)
                                    }}
                                </td>
                                <td
                                    class="date"
                                    :class="`${activeGames.sorted.by === 'createdAt' ? 'sorted' : undefined}`"
                                >
                                    {{ formatDate(game.createdAt) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="table-nav">
                    <Button
                        preset="primary-alt"
                        text="prev"
                        :disabled="loadingGames || offset === 0"
                        @click="switchPage((offset -= 10), activePage - 1)"
                    />
                    <span>
                        {{ activePage }}
                    </span>
                    <Button
                        preset="primary-alt"
                        text="next"
                        :disabled="
                            loadingGames ||
                            authStore.userStats?.totalGames < 10 ||
                            activeGames.games.length === 0 ||
                            offset + 10 >= authStore.userStats?.totalGames
                        "
                        @click="switchPage((offset += 10), activePage + 1)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.profile-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    flex-direction: column;
    height: 100%;

    .main-wrapper {
        @include flexCenterAll;
        flex-direction: column;
        width: 100%;
        margin-bottom: $size-4;

        .table-container {
            position: relative;
            @include flexCenterAll;
            flex-direction: column;
            background: $color-bg-secondary;
            border-radius: $border-radius-md;
            box-shadow: $box-shadow;
            padding: $size-2 $size-4;
            border: solid 1px $color-gray3;
            max-width: 19em;

            &::before {
                content: '';
                position: absolute;
                z-index: 1;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                border-radius: $border-radius-md;
                border: solid 2px $color-primary-light;
            }

            &::after {
                content: '';
                position: absolute;
                z-index: 0;
                top: -5px;
                right: -5px;
                bottom: -5px;
                left: -5px;
                border-radius: $border-radius-xl;
                background: $color-bg-secondary;
            }

            &.show-settings {
                max-width: 34em;

                .table-header {
                    justify-content: space-between;
                }

                .filters {
                    width: 46.5em;

                    form .form-groups {
                        gap: $size-3;
                        width: fit-content;

                        .form-group {
                            width: fit-content;
                            justify-content: center;
                            max-width: 16em;
                        }
                    }
                }
            }

            .table-header {
                position: relative;
                z-index: 2;
                display: flex;
                flex-wrap: wrap;
                padding: $size-1 $size-1 $size-3;
                width: 100%;
                border-bottom: solid 1px $color-primary-light;
                justify-content: center;

                .logo {
                    @include flexCenterAll;

                    svg {
                        height: 1.7em;
                        width: 1.7em;
                    }

                    h1 {
                        margin-left: -2px;
                        font-size: 1.5em;
                        color: $color-accent;
                        margin: 0;
                    }
                }

                .toggle-buttons {
                    display: flex;
                    margin-top: $size-1;
                    padding-left: $size-1;
                }

                .filter-toggles {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    margin: $size-1 $size-2;
                    padding: 0.4em;
                    padding-right: $size-4;
                    background: $color-bg-secondary;
                    box-shadow: $box-shadow;
                    border-radius: $border-radius-xs;
                    width: fit-content;
                    border: solid 1px $color-gray3;
                    top: 3.5em;
                    right: 1em;
                    right: 0.5em;

                    &.showing-settings {
                        top: 2em;
                        right: 0;
                    }

                    .form-group {
                        display: flex;
                        align-items: center;

                        input {
                            cursor: pointer;
                        }

                        label {
                            font-size: 0.8em;
                            color: $color-text-primary-dark;
                        }
                    }

                    :deep(button) {
                        align-self: flex-end;
                        font-size: 0.75em;
                        padding-right: 0;
                    }
                }
            }

            .filters {
                position: relative;
                z-index: 1;
                font-size: 0.7em;
                display: flex;
                align-items: center;
                width: 23em;

                form {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    width: 100%;
                    padding: $size-1 $size-4;

                    .form-groups {
                        @include flexCenterAll;
                        flex-wrap: wrap;
                        gap: $size-2;
                        width: 100%;
                        padding: $size-2;
                        margin: 0 auto;

                        .form-group {
                            position: relative;
                            display: flex;
                            align-items: center;
                            width: 200%;
                            justify-content: space-between;
                            gap: $size-2;

                            label {
                                font-size: 1.1em;
                            }

                            label,
                            span {
                                color: $color-text-secondary-dark;
                                white-space: nowrap;
                            }

                            :deep(.number-input) {
                                span {
                                    font-size: 1em;
                                }
                            }
                        }
                    }

                    .filter-form-buttons {
                        @include flexCenterAll;
                        margin-left: auto;

                        :deep(button) {
                            font-size: 1.1em;
                        }
                    }
                }
            }

            .table-wrapper {
                position: relative;
                z-index: 1;
                padding: $size-1 $size-2;

                table {
                    table-layout: fixed;
                    position: relative;
                    border-bottom: solid 1px $color-gray3;
                    border-collapse: collapse;

                    .loader {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: 100%;
                        color: $color-text-secondary-dark;
                        margin: 1em auto 0;

                        span {
                            font-size: 0.9em;
                            text-shadow: 1px 1px 2px #00000033;
                        }
                    }

                    :deep(button) {
                        font-size: 1.2em;

                        &.setting {
                            font-size: 0.8em;
                            color: $color-text-secondary-dark;
                            cursor: auto;

                            span {
                                white-space: wrap;
                            }

                            &:hover {
                                transform: scale(1); // reverting the button preset's hover transform properties
                            }
                        }
                    }

                    th,
                    td {
                        width: 8ch;
                        text-align: center;
                    }

                    th {
                        padding: $size-1;
                        padding-bottom: $size-1;
                    }

                    td {
                        font-size: 0.85em;
                        color: $color-text-secondary-dark;
                        font-weight: 500;
                        width: 6ch;
                        border: solid 1px $color-gray3;

                        &.date {
                            font-family: $secondary-font-stack;
                            width: 20ch;
                            font-size: 0.75em;
                            font-weight: 400;
                            color: $color-gray6;
                        }

                        &.sorted {
                            background: darken-color($color-gray1, 2%);
                        }
                    }
                }
            }

            .table-nav {
                position: relative;
                z-index: 1;
                @include flexCenterAll;
                padding-top: $size-1;

                :deep(button) {
                    font-size: 1em;
                }

                span {
                    color: $color-text-secondary-dark;
                    border-bottom: solid 1px $color-gray3;
                    width: 1ch;
                    text-align: center;
                }
            }
        }
    }
}
</style>
