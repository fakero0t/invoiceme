<template>
  <div class="empty-layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.empty-layout {
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
}
</style>

