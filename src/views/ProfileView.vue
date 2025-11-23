<script setup>
import { computed, ref, reactive, onMounted, nextTick } from 'vue';
import { gsap } from 'gsap';
import Flip from 'gsap/Flip';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import { formatDate, formatTime } from '@/util/time.js';
import { useBreakpoints } from '@/composables/useBreakpoints.js';
import Button from '@/components/Button.vue';
import Loader from '@/components/Loader.vue';
import RangeInput from '@/components/Inputs/Range.vue';
import NumberInput from '@/components/Inputs/Number.vue';
import CheckboxInput from '@/components/Inputs/Checkbox.vue';
import LogoSVG from '@/components/Icons/LogoSVG.vue';

gsap.registerPlugin(Flip);

const { isMobile, isLgDesktop, isXlDesktop } = useBreakpoints();

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const filterDropdownRef = ref(null);

const isLoading = ref(true);
const loadingGames = ref(true);

const showFilters = ref(false);
const showFilterInputs = ref(false);
const showSettings = ref(true);

const offset = ref(0);
const activePage = ref(1);
const activeGames = reactive({
    filtered: false,
    sorted: { by: 'createdAt', order: 'DESC' },
    games: [],
});

const filterToggles = reactive({ circleSize: false, spawnInterval: false, shrinkTime: false });
const addedFilters = ref([]);
const settingsFilters = reactive({ ...settingsStore });
const rangeInputActive = ref(false);

const filterInputs = computed(() => [
    {
        key: 'circleSize',
        label: 'Circle Size',
        component: RangeInput,
        props: {
            min: 25,
            max: 125,
            disabled: loadingGames.value || !filterToggles.circleSize,
            showValue: true,
            inputActive: rangeInputActive.value,
        },
        on: {
            mousedown: () => (rangeInputActive.value = true),
            mouseup: () => (rangeInputActive.value = false),
        },
    },
    {
        key: 'spawnInterval',
        label: 'Spawn Interval',
        component: NumberInput,
        props: {
            stepUpDisabled: isLoading.value || !filterToggles.spawnInterval || settingsFilters.spawnInterval >= 2,
            stepDownDisabled: isLoading.value || !filterToggles.spawnInterval || settingsFilters.spawnInterval <= 0.25,
        },
        on: {
            stepUp: () => (settingsFilters.spawnInterval += 0.25),
            stepDown: () => (settingsFilters.spawnInterval -= 0.25),
        },
    },
    {
        key: 'shrinkTime',
        label: 'Shrink Time',
        component: NumberInput,
        props: {
            stepUpDisabled: loadingGames.value || !filterToggles.shrinkTime || settingsFilters.shrinkTime >= 2,
            stepDownDisabled: loadingGames.value || !filterToggles.shrinkTime || settingsFilters.shrinkTime <= 0.25,
        },
        on: {
            stepUp: () => (settingsFilters.shrinkTime += 0.25),
            stepDown: () => (settingsFilters.shrinkTime -= 0.25),
        },
    },
]);

const visibleFilterInputs = computed(() => {
    return addedFilters.value.map((key) => filterInputs.value.find((input) => input.key === key));
});

