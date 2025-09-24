import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import GameView from '@/views/GameView.vue';

const DEFAULT_TITLE = 'Reaction';

const routes = [
    { path: '/', redirect: '/game' },
    { path: '/game', name: 'Game', component: GameView, meta: { title: 'Play!' } },
    { path: '/login', name: 'Login', component: LoginView, meta: { title: 'Login' } },
    { path: '/register', name: 'Register', component: RegisterView, meta: { title: 'Register' } },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.afterEach((to) => {
    const auth = useAuthStore();
    const requiresAuth = to.meta.requiresAuth;

    let title = DEFAULT_TITLE;

    if (auth.isAuthenticated) {
        title += ' | ' + auth.user.username;
    } else {
        title += ' | ' + to.meta.title;
    }

    document.title = title;
});

export default router;
