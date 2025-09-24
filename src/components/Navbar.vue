<script setup></script>

<template>
    <nav>
        <router-link to="/">Play</router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
    </nav>
</template>

<style lang="scss" scoped>
nav {
    display: flex;
    gap: $size-2;
}
</style>
