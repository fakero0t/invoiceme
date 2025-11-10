<template>
  <div :class="avatarClasses" :style="avatarStyle">
    <img v-if="src" :src="src" :alt="alt" class="v-avatar-image" />
    <span v-else class="v-avatar-initials">{{ computedInitials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<VAvatarProps>(), {
  src: '',
  alt: '',
  name: '',
  initials: '',
  size: 'md',
});

const avatarClasses = computed(() => {
  return [
    'v-avatar',
    `v-avatar--${props.size}`,
  ];
});

const computedInitials = computed(() => {
  // Use explicit initials if provided
  if (props.initials) {
    return props.initials.substring(0, 2).toUpperCase();
  }
  
  // Generate initials from name if provided
  if (props.name) {
    const nameParts = props.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      // First letter of first name + first letter of last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts[0].length > 0) {
      // Just first letter of single name
      return nameParts[0][0].toUpperCase();
    }
  }
  
  return '?';
});

// Generate a consistent color based on initials
const avatarStyle = computed(() => {
  if (props.src) return {};
  
  const hash = computedInitials.value
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  
  const colorIndex = Math.abs(hash) % 10;
  const colors = [
    { bg: 'var(--color-venmo-blue-100)', text: 'var(--color-venmo-blue-700)' },
    { bg: 'var(--color-venmo-blue-200)', text: 'var(--color-venmo-blue-800)' },
    { bg: 'var(--color-venmo-purple-100)', text: 'var(--color-venmo-purple-700)' },
    { bg: 'var(--color-venmo-purple-200)', text: 'var(--color-venmo-purple-800)' },
    { bg: 'var(--color-success-light)', text: 'var(--color-success-dark)' },
    { bg: 'var(--color-info-light)', text: 'var(--color-info-dark)' },
    { bg: 'var(--color-warning-light)', text: 'var(--color-warning-dark)' },
    { bg: 'var(--color-venmo-blue-50)', text: 'var(--color-venmo-blue-600)' },
    { bg: 'var(--color-venmo-purple-50)', text: 'var(--color-venmo-purple-600)' },
    { bg: 'var(--color-venmo-blue-300)', text: 'var(--color-venmo-blue-900)' },
  ];
  
  return {
    backgroundColor: colors[colorIndex].bg,
    color: colors[colorIndex].text,
  };
});
</script>

<style scoped>
.v-avatar {
  /* Base avatar styles using design tokens */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
}

/* Size variants */
.v-avatar--sm {
  width: var(--spacing-8);
  height: var(--spacing-8);
}

.v-avatar--md {
  width: var(--spacing-10);
  height: var(--spacing-10);
}

.v-avatar--lg {
  width: var(--spacing-12);
  height: var(--spacing-12);
}

.v-avatar--xl {
  width: var(--spacing-16);
  height: var(--spacing-16);
}

/* Avatar image */
.v-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Avatar initials */
.v-avatar-initials {
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  user-select: none;
}

.v-avatar--sm .v-avatar-initials {
  font-size: var(--font-size-caption);
}

.v-avatar--md .v-avatar-initials {
  font-size: var(--font-size-body-sm);
}

.v-avatar--lg .v-avatar-initials {
  font-size: var(--font-size-body);
}

.v-avatar--xl .v-avatar-initials {
  font-size: var(--font-size-h3);
}
</style>

