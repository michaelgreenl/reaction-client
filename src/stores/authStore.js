import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore.js';
import apiFetch from '@/api.js';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const userStats = ref();
    const userGames = ref([]);
    const recentUserGames = ref([]);
    const isAuthenticated = computed(() => !!user.value);

    const settingsStore = useSettingsStore();

    async function initializeAuth() {
        try {
            const data = await apiFetch('/users/check-auth', {
                method: 'GET',
            });

            if (data.success) {
                user.value = { id: data.id, username: data.username };
                userStats.value = data.stats;
                settingsStore.$patch({ ...data.settings });

                if (!recentUserGames.value.length) {
                    const games = await getGames(5, 0, { by: 'createdAt', order: 'DESC' });
                    recentUserGames.value.push(...games);
                }

                localStorage.setItem('AUTHORIZED', true);
            } else {
                user.value = null;
                localStorage.setItem('AUTHORIZED', false);
            }
        } catch (error) {
            user.value = null;
            console.error('Auth check failed:', error.message);
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
            localStorage.setItem('AUTHORIZED', true);

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
        localStorage.setItem('AUTHORIZED', false);
        router.push({ name: 'Login' });
    }

    async function getStats() {
        if (!isAuthenticated.value) return;

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
        if (!isAuthenticated.value) return;

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

    async function setGame(game, settings) {
        if (!isAuthenticated.value) return;

        try {
            const newStats = await apiFetch('/game', {
                method: 'POST',
                body: { userId: user.value.id, score: game.score, time: game.time, settings, stats: userStats.value },
            });

            recentUserGames.value.pop();
            recentUserGames.value.unshift({
                userId: user.value.id,
                createdAt: new Date(),
                score: game.score,
                time: game.time,
                settings,
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

    async function getGames(limit, offset, sorted) {
        if (!isAuthenticated.value) return;

        try {
            const games = await apiFetch(
                `/game?userId=${user.value.id}&limit=${limit}&offset=${offset}&sortedBy=${sorted.by}&sortedOrder=${sorted.order}`,
                {
                    method: 'GET',
                },
            );

            return [...games.games];
        } catch (error) {
            if (error.message.includes('401')) {
                await logout();
            }

            console.error('Getting games failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function getGamesBySettings(limit, offset, filters, sorted) {
        if (!isAuthenticated.value) return;

        try {
            const games = await apiFetch(
                `/game/filter/settings?userId=${user.value.id}&limit=${limit}&offset=${offset}&filters=${encodeURIComponent(JSON.stringify(filters))}&sortedBy=${sorted.by}&sortedOrder=${sorted.order}`,
                {
                    method: 'GET',
                },
            );

            return [...games.games];
        } catch (error) {
            if (error.message.includes('401')) {
                await logout();
            }

            console.error('Getting games with filter failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    return {
        user,
        userStats,
        userGames,
        isAuthenticated,
        initializeAuth,
        register,
        recentUserGames,
        login,
        logout,
        getStats,
        setStats,
        setGame,
        getGames,
        getGamesBySettings,
    };
});
