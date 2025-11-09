<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const transitionName = ref('fade');
const previousPath = ref('');

// Track navigation direction for better transitions
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    // Determine transition based on navigation
    if (previousPath.value && newPath) {
      // Use slide transitions for forward/back navigation
      const isForward = newPath.length > previousPath.value.length;
      
      if (newPath.includes('/login') || newPath.includes('/signup')) {
        transitionName.value = 'slide-up';
      } else if (isForward) {
        transitionName.value = 'slide-left';
      } else {
        transitionName.value = 'slide-right';
      }
    } else {
      transitionName.value = 'fade';
    }
    
    previousPath.value = newPath;
  }
);
</script>

<style>
#app {
  min-height: 100vh;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-medium) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide left transition (forward navigation) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform var(--duration-medium) var(--ease-out),
              opacity var(--duration-medium) var(--ease-out);
}

.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Slide right transition (back navigation) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform var(--duration-medium) var(--ease-out),
              opacity var(--duration-medium) var(--ease-out);
}

.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Slide up transition (modals/auth pages) */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform var(--duration-medium) var(--ease-out),
              opacity var(--duration-medium) var(--ease-out);
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
