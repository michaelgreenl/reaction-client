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
            <hr class="header-border" />
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
            <hr class="bottom-border" />
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p class="form-link">Already have an account? <router-link to="/login">Login</router-link></p>
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
            margin: 0 0 $size-2;
        }

        .form-groups {
            display: flex;
            flex-direction: column;
            gap: $size-3;
            padding: $size-1 $size-2;

            .form-group {
                display: flex;
                flex-direction: column;
                gap: $size-1;

                label {
                    font-size: 0.9em;
                    color: $color-text-secondary-dark;
                }

                input {
                    border-radius: $border-radius-sm;
                    padding: $size-2;
                    outline: 0;
                    border: 2px solid $color-primary-light;
                    background-color: $color-bg-secondary;
                    color: $color-text-secondary-dark;
                    width: 100%;

                    &:focus {
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
