<template>
  <AuthLayout>
    <div class="signup-content">
      <h1 class="signup-heading">Create your account</h1>
      <p class="signup-subtext">Start managing your invoices today</p>

      <form @submit.prevent="handleSignup" class="signup-form">
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
          <label for="businessName" class="form-label">Business Name</label>
          <VInput
            id="businessName"
            v-model="businessName"
            type="text"
            placeholder="Your Company LLC"
            :disabled="isLoading"
          />
        </div>

        <div class="form-field">
          <label for="name" class="form-label">Full Name</label>
          <VInput
            id="name"
            v-model="name"
            type="text"
            placeholder="John Doe"
            :disabled="isLoading"
          />
        </div>

        <div class="form-field">
          <label for="email" class="form-label">Email</label>
          <VInput
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            :disabled="isLoading"
            :error="emailError"
            :success="emailSuccess"
          />
        </div>

        <div class="form-field">
          <label for="emailConfirm" class="form-label">Confirm Email</label>
          <VInput
            id="emailConfirm"
            v-model="emailConfirm"
            type="email"
            placeholder="Confirm your email"
            :disabled="isLoading"
            :error="emailConfirmError"
            :success="emailConfirmSuccess"
          />
        </div>

        <div class="form-field">
          <label for="password" class="form-label">Password</label>
          <VInput
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="At least 8 characters"
            :disabled="isLoading"
            @blur="validatePassword"
          />
          
          <!-- Password Strength Indicator -->
          <div v-if="password" class="password-strength">
            <VProgress
              :value="passwordStrength.score"
              :max="3"
              variant="linear"
              size="sm"
              :class="'strength-' + passwordStrength.level"
            />
            <span class="strength-text" :class="'strength-' + passwordStrength.level">
              {{ passwordStrength.label }}
            </span>
          </div>
        </div>

        <div class="form-field">
          <label for="passwordConfirm" class="form-label">Confirm Password</label>
          <VInput
            id="passwordConfirm"
            v-model="passwordConfirm"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Confirm your password"
            :disabled="isLoading"
            :error="passwordConfirmError"
            :success="passwordConfirmSuccess"
          />
        </div>

        <VCheckbox v-model="agreeToTerms" :disabled="isLoading">
          I agree to the <a href="#" class="link-primary">Terms of Service</a> and <a href="#" class="link-primary">Privacy Policy</a>
        </VCheckbox>

        <VButton
          type="submit"
          variant="primary"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!canSubmit"
        >
          Create Account
        </VButton>

        <div class="login-link">
          Already have an account?
          <router-link to="/login" class="link-primary">Sign in</router-link>
        </div>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { AuthLayout } from '../../shared/layouts';
import { VInput, VButton, VCard, VCheckbox, VProgress } from '../../shared/components';
import { useToast } from '../../shared/composables';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const businessName = ref('');
const name = ref('');
const email = ref('');
const emailConfirm = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPassword = ref(false);
const agreeToTerms = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const emailError = ref(false);
const emailSuccess = ref(false);
const emailConfirmError = ref(false);
const emailConfirmSuccess = ref(false);
const passwordConfirmError = ref(false);
const passwordConfirmSuccess = ref(false);

const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return { score: 0, level: 'weak', label: '' };
  
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score = 3; // Special char = strong
  
  const levels = ['weak', 'medium', 'strong'];
  const labels = ['Weak', 'Medium', 'Strong'];
  
  return {
    score,
    level: levels[Math.min(score, 2)],
    label: labels[Math.min(score, 2)]
  };
});

const canSubmit = computed(() => {
  return businessName.value &&
    name.value &&
    email.value &&
    emailConfirm.value &&
    email.value === emailConfirm.value &&
    password.value &&
    passwordConfirm.value &&
    password.value === passwordConfirm.value &&
    passwordStrength.value.score >= 1 &&
    agreeToTerms.value;
});

const validatePassword = () => {
  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters';
  }
};

const handleSignup = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  // Validate emails match
  if (email.value !== emailConfirm.value) {
    errorMessage.value = 'Email addresses do not match';
    emailConfirmError.value = true;
    isLoading.value = false;
    return;
  }

  // Validate passwords match
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Passwords do not match';
    passwordConfirmError.value = true;
    isLoading.value = false;
    return;
  }

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    // Success - show toast
    toast.success('Account created successfully!');
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || 'Signup failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.signup-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.signup-heading {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.signup-subtext {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

.signup-form {
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

.password-strength {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.strength-text {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.strength-weak {
  color: var(--color-error);
}

.strength-weak :deep(.v-progress-bar) {
  background: var(--gradient-error);
}

.strength-medium {
  color: var(--color-warning);
}

.strength-medium :deep(.v-progress-bar) {
  background: linear-gradient(135deg, var(--color-warning) 0%, #F59E0B 100%);
}

.strength-strong {
  color: var(--color-success);
}

.strength-strong :deep(.v-progress-bar) {
  background: var(--gradient-success);
}

.login-link {
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
