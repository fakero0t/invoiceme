<template>
  <AuthLayout>
    <div class="login-content">
      <h1 class="login-heading">Welcome back</h1>
      <p class="login-subtext">Log in to manage your invoices</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="errorMessage" class="error-shake">
          <VCard class="error-card">
            <div class="error-content">
              <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </VCard>
        </div>

        <div class="form-field">
          <label for="email" class="form-label">Email</label>
          <div class="input-with-icon">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <VInput
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              :disabled="isLoading"
              class="input-with-padding"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="password" class="form-label">Password</label>
          <div class="input-with-icon">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <VInput
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              :disabled="isLoading"
              class="input-with-padding"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="showPassword" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </div>

        <VButton
          type="submit"
          variant="primary"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!email || !password"
        >
          Log in
        </VButton>

        <VDivider>or</VDivider>

        <div class="signup-link">
          Don't have an account?
          <router-link to="/signup" class="link-primary">Sign up</router-link>
        </div>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { AuthLayout } from '../../shared/layouts';
import { VInput, VButton, VCard, VDivider } from '../../shared/components';
import { useToast } from '../../shared/composables';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });

    // Success animation - show toast
    toast.success('Welcome back!');
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || 'Invalid email or password. Please try again.';
    
    // Trigger shake animation
    const errorCard = document.querySelector('.error-shake');
    if (errorCard) {
      errorCard.classList.remove('shake');
      void errorCard.offsetWidth; // Trigger reflow
      errorCard.classList.add('shake');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.login-heading {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.login-subtext {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.error-shake {
  animation-duration: var(--duration-slow);
}

.error-shake.shake {
  animation: shake var(--duration-slow) var(--ease-out);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

.error-card {
  padding: var(--spacing-3);
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-error-dark);
  font-size: var(--font-size-body-sm);
}

.error-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  flex-shrink: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--spacing-4);
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-text-tertiary);
  pointer-events: none;
  z-index: 1;
}

.input-with-padding :deep(input) {
  padding-left: calc(var(--spacing-4) * 2 + var(--icon-md));
}

.password-toggle {
  position: absolute;
  right: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color var(--duration-base) var(--ease-out);
  z-index: 1;
}

.password-toggle:hover {
  color: var(--color-text-secondary);
}

.password-toggle svg {
  width: var(--icon-md);
  height: var(--icon-md);
}

.signup-link {
  text-align: center;
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}

.link-primary {
  color: var(--color-venmo-blue);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--duration-base) var(--ease-out);
}

.link-primary:hover {
  color: var(--color-venmo-blue-600);
  text-decoration: underline;
}
</style>
