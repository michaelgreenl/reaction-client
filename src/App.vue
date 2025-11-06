<script setup>
import Navbar from '@/components/Navbar.vue';
import Loader from '@/components/Loader.vue';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();
</script>

<template>
    <div class="app-container">
        <Navbar :class="`${authStore.gameActive ? 'game-active' : undefined}`" />

        <div v-if="authStore.initLoading" class="loader">
            <Loader />
        </div>
        <main v-else>
            <router-view />
        </main>
    </div>
</template>

<style lang="scss">
@use './assets/styles/_fonts.scss';

* {
    box-sizing: border-box;
}

html,
body,
#app,
.app-container {
    min-height: 100vh;
    padding: 0;
    margin: 0;
    font-family: $primary-font-stack;
    background: $color-bg-primary;
}

#app {
    position: relative;
    display: flex;
    flex-direction: column;
    font-size: 0.9em !important;

    @include bp-xs-phone {
        font-size: 1em !important;
    }

    @include bp-xxl-desktop {
        font-size: 1.3em !important;
    }
}

.loader {
    @include flexCenterAll;
    min-height: 90vh;
    color: $color-bg-secondary;
}

.psuedo-border {
    position: relative;
    z-index: 2;
    background: $color-bg-secondary;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow;
    border: solid 1px transparent;

    &::before {
        content: '';
        position: absolute;
        z-index: 1;
        top: 2px;
        right: 2px;
        bottom: 2px;
        left: 2px;
        border-radius: $border-radius-md;
        background: $color-bg-primary-alt;
    }

    &::after {
        content: '';
        position: absolute;
        z-index: 1;
        top: 4px;
        right: 4px;
        bottom: 4px;
        left: 4px;
        border-radius: $border-radius-sm;
        background: $color-bg-secondary;
    }
}

main {
    min-height: $height-minus-nav;
    @include flexCenterAll;
}

h1,
h2 {
    font-style: oblique;
    font-weight: 600;
}

button {
    cursor: pointer !important;
}

button:focus-visible {
    outline: none;
}

a {
    text-decoration: none;
}

a:visted {
    color: inherit;
}
</style>
