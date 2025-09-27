<script setup>
import { useAuthStore } from '@/stores/authStore.js';
import Button from '@/components/Button.vue';

const authStore = useAuthStore();
</script>

<template>
    <nav>
        <router-link to="/">Play</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login">Login</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register">Register</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/profile">Profile</router-link>
        <Button v-if="authStore.isAuthenticated" @click="authStore.logout" text="Logout" />
    </nav>
</template>

<style lang="scss" scoped>
nav {
    display: flex;
    gap: $size-2;
}
</style>
