<script setup>
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore.js';
import LogoSVG from '@/components/Icons/LogoSVG.vue';

const authStore = useAuthStore();
const route = useRoute();
</script>

<template>
    <nav class="nav">
        <router-link class="nav-logo" to="/">
            <LogoSVG />
            <h2>Reaction</h2>
        </router-link>
        <router-link
            class="nav-link"
            v-if="!authStore.isAuthenticated && route.fullPath !== '/login' && route.fullPath !== '/register'"
            to="/login"
        >
            Login
        </router-link>
        <router-link class="nav-link" v-if="authStore.isAuthenticated && route.fullPath !== '/profile'" to="/profile"
            >Profile</router-link
        >
        <button
            class="nav-link"
            v-if="authStore.isAuthenticated && route.fullPath === '/profile'"
            @click="authStore.logout"
        >
            Logout
        </button>
    </nav>
</template>

<style lang="scss" scoped>
.nav {
    font-family: $primary-font-stack;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3.2em;
    padding-left: $size-3;
    padding-right: $size-4;

    &-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;

        svg {
            height: $size-8;
            width: $size-8;
        }

        h2 {
            font-family: $secondary-font-stack;
            color: $color-gray1;
            font-style: italic;
            font-weight: 300;
            margin: 0;
        }

        a {
            margin-left: $size-4;
        }

        &:hover {
            transform: scale(1.02);
        }
    }

    &-link {
        position: relative;
        font-size: 0.9em;
        font-family: $primary-font-stack;
        color: $color-gray1;
        font-weight: 300;
        background: transparent;
        border: 0;
        padding: 0;

        &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: -10%;
            right: 110%;
            height: 1px;
            background: $color-bg-secondary;
            transition: all 0.1s ease;
        }

        &:hover {
            &::after {
                right: -10%;
            }
        }
    }

    @include bp-sm-phone {
        padding-left: $size-4;
        padding-right: $size-5;
    }
}
</style>
