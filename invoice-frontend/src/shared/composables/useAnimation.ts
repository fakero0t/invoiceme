import { ref, onMounted } from 'vue';

export function useAnimation() {
  const prefersReducedMotion = ref(false);

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });

  /**
   * Animate an element with respect to user's motion preferences
   */
  function animate(
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: KeyframeAnimationOptions
  ): Animation | null {
    if (prefersReducedMotion.value) {
      // Skip animation or use very short duration
      const reducedOptions = {
        ...options,
        duration: 1,
      };
      return element.animate(keyframes, reducedOptions);
    }

    return element.animate(keyframes, options);
  }

  /**
   * Check if animations are supported
   */
  function supportsAnimation(): boolean {
    return typeof Element.prototype.animate === 'function';
  }

  return {
    prefersReducedMotion,
    animate,
    supportsAnimation,
  };
}