const filtersAdded = computed(() => {
    return addedFilters.value.length > 0;
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

    if (games) {
        activeGames.games.push(...games);
    }
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

async function toggleFilterInput(key) {
    const targets = '.filters, .input-form-group, .filter-form-buttons, .filter-form-seperator';
    const flipOpts = {
        duration: 0.3,
        ease: 'power3.out',
        nested: true,
    };

    const state = Flip.getState(targets);

    const tl = gsap.timeline();
    if (!filterToggles[key]) {
        const oldFiltersAdded = filtersAdded.value;

        filterToggles[key] = true;
        addedFilters.value.push(key);
        showFilterInputs.value = filtersAdded.value;

        await nextTick();

        if (!oldFiltersAdded) {
            showFilterInputsAnim({ tl });
            enterFilterButtonsAnim({ tl });
            enterFilterInputAnim(key, { delay: 0.1 });
        } else {
            enterFilterInputAnim(key, { delay: 0.2 });
            Flip.from(state, flipOpts);
        }
    } else {
        const onComplete = async () => {
            filterToggles[key] = false;

            const index = addedFilters.value.indexOf(key);
            if (index > -1) {
                addedFilters.value.splice(index, 1);
            }

            showFilterInputs.value = filtersAdded.value;

            await nextTick();
            Flip.from(state, flipOpts);
        };

        if (visibleFilterInputs.value.length === 1) {
            exitFilterInputAnim(key, { tl });
            hideFilterInputsAnim({ tl, onComplete });
        } else {
            exitFilterInputAnim(key, { tl, onComplete });
        }
    }
}

async function addAllFilters() {
    const targets = '.filters, .input-form-group, .filter-form-buttons, .filter-form-seperator';
    const flipOpts = {
        duration: 0.3,
        ease: 'power3.out',
        nested: true,
    };

    const state = Flip.getState(targets);
    const tl = gsap.timeline();

    showFilterInputs.value = true;

    const keysToAdd = Object.keys(filterToggles);
    keysToAdd.forEach((key) => {
        if (!filterToggles[key]) {
            filterToggles[key] = true;
            addedFilters.value.push(key);
        }
    });

    await nextTick();
    showFilterInputsAnim();
    enterAllFilterInputsAnim();
    enterFilterButtonsAnim();
    Flip.from(state, flipOpts);
    toggleFilterDropdown();
}

async function resetFilters() {
    const onComplete = async () => {
        Object.keys(filterToggles).forEach((toggle) => {
            filterToggles[toggle] = false;
        });
        addedFilters.value = [];

        settingsFilters.circleSize = settingsStore.circleSize;
        settingsFilters.spawnInterval = settingsStore.spawnInterval;
        settingsFilters.shrinkTime = settingsStore.shrinkTime;

        offset.value = 0;
        activePage.value = 1;
        await getUnfilteredGames();
    };

    const tl = gsap.timeline();
    exitAllFilterInputsAnim({
        onStart: () => {
            setTimeout(() => {
                hideFilterInputsAnim({ tl, onComplete });
            }, 250);
        },
    });
}

const filterDropdownListener = async (e) => {
    if (!showFilters.value) {
        showFilters.value = true;
        await nextTick();
        showFilterDropdownAnim();
    } else if (e) {
        if (e.target !== filterDropdownRef.value && !e.composedPath().includes(filterDropdownRef.value)) {
            hideFilterDropdownAnim({ onComplete: () => (showFilters.value = false) });
            window.removeEventListener('click', filterDropdownListener);
        }
    } else {
        hideFilterDropdownAnim({ onComplete: () => (showFilters.value = false) });
        window.removeEventListener('click', filterDropdownListener);
    }
};

function toggleFilterDropdown() {
    if (!showFilters.value) {
        window.addEventListener('click', filterDropdownListener);
    } else {
        filterDropdownListener();
    }
}

function showFilterDropdownAnim({ tl = gsap.timeline() } = {}) {
    tl.to('.filter-toggles', {
        duration: 0.4,
        ease: 'power4.out',
        width: 'auto',
    })
        .to(
            '.filter-toggles',
            {
                duration: 0.3,
                ease: 'power3.out',
                height: 'auto',
            },
            0.05,
        )
        .to(
            '.filter-form-group',
            {
                duration: 0.2,
                ease: 'linear',
                opacity: 1,
            },
            0.1,
        )
        .to(
            '.filter-toggles-button',
            {
                duration: 0.2,
                ease: 'linear',
                opacity: 1,
            },
            0.15,
        );
}

function hideFilterDropdownAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
    tl.to('.filter-toggles-button', {
        duration: 0.2,
        ease: 'linear',
        opacity: 0,
        onComplete,
    })
        .to(
            '.filter-form-group',
            {
                duration: 0.2,
                ease: 'linear',
                opacity: 0,
            },
            0.05,
        )
        .to(
            '.filter-toggles',
            {
                duration: 0.3,
                ease: 'power3.out',
                height: 0,
            },
            0.1,
        )
        .to(
            '.filter-toggles',
            {
                duration: 0.4,
                ease: 'power4.out',
                width: 0,
            },
            0.15,
        );
}

function showFilterInputsAnim({ tl = gsap.timeline(), onStart = () => {} } = {}) {
    tl.to('.filters', {
        duration: 0.4,
        ease: 'power3.out',
        height: 'auto',
        onStart,
    });
}

function hideFilterInputsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
    tl.to('.filter-form-button', {
        duration: 0.1,
        ease: 'linear',
        opacity: 0,
    }).to(
        '.filters',
        {
            duration: 0.4,
            ease: 'power3.out',
            height: 0,
            onComplete,
        },
        0.1,
    );
}

