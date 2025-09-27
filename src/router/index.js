import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import GameView from '@/views/GameView.vue';
import ProfileView from '@/views/ProfileView.vue';

const DEFAULT_TITLE = 'Reaction';

const routes = [
    { path: '/', redirect: '/game' },
    { path: '/game', name: 'Game', component: GameView },
    { path: '/login', name: 'Login', component: LoginView, meta: { title: 'Login' } },
    { path: '/register', name: 'Register', component: RegisterView, meta: { title: 'Register' } },
    { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (!auth.isAuthenticated && to.meta.requiresAuth) {
        next('/login');
    } else if ((to.name === 'Login' || to.name === 'Register') && auth.isAuthenticated) {
        next('/profile');
    } else {
        next();
    }
});

router.afterEach((to) => {
    const auth = useAuthStore();

    let title = DEFAULT_TITLE;

    if (auth.isAuthenticated) {
        title += ' | ' + auth.user.username;
    } else if (to.meta.title) {
        title += ' | ' + to.meta.title;
    }

    document.title = title;
});

export default router;
