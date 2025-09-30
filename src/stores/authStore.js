import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiFetch from '@/api.js';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'));
    const user = ref(JSON.parse(localStorage.getItem('user')));
    const userStats = ref();
    const userGames = ref([]);

    const isAuthenticated = computed(() => !!token.value);

    function setToken(newToken) {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    }

    function setUser(newUser) {
        user.value = newUser;
        localStorage.setItem('user', JSON.stringify(newUser));
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

            setToken(data.token);
            setUser({ id: data.id, username: data.username });

            return true;
        } catch (error) {
            console.error('Login failed:', error.message);
            return false;
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        token.value = null;
        user.value = null;
        router.push({ name: 'Login' });
    }

    async function getStats() {
        try {
            const stats = await apiFetch(`/stats?userId=${user.value.id}`, {
                method: 'GET',
            });

            userStats.value = { ...stats };
        } catch (error) {
            console.error('Stats fetch failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function setStats(newStats) {
        try {
            userStats.value = { ...newStats };

            await apiFetch('/stats', {
                method: 'PUT',
                body: { ...newStats },
            });
        } catch (error) {
            console.error('Stats update failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function setGame(game) {
        try {
            const newStats = await apiFetch('/game', {
                method: 'POST',
                body: { userId: user.value.id, score: game.score, time: game.time, stats: userStats },
            });

            userStats.value = { ...newStats };
        } catch (error) {
            console.error('Posting game failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async function getGames(limit, offset) {
        try {
            const games = await apiFetch(`/game?userId=${user.value.id}&limit=${limit}&offset=${offset}`, {
                method: 'GET',
            });

            userGames.value.push(...games.games);
        } catch (error) {
            console.error('Getting games failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    return {
        token,
        user,
        userStats,
        userGames,
        isAuthenticated,
        setToken,
        setUser,
        register,
        login,
        logout,
        getStats,
        setStats,
        setGame,
        getGames,
    };
});
