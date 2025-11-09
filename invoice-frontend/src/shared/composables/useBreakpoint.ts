import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export function useBreakpoint() {
  const windowWidth = ref(0);

  // Breakpoint values from design tokens
  const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  };

  const isMobile = computed(() => windowWidth.value < breakpoints.mobile);
  const isTablet = computed(() => 
    windowWidth.value >= breakpoints.mobile && windowWidth.value < breakpoints.tablet
  );
  const isDesktop = computed(() => windowWidth.value >= breakpoints.tablet);
  const isLargeDesktop = computed(() => windowWidth.value >= breakpoints.desktop);

  const currentBreakpoint = computed(() => {
    if (isMobile.value) return 'mobile';
    if (isTablet.value) return 'tablet';
    if (isLargeDesktop.value) return 'large-desktop';
    return 'desktop';
  });

  function updateWidth() {
    windowWidth.value = window.innerWidth;
  }

  onMounted(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWidth);
  });

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
    breakpoints,
  };
}

