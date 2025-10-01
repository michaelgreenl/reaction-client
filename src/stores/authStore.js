import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore.js';
import apiFetch from '@/api.js';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const userStats = ref();
    const userGames = ref([]);
    const isInitialized = ref(false);
    const isAuthenticated = computed(() => !!user.value);

    const settingsStore = useSettingsStore();

    async function initializeAuth() {
        if (isInitialized.value) return;

        try {
            const data = await apiFetch('/users/check-auth', {
                method: 'GET',
            });

            if (data.success) {
                user.value = { id: data.id, username: data.username };
                userStats.value = data.stats;
                settingsStore.$patch({ ...data.settings });
            } else {
                user.value = null;
            }
        } catch (error) {
            user.value = null;
            console.error('Auth check failed:', error.message);
        } finally {
            isInitialized.value = true;
        }
    }

    async function register(username, password) {
        try {
            await apiFetch('/users/auth', {
                method: 'POST',
                body: { username, password },
            });
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function login(username, password) {
        try {
            const data = await apiFetch('/users/login', {
                method: 'POST',
                body: { username, password },
            });

            user.value = { id: data.id, username: data.username };

            return true;
        } catch (error) {
            console.error('Login failed:', error.message);
            return false;
        }
    }

    async function logout() {
        await apiFetch('/users/logout', { method: 'POST' });
        user.value = null;
        userStats.value = null;
        userGames.value = [];
        isInitialized.value = false;
        router.push({ name: 'Login' });
    }

    async function getStats() {
        if (!isAuthenticated) return;

        try {
            const stats = await apiFetch(`/stats?userId=${user.value.id}`, {
                method: 'GET',
            });

            userStats.value = { ...stats };
        } catch (error) {
            if (error.message.includes('401')) {
                await logout();
            }
            console.error('Stats fetch failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function setStats(newStats) {
        if (!isAuthenticated) return;

        try {
            userStats.value = { ...newStats };

            await apiFetch('/stats', {
                method: 'PUT',
                body: { ...newStats },
            });
        } catch (error) {
            if (error.message.includes('401')) {
                await logout();
            }
            console.error('Stats update failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function setGame(game) {
        if (!isAuthenticated) return;

        try {
            const newStats = await apiFetch('/game', {
                method: 'POST',
                body: { userId: user.value.id, score: game.score, time: game.time, stats: userStats },
            });

            userStats.value = { ...newStats };
        } catch (error) {
            if (error.message.includes('401')) {
                await logout();
            }
            console.error('Posting game failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function getGames(limit, offset) {
        if (!isAuthenticated) return;

        try {
            const games = await apiFetch(`/game?userId=${user.value.id}&limit=${limit}&offset=${offset}`, {
                method: 'GET',
            });

            userGames.value.push(...games.games);
        } catch (error) {
            if (error.message.includes('401')) {
                await logout();
            }
            console.error('Getting games failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    return {
        user,
        userStats,
        userGames,
        isAuthenticated,
        isInitialized,
        initializeAuth,
        register,
        login,
        logout,
        getStats,
        setStats,
        setGame,
        getGames,
    };
});
