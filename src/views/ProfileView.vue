<script setup>
import { computed, ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import Button from '@/components/Button.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const isLoading = ref(true);

const offset = ref(0);
const activePage = ref(1);
const activeGames = reactive({
    filtered: false,
    sorted: { by: 'createdAt', order: 'DESC' },
    games: [],
});

const showFilters = ref(false);
const filterToggles = reactive({ circleSize: false, spawnInterval: false, shrinkTime: false });
const settingsFilters = reactive({ ...settingsStore });

const filtersAdded = computed(() => {
    return filterToggles.circleSize || filterToggles.spawnInterval || filterToggles.shrinkTime;
});

onMounted(async () => {
    await getUnfilteredGames().then(() => {
        isLoading.value = false;
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
    activeGames.games.length = 0;
    activeGames.filtered = false;

    const games = await authStore.getGames(10, offset.value, activeGames.sorted);
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
        activeGames.games.length = 0;
        activeGames.filtered = true;
    }

    let filters = [];

    Object.keys(filterToggles).forEach((toggle) => {
        if (filterToggles[`${toggle}`]) {
            filters.push({ filter: toggle, value: settingsFilters[`${toggle}`] });
        }
    });

    const games = await authStore.getGamesBySettings(10, offset.value, filters, activeGames.sorted);

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

function formatDate(isoString) {
    const date = new Date(isoString);
    if (isNaN(date)) throw new Error('Invalid ISO date string');

    const parts = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value;

    const hour = get('hour');
    const minute = get('minute');
    const ampm = get('dayPeriod')?.toLowerCase();
    const month = get('month');
    const day = get('day');
    const year = get('year');

    const now = new Date();
    const sameDay =
        now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();

    return sameDay ? `${hour}:${minute}${ampm}` : `${hour}:${minute}${ampm} ${month}-${day}-${year}`;
}
</script>

<template>
    <div class="profile-container">
        <h1>Profile</h1>
        <div v-if="isLoading">Loading...</div>
        <div v-else>
            <Button text="Show Filters" @click="showFilters = !showFilters" />
            <div v-if="showFilters">
                <Button
                    :text="filterToggles.circleSize ? 'Circle Size -' : 'Circle Size +'"
                    @click="filterToggles.circleSize = !filterToggles.circleSize"
                />
                <Button
                    :text="filterToggles.spawnInterval ? 'Spawn Interval -' : 'Spawn Interval +'"
                    @click="filterToggles.spawnInterval = !filterToggles.spawnInterval"
                />
                <Button
                    :text="filterToggles.shrinkTime ? 'Shrink Time -' : 'Shrink Time +'"
                    @click="filterToggles.shrinkTime = !filterToggles.shrinkTime"
                />
            </div>
            <form v-if="showFilters" @submit.prevent="filterGamesBySettings">
                <div class="form-group" v-if="filterToggles.circleSize">
                    <label for="circleSize">Circle Size</label>
                    <input
                        id="circleSize"
                        v-model="settingsFilters.circleSize"
                        type="range"
                        min="50"
                        max="150"
                        :disabled="!filterToggles.circleSize"
                    />
                </div>
                <div class="form-group" v-if="filterToggles.spawnInterval">
                    <label for="spawnInterval">Spawn Interval</label>
                    <input
                        id="spawnInterval"
                        v-model.number="settingsFilters.spawnInterval"
                        type="number"
                        min="0.25"
                        max="2"
                        step="0.25"
                        :disabled="!filterToggles.spawnInterval"
                    />
                </div>
                <div class="form-group" v-if="filterToggles.shrinkTime">
                    <label for="shrinkTime">Shrink Time</label>
                    <input
                        id="shrinkTime"
                        v-model.number="settingsFilters.shrinkTime"
                        type="number"
                        min="0.25"
                        max="2"
                        step="0.25"
                        :disabled="!filterToggles.shrinkTime"
                    />
                </div>
                <Button text="Reset" @click="resetFilters" :disabled="!filtersAdded" />
                <Button type="submit" text="Save" :disabled="!filtersAdded && !activeGames.filtered" />
            </form>
            <table>
                <thead>
                    <tr>
                        <th>
                            <Button
                                @click="handleSort('createdAt')"
                                :text="activeGames.sorted.order === 'ASC' ? '▲' : '▼'"
                                :showText="activeGames.sorted.by === 'createdAt'"
                            />
                            date
                        </th>
                        <th>
                            <Button
                                @click="handleSort('score')"
                                :text="activeGames.sorted.order === 'ASC' ? '▲' : '▼'"
                                :showText="activeGames.sorted.by === 'score'"
                            />
                            score
                        </th>
                        <th>
                            <Button
                                @click="handleSort('time')"
                                :text="activeGames.sorted.order === 'ASC' ? '▲' : '▼'"
                                :showText="activeGames.sorted.by === 'time'"
                            />
                            time
                        </th>
                        <th>settings</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(game, i) in activeGames.games.slice(offset, offset + 10)">
                        <td>{{ formatDate(game.createdAt) }}</td>
                        <td>{{ game.score }}</td>
                        <td>{{ (game.time / 1000).toFixed(2) }}</td>
                        <td><Button text="Show Settings" /></td>
                    </tr>
                </tbody>
            </table>
            <Button text="prev" @click="switchPage((offset -= 10), activePage - 1)" :disabled="offset === 0" />
            {{ activePage }}
            <Button
                text="next"
                @click="switchPage((offset += 10), activePage + 1)"
                :disabled="authStore.userStats.totalGames < 10 || offset + 10 >= authStore.userStats.totalGames"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
