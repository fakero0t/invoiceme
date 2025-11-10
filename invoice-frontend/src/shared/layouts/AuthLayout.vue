<template>
  <div class="auth-layout">
    <div class="auth-layout-background" />
    <div class="auth-layout-content">
      <div class="auth-layout-card">
        <!-- Logo -->
        <div class="auth-layout-logo">
          <slot name="logo">
            <span class="auth-layout-logo-text">InvoiceMe</span>
          </slot>
        </div>

        <!-- Main content -->
        <div class="auth-layout-main">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="auth-layout-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<script lang="ts">
import { useSlots } from 'vue';
</script>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  overflow: hidden;
}

.auth-layout-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(107, 114, 128, 0.1) 0%,
    rgba(115, 115, 115, 0.1) 100%
  );
  z-index: 0;
}

.auth-layout-content {
  position: relative;
  width: 100%;
  max-width: 400px;
  z-index: 1;
}

.auth-layout-card {
  background-color: var(--color-card-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-8);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

@media (max-width: 768px) {
  .auth-layout {
    padding: var(--spacing-4);
  }

  .auth-layout-card {
    padding: var(--spacing-6);
  }
}

.auth-layout-logo {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-4);
}

.auth-layout-logo-text {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-layout-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.auth-layout-footer {
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-gray);
  text-align: center;
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}
</style>

