<script setup>
import Navbar from '@/components/Navbar.vue';
import Loader from '@/components/Loader.vue';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();
</script>

<template>
    <div class="app-container">
        <Navbar />

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
    height: 100%;
    padding: 0;
    margin: 0;
    font-family: $primary-font-stack;
    background: $color-bg-primary;
}

#app {
    position: relative;
    display: flex;
    flex-direction: column;

    @include bp-xxl-desktop {
        font-size: 1.2em;
    }
}

.loader {
    @include flexCenterAll;
    height: 90%;
    color: $color-bg-secondary;
}

main {
    // viewport height minus height of navbar
    height: calc(100vh - 3.2em);
}

h1,
h2 {
    font-style: oblique;
    font-weight: 600;
}

button {
    cursor: pointer;
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
