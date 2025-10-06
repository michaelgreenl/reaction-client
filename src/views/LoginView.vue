<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/Loader.vue';

const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const errorMessage = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);
const passwordHideButton = ref(false);

const router = useRouter();

const handleLogin = async () => {
    errorMessage.value = null;
    isLoading.value = true;

    try {
        const success = await authStore.login(username.value, password.value);

        if (success) {
            router.push('/');
        } else {
            errorMessage.value = 'Invalid username or password.';
            password.value = '';
        }
    } catch (error) {
        errorMessage.value = 'An unexpected error occurred.';
        password.value = '';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <form @submit.prevent="handleLogin" class="auth-form">
            <h2>Login</h2>
            <div class="form-group">
                <label for="username">Username</label>
                <input id="username" v-model="username" type="text" required :disabled="isLoading" />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    :disabled="isLoading"
                    @focus="passwordHideButton = true"
                    @blur="passwordHideButton = false"
                />
                <button
                    v-if="passwordHideButton"
                    type="button"
                    @click="showPassword = !showPassword"
                    class="toggle-password"
                    @mousedown.prevent
                >
                    {{ showPassword ? 'Hide' : 'Show' }}
                </button>
            </div>
            <button type="submit" :disabled="isLoading">
                <Loader v-if="isLoading" />
                <span v-else>Login</span>
            </button>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p class="form-link">Don't have an account? <router-link to="/register">Register</router-link></p>
        </form>
    </div>
</template>

<style lang="scss" scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: $size-4;
}

.auth-form {
    padding: $size-5;
    border-radius: 16px;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: $size-3;

    h2 {
        text-align: center;
        color: $color-text-primary;
        margin-bottom: $size-4;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: $size-1;

        label {
            color: $color-text-primary;
            font-size: 0.9rem;
        }

        input {
            padding: $size-2;
            border: 1px solid $color-primary;
            border-radius: 12px;
            background-color: $color-bg-secondary;
            color: $color-text-secondary;

            &:focus {
                outline: none;
                border-color: $color-accent;
            }
        }
    }

    button[type='submit'] {
        width: 100%;
        padding: $size-2;
        margin-top: $size-3;
        font-size: 1.1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 48px;

        &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    }

    .error-message {
        color: $color-error;
        text-align: center;
        margin-top: $size-2;
    }

    .form-link {
        text-align: center;
        margin-top: $size-3;

        a {
            color: $color-primary;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