function enterFilterInputAnim(key, { tl = gsap.timeline(), delay = 0, onComplete = () => {} } = {}) {
    const seperatorSelector =
        visibleFilterInputs.value.length === 1 ? null : `.seperator-${visibleFilterInputs.value.length - 2}`;

    if (!seperatorSelector || !showSettings.value || isMobile.value) {
        tl.to(`.form-group-${key}`, {
            duration: 0.3,
            ease: 'power3.out',
            opacity: 1,
            delay,
            onComplete,
        });
    } else {
        tl.to(seperatorSelector, {
            duration: 0.3,
            ease: 'power3.out',
            opacity: 1,
            scale: 1,
            delay,
        }).to(
            `.form-group-${key}`,
            {
                duration: 0.3,
                ease: 'power3.out',
                delay,
                opacity: 1,
                onComplete,
            },
            0,
        );
    }
}

function exitFilterInputAnim(key, { tl = gsap.timeline(), onComplete = () => {} } = {}) {
    const seperatorSelector =
        visibleFilterInputs.value.length === 1 ? null : `.seperator-${visibleFilterInputs.value.length - 2}`;

    if (!seperatorSelector || !showSettings.value || isMobile.value) {
        tl.to(`.form-group-${key}`, {
            duration: 0.3,
            ease: 'power3.out',
            opacity: 0,
            onComplete,
        });
    } else {
        tl.to(seperatorSelector, {
            duration: 0.3,
            ease: 'linear',
            opacity: 0,
            scale: 0,
        }).to(
            `.form-group-${key}`,
            {
                duration: 0.3,
                ease: 'power3.out',
                opacity: 0,
                onComplete,
            },
            0,
        );
    }
}

function enterAllFilterInputsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
    tl.to(
        '.filter-form-seperator',
        {
            duration: 0.3,
            ease: 'linear',
            opacity: 1,
            scale: 1,
        },
        0,
    ).to(
        '.input-form-group',
        {
            duration: 0.3,
            ease: 'power3.out',
            opacity: 1,
            stagger: 0.1,
            onComplete,
        },
        0,
    );
}

function exitAllFilterInputsAnim({ tl = gsap.timeline(), onComplete = () => {}, onStart = () => {} } = {}) {
    tl.to('.filter-form-seperator', {
        duration: 0.3,
        ease: 'linear',
        opacity: 0,
        scale: 0,
    }).to(
        '.input-form-group',
        {
            duration: 0.3,
            ease: 'power3.out',
            opacity: 0,
            stagger: 0.05,
            onStart,
            onComplete,
        },
        0,
    );
}

function enterFilterButtonsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
    tl.to('.filter-form-button', {
        duration: 0.3,
        ease: 'linear',
        opacity: 1,
        x: 0,
        stagger: 0.1,
        onComplete,
    });
}

function showSettingsColumns({ tl = gsap.timeline() } = {}) {}

function hideSettingsColumns({ tl = gsap.timeline() } = {}) {}
</script>

