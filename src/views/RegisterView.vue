<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button.vue';
import LogoSVG from '@/components/Icons/LogoSVG.vue';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const retypePassword = ref('');
const showPassword = ref(false);
const passwordHideButton = ref(false);
const rePasswordHideButton = ref(false);
const errorMessage = ref(null);
const isLoading = ref(false);

const passwordRequirements = computed(() => {
    const length = password.value.length >= 8;
    const uppercase = /[A-Z]/.test(password.value);
    const number = /[0-9]/.test(password.value);
    return { length, uppercase, number };
});

const handleRegister = async () => {
    if (password.value !== retypePassword.value) {
        errorMessage.value = 'Passwords do not match.';
        return;
    }

    if (!Object.values(passwordRequirements.value).every(Boolean)) {
        errorMessage.value = 'Password does not meet all requirements.';
        return;
    }

    errorMessage.value = null;
    isLoading.value = true;
    try {
        const result = await authStore.register(username.value, password.value);

        if (result.success) {
            router.push('/login');
        } else {
            errorMessage.value = result.message || 'Registration failed.';
        }
    } catch (error) {
        errorMessage.value = 'An unexpected error occurred.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <form @submit.prevent="handleRegister" class="auth-form">
            <div class="auth-header">
                <LogoSVG />
                <h2>Register</h2>
            </div>
            <hr />
            <div class="form-groups">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input id="username" v-model="username" type="text" required :disabled="isLoading" />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-input-wrapper">
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
                            class="toggle-password"
                            @click="showPassword = !showPassword"
                            @mousedown.prevent
                        >
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="retype-password">Re-type Password</label>
                    <div class="password-input-wrapper">
                        <input
                            id="retype-password"
                            v-model="retypePassword"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            :disabled="isLoading"
                            @focus="rePasswordHideButton = true"
                            @blur="rePasswordHideButton = false"
                        />
                        <button
                            v-if="rePasswordHideButton"
                            type="button"
                            class="toggle-password"
                            @click="showPassword = !showPassword"
                            @mousedown.prevent
                        >
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                </div>
            </div>
            <ul class="password-requirements">
                <li :class="{ valid: passwordRequirements.length, invalid: !passwordRequirements.length && password }">
                    <span class="icon">{{ !password ? '•' : passwordRequirements.length ? '✓' : '✗' }}</span>
                    At least 8 characters
                </li>
                <li
                    :class="{
                        valid: passwordRequirements.uppercase,
                        invalid: !passwordRequirements.uppercase && password,
                    }"
                >
                    <span class="icon">{{ !password ? '•' : passwordRequirements.uppercase ? '✓' : '✗' }}</span>
                    Contains an uppercase letter
                </li>
                <li :class="{ valid: passwordRequirements.number, invalid: !passwordRequirements.number && password }">
                    <span class="icon">{{ !password ? '•' : passwordRequirements.number ? '✓' : '✗' }}</span>
                    Contains a number
                </li>
            </ul>

            <Button type="submit" text="Register" preset="secondary" :isLoading="isLoading" :disabled="isLoading" />
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p class="form-link">Already have an account? <router-link to="/login">Login</router-link></p>
        </form>
    </div>
</template>

<style lang="scss" scoped>
.auth-container {
    font-size: 0.8em;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 $size-4 $size-12;

    .auth-form {
        padding: $size-4 $size-6 $size-2;
        border-radius: $border-radius-xl;
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: $size-1;
        background: $color-bg-secondary;
        border-radius: $border-radius-md;

        .auth-header {
            align-self: flex-start;
            display: flex;
            align-items: center;
            justify-content: center;

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

        hr {
            border: 0;
            height: 2px;
            background-color: $color-primary-light;
            margin: 0 0 $size-2;
        }

        .form-groups {
            display: flex;
            flex-direction: column;
            gap: $size-2;
            padding: $size-1 $size-2;

            .form-group {
                display: flex;
                flex-direction: column;
                gap: $size-1;

                label {
                    color: $color-text-secondary-dark;
                }

                input {
                    padding: $size-2;
                    outline: 1px solid transparent;
                    border: 1px solid $color-primary;
                    border-radius: $border-radius-md;
                    background-color: $color-bg-secondary;
                    color: $color-text-secondary-dark;
                    width: 100%;

                    &:focus {
                        outline: 1px solid $color-accent;
                        border-color: $color-accent;
                    }
                }
            }
        }

        .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;

            input {
                padding-right: 60px;
            }

            .toggle-password {
                font-size: 0.8em;
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: $color-accent-light;

                &:hover {
                    color: $color-accent;
                }
            }
        }

        .password-requirements {
            list-style: none;
            padding: 0 1em;
            font-size: 0.9em;
            margin: $size-2 0 0;
            color: $color-text-secondary-dark;

            li {
                display: flex;
                align-items: center;
                gap: $size-2;
                margin-bottom: $size-1;

                .icon {
                    line-height: 1;
                }

                &.valid {
                    color: $color-success;
                }

                &.invalid {
                    color: $color-error;
                }
            }
        }

        button[type='submit'] {
            align-self: flex-end;
        }

        .error-message {
            color: $color-error;
            text-align: center;
            margin-top: $size-3;
        }

        .form-link {
            text-align: center;
            margin-top: $size-3;
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
