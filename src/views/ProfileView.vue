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

const showFilters = ref(false);
const filterToggles = reactive({ circleSize: false, spawnInterval: false, shrinkTime: false });
const settingsFilters = reactive({ ...settingsStore });
const filteredGames = reactive([]);

onMounted(async () => {
    await authStore.getGames().then(() => {
        isLoading.value = false;
    });
});

async function changePage(newOffset, pageNum) {
    activePage.value = pageNum;
    if (newOffset >= authStore.userGames.length) {
        await authStore.getGames(10, newOffset); // 10 games shown per page
    }
}

const filtersAdded = computed(() => {
    return filterToggles.circleSize || filterToggles.spawnInterval || filterToggles.shrinkTime;
});

function resetFilters() {
    settingsFilters.circleSize = 100;
    settingsFilters.spawnInterval = 1;
    settingsFilters.shrinkTime = 1;

    Object.keys(filterToggles).forEach((toggle) => {
        filterToggles[`${toggle}`] = false;
    });
}

async function filterGamesBySettings() {
    let filters = [];

    Object.keys(filterToggles).forEach((toggle) => {
        if (filterToggles[`${toggle}`]) {
            filters.push({ filter: toggle, value: settingsFilters[`${toggle}`] });
        }
    });

    const games = await authStore.getGamesBySettings(10, offset.value, filters);

    filteredGames.push(...games.games);
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
                <Button type="submit" text="Save" :disabled="!filtersAdded" />
            </form>
            <ul>
                <li v-for="(game, i) in authStore.userGames.slice(offset, offset + 10)">
                    {{ i + 1 + offset }}:{{ game.score }}|{{ (game.time / 1000).toFixed(2) }}
                </li>
            </ul>
            <Button text="prev" @click="changePage((offset -= 10), activePage - 1)" :disabled="offset === 0" />
            {{ activePage }}
            <Button
                text="next"
                @click="changePage((offset += 10), activePage + 1)"
                :disabled="authStore.userStats.totalGames < 10 || offset + 10 >= authStore.userStats.totalGames"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
