<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();

onMounted(async () => {
    await authStore.getGames();
});
</script>

<template>
    <div class="profile-container">Profile</div>
</template>

<style lang="scss" scoped></style>
