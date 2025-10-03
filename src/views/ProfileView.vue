<script setup>
import { watch, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import Button from '@/components/Button.vue';

const authStore = useAuthStore();
const offset = ref(0);
const activePage = ref(1);
const isLoading = ref(true);

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
</script>

<template>
    <div class="profile-container">
        <h1>Profile</h1>
        <div v-if="isLoading">Loading...</div>
        <div v-else>
            <ul>
                <li v-for="(game, i) in authStore.userGames.slice(offset, offset + 10)">
                    {{ i + 1 + offset }}:{{ game.score }}
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
