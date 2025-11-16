<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button.vue';
import TextInput from '@/components/Inputs/Text.vue';
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
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <form class="auth-form psuedo-border" @submit.prevent="handleRegister">
            <div class="auth-header">
                <LogoSVG />
                <h2>Register</h2>
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
                            :show-password="showPassword"
                            :password-hide-button="passwordHideButton"
                            @toggle-hide-button="showPassword = !showPassword"
                            @focus="passwordHideButton = true"
                            @blur="passwordHideButton = false"
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="retype-password">Re-type Password</label>
                    <div class="password-input-wrapper">
                        <TextInput
                            id="retype-password"
                            v-model="retypePassword"
                            required
                            :disabled="isLoading"
                            :show-password="showPassword"
                            :password-hide-button="rePasswordHideButton"
                            @toggle-hide-button="showPassword = !showPassword"
                            @focus="rePasswordHideButton = true"
                            @blur="rePasswordHideButton = false"
                        />
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

            <Button type="submit" text="Register" preset="secondary" :is-loading="isLoading" :disabled="isLoading" />
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
    width: 100%;
    @include flexCenterAll;
    padding: 0 $size-4 $size-12;

    .auth-form {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: $size-1;
        padding: $size-6 $size-7 0;
        width: 90%;
        max-width: 30em;

        .auth-header {
            position: relative;
            z-index: 2;
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
            position: relative;
            z-index: 2;
            border: 0;
            height: 2px;
            background-color: $color-primary-light;
            margin: 0 0 $size-2;
        }

        .form-groups {
            position: relative;
            z-index: 2;
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
            }
        }

        .password-input-wrapper {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;

            :deep(input) {
                padding-right: 60px;
            }
        }

        .password-requirements {
            position: relative;
            z-index: 2;
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
            position: relative;
            z-index: 2;
            align-self: flex-end;
            margin-right: $size-4;
        }

        .bottom-border {
            position: relative;
            z-index: 2;
            border: 0;
            height: 1px;
            width: 90%;
            background-color: $color-gray4;
            margin: $size-2 auto 0;
        }

        .error-message {
            position: relative;
            z-index: 2;
            color: $color-error;
            text-align: center;
            margin-top: $size-1;
        }

        .form-link {
            position: relative;
            z-index: 2;
            font-size: 0.9em;
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
