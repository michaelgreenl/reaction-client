<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button.vue';
import TextInput from '@/components/Inputs/Text.vue';
import LogoSVG from '@/components/Icons/LogoSVG.vue';

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
            <div class="auth-header">
                <LogoSVG />
                <h2>Login</h2>
            </div>
            <hr class="header-border" />
            <div class="form-groups">
                <div class="form-group">
                    <label for="username">Username</label>
                    <TextInput id="username" v-model="username" required :disabled="isLoading" />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-input-wrapper">
                        <TextInput
                            id="password"
                            v-model="password"
                            required
                            :disabled="isLoading"
                            :showPassword="showPassword"
                            :passwordHideButton="passwordHideButton"
                            @toggleHideButton="showPassword = !showPassword"
                            @focus="passwordHideButton = true"
                            @blur="passwordHideButton = false"
                        />
                    </div>
                </div>
            </div>
            <Button type="submit" text="Login" preset="secondary" :isLoading="isLoading" :disabled="isLoading" />
            <hr class="bottom-border" />
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p class="form-link">Don't have an account? <router-link to="/register">Register</router-link></p>
        </form>
    </div>
</template>

<style lang="scss" scoped>
.auth-container {
    font-size: 0.8em;
    height: 100%;
    @include flexCenterAll;
    padding: 0 $size-4 $size-12;

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: $size-1;
        padding: $size-4 $size-6 0;
        width: 100%;
        max-width: 400px;
        background: $color-bg-secondary;
        border-radius: $border-radius-md;
        box-shadow: $box-shadow;

        .auth-header {
            align-self: flex-start;
            @include flexCenterAll;

            svg {
                height: $size-9;
                width: $size-9;
            }

            h2 {
                font-size: 2.2em;
                color: $color-accent;
                margin: 0;
            }
        }

        .header-border {
            border: 0;
            height: 2px;
            background-color: $color-primary-light;
            margin: 0 0 $size-1;
        }

        .form-groups {
            display: flex;
            flex-direction: column;
            gap: $size-3;
            padding: $size-1 $size-2 $size-2;

            .form-group {
                display: flex;
                flex-direction: column;
                gap: $size-1;

                label {
                    font-size: 0.9em;
                    color: $color-text-secondary-dark;
                }
            }
        }

        .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;

            :deep(input) {
                padding-right: 60px;
            }
        }

        button[type='submit'] {
            align-self: flex-end;
            margin-right: $size-4;
        }

        .bottom-border {
            border: 0;
            height: 1px;
            width: 90%;
            background-color: $color-gray4;
            margin: $size-2 auto 0;
        }

        .error-message {
            color: $color-error;
            text-align: center;
            margin-top: $size-1;
        }

        .form-link {
            font-family: $secondary-font-stack;
            text-align: center;
            margin-top: $size-2;
            color: $color-text-secondary-dark;

            a {
                color: $color-primary;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}
</style>
