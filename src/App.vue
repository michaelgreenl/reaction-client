<script setup>
import Navbar from '@/components/Navbar.vue';
</script>

<template>
    <div class="app-container">
        <Navbar />

        <main>
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

main {
    // viewport height minus height of navbar
    height: calc(100vh - 2em);
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
</style>
