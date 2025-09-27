import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSettingsStore } from './settingsStore.js';
import apiFetch from '@/api.js';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'));
    const user = ref(JSON.parse(localStorage.getItem('user')));

    // TODO: Use the settings store for getting/reseting the settings
    const settingsStore = useSettingsStore();

    // TODO: Add functionality for getting the user's stats
    // something like
    // const userStats = {} (then get the stats)

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
            setUser({ id: data.userId, username: data.username });

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

    const isAuthenticated = computed(() => !!token.value);

    return { token, user, register, login, logout, isAuthenticated, setToken, setUser };
});