<template>
    <div class="profile-container">
        <div class="user-stats psuedo-border" :class="`${showSettings ? 'show-settings' : undefined}`">
            <div class="stat-wrapper">
                <span class="label">High Score:</span>
                <hr />
                <span class="stat">{{ authStore.userStats.highScore }}</span>
            </div>
            <span class="seperator"> | </span>
            <div class="stat-wrapper">
                <span class="label">Longest Time:</span>
                <hr />
                <span class="stat">{{ formatTime(authStore.userStats.highTime) }}</span>
            </div>
            <span class="seperator"> | </span>
            <div class="stat-wrapper">
                <span class="label">Games Played:</span>
                <hr />
                <span class="stat">{{ authStore.userStats.totalGames }}</span>
            </div>
        </div>
        <div v-if="isLoading" class="loader">
            <Loader text="Loading Games" />
        </div>
        <div v-else class="main-wrapper">
            <div class="table-container psuedo-border" :class="`${showSettings ? 'show-settings' : undefined}`">
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
                        <Button preset="primary-alt" text="Add Filters ▾" @click="toggleFilterDropdown()" />
                    </div>
                    <div
                        v-if="showFilters"
                        ref="filterDropdownRef"
                        class="filter-toggles psuedo-border"
                        :class="`${showSettings ? 'showing-settings' : undefined}`"
                    >
                        <div
                            v-for="key in Object.keys(settingsStore.settingsKeyVal)"
                            :key="key"
                            class="form-group filter-form-group"
                        >
                            <CheckboxInput
                                :id="`${key}Filter`"
                                type="checkbox"
                                :disabled="loadingGames"
                                :model="filterToggles[`${key}`]"
                                @input="toggleFilterInput(key)"
                            />
                            <label :for="`${key}Filter`">
                                {{ settingsStore.settingsKeyVal[`${key}`] }}
                            </label>
                        </div>
                        <Button
                            class="filter-toggles-button"
                            preset="primary-alt"
                            text="+All"
                            @click="addAllFilters()"
                        />
                    </div>
                </div>
                <div class="filters" v-if="showFilterInputs">
                    <form v-if="filtersAdded" @submit.prevent="filterGamesBySettings">
                        <div class="form-groups">
                            <template v-for="(input, i) in visibleFilterInputs" :key="input.key">
                                <div class="form-group input-form-group" :class="`form-group-${input.key}`">
                                    <label :for="input.key">{{ input.label }}</label>
                                    <component
                                        :is="input.component"
                                        :id="input.key"
                                        v-model="settingsFilters[input.key]"
                                        v-bind="input.props"
                                        v-on="input.on"
                                    />
                                </div>
                                <span
                                    v-if="i < visibleFilterInputs.length - 1 && showSettings"
                                    class="seperator filter-form-seperator"
                                    :class="`seperator-${i}`"
                                >
                                    |
                                </span>
                            </template>
                        </div>
                        <div class="filter-form-buttons">
                            <Button
                                class="filter-form-button"
                                preset="primary-alt"
                                type="button"
                                text="Reset"
                                :disabled="loadingGames || !filtersAdded"
                                @click="resetFilters"
                            />
                            <Button
                                class="filter-form-button"
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
                            <tr v-for="game in activeGames.games" :key="game.createdAt">
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
                                    <span>
                                        {{ formatDate(game.createdAt) }}
                                    </span>
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
    gap: 0.5em;
    flex-direction: column;
    padding-top: $size-2;

    @include bp-xl-desktop {
        padding-top: 0;
    }

    .user-stats {
        position: relative;
        @include flexCenterAll;
        gap: $size-1;
        flex-direction: column;
        padding: $size-3 $size-4;
        width: 19em;

        @include bp-custom-min(450) {
            width: 22em;
        }

        @include bp-sm-phone {
            &.show-settings {
                width: 34em;
                flex-direction: row;
                gap: $size-4;

                .seperator {
                    display: block;
                }

                .stat-wrapper {
                    width: fit-content;

                    hr {
                        display: none;
                    }
                }
            }
        }

        span {
            position: relative;
            z-index: 2;
            font-size: 0.5em;
            font-weight: 500;
            color: $color-gray3;
        }

        .seperator {
            display: none;
        }

        .stat-wrapper {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            gap: $size-1;
            width: 100%;

            span {
                font-size: 0.95em !important;
                color: $color-text-secondary-dark;
                line-height: 1.6ch;

                &.label {
                    color: $color-accent;
                    line-height: 1.6ch;
                }
            }

            hr {
                border: 0;
                border-bottom: dotted 2px $color-gray4;
                flex: 1;
                align-self: flex-end;
                margin: 0 0 $size-1;
            }
        }
    }

    .main-wrapper {
        @include flexCenterAll;
        flex-direction: column;
        width: 100%;
        margin-bottom: $size-8;
        padding-top: $size-2;

        .table-container {
            position: relative;
            @include flexCenterAll;
            flex-direction: column;
            padding: $size-4 $size-6;
            border: solid 1px $color-gray3;
            max-width: 19em;

            @include bp-custom-min(450) {
                max-width: 22em;
            }

            @include bp-sm-phone {
                &.show-settings {
                    max-width: 34em;

                    .table-header {
                        justify-content: space-between;
                    }

                    .filters {
                        width: 49em;

                        form {
                            height: 100%;

                            .form-groups {
                                width: fit-content;
                                flex-wrap: nowrap;

                                .form-group {
                                    width: fit-content;
                                    max-width: 15em;
                                }

                                .seperator {
                                    display: block;
                                    font-size: 0.5em;
                                    color: $color-gray3;
                                    margin: 0 $size-4;
                                    transform: scale(0);
                                    opacity: 0;
                                }
                            }
                        }

                        .filter-form-buttons {
                            padding-right: $size-5;
                        }
                    }
                }
            }

            .table-header {
                position: relative;
                z-index: 3;
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

                    @include bp-xl-desktop {
                        :deep(button) {
                            font-size: 0.9em;
                        }
                    }
                }

                .filter-toggles {
                    position: absolute;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    gap: $size-1;
                    margin: $size-1 $size-2;
                    padding: 0.5em;
                    padding-right: $size-3;
                    width: fit-content;
                    top: 3.5em;
                    right: -1em;
                    overflow: hidden;
                    height: 8px;
                    width: 8px;

                    @include bp-xs-phone {
                        right: $size-1;
                    }

                    @include bp-custom-min(450) {
                        right: $size-7;
                    }

                    @include bp-sm-phone {
                        &.showing-settings {
                            top: 2em;
                            right: 0;
                        }
                    }

                    .form-group {
                        position: relative;
                        z-index: 2;
                        display: flex;
                        align-items: center;
                        gap: $size-1;
                        margin: 0 $size-1;
                        opacity: 0;

                        &:first-child {
                            margin-top: $size-1;
                        }

                        input {
                            cursor: pointer;
                        }

                        label {
                            font-size: 0.8em;
                            color: $color-text-primary-dark;
                            white-space: nowrap;
                        }
                    }

                    :deep(button) {
                        position: relative;
                        z-index: 2;
                        align-self: flex-end;
                        font-size: 0.75em;
                        padding-right: 0;
                        margin: 0 $size-1;
                        opacity: 0;
                    }
                }
            }

            .filters {
                position: relative;
                z-index: 2;
                font-size: 0.7em;
                width: 25em;
                height: 0;

                form {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: $size-1 $size-4;

                    .form-groups {
                        @include flexCenterAll;
                        align-self: flex-start;
                        flex-wrap: wrap;
                        width: 100%;
                        padding: $size-2;
                        margin: 0 auto;

                        .seperator {
                            display: none;
                        }

                        .form-group {
                            position: relative;
                            display: flex;
                            align-items: center;
                            width: 200%;
                            justify-content: space-between;
                            gap: $size-2;
                            opacity: 0;

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

                            :deep(input[type='range']) {
                                margin: 0.85em 0;
                            }
                        }
                    }

                    .filter-form-buttons {
                        @include flexCenterAll;
                        margin-left: auto;

                        :deep(button) {
                            font-size: 1.1em;

                            transfrom: translateX(-20px);
                            opacity: 0;
                        }
                    }
                }
            }

            .table-wrapper {
                position: relative;
                z-index: 2;
                padding: $size-1 $size-2;
                max-width: 17em;
                overflow-x: scroll;

                table {
                    font-size: 0.9em;
                }

                @include bp-custom-min(450) {
                    max-width: 20em;

                    table {
                        font-size: 1em;
                    }
                }

                @include bp-sm-phone {
                    overflow-x: hidden;
                    max-width: 34em;
                }

                &::-webkit-scrollbar {
                    width: 6px !important;
                    height: 6px !important;
                    background: $color-bg-secondary;
                }

                &::-webkit-scrollbar-thumb {
                    background: $color-gray3;
                    border-radius: 6px;

                    &:hover {
                        background: darken-color($color-gray3, 5%);
                    }

                    &:active {
                        background: darken-color($color-gray3, 10%);
                    }
                }

                &::-webkit-scrollbar:horizontal {
                    height: 12px;
                }

                table {
                    border-bottom: solid 1px $color-gray3;
                    border-collapse: collapse;

                    .loader {
                        min-height: auto;
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        color: $color-text-secondary-dark;
                        margin: $size-4 auto 0;

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
                        padding: $size-1;
                        text-align: center;
                    }

                    td {
                        font-size: 0.85em;
                        color: $color-text-secondary-dark;
                        font-weight: 500;
                        border: solid 1px $color-gray3;

                        &.date {
                            font-family: $secondary-font-stack;
                            font-size: 0.75em;
                            font-weight: 400;
                            color: $color-gray6;
                            padding: 0 $size-2;

                            span {
                                display: flex;
                                justify-content: center;
                                width: 8em;
                            }
                        }

                        &.sorted {
                            background: darken-color($color-gray1, 2%);
                        }
                    }
                }
            }

            .table-nav {
                position: relative;
                z-index: 2;
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
