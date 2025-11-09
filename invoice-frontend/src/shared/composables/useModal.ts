import { ref, onBeforeUnmount } from 'vue';

export function useModal() {
  const isOpen = ref(false);
  const originalOverflow = ref('');

  function open() {
    isOpen.value = true;
    originalOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen.value = false;
    document.body.style.overflow = originalOverflow.value;
  }

  function toggle() {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  /**
   * Trap focus within a container element
   */
  function trapFocus(container: HTMLElement, event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Lock body scroll
   */
  function lockScroll() {
    originalOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Unlock body scroll
   */
  function unlockScroll() {
    document.body.style.overflow = originalOverflow.value;
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (isOpen.value) {
      unlockScroll();
    }
  });

  return {
    isOpen,
    open,
    close,
    toggle,
    trapFocus,
    lockScroll,
    unlockScroll,
  };
}

