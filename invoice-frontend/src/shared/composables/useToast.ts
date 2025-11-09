import { ref, h, render } from 'vue';
import VToast from '../components/VToast.vue';

export interface ToastOptions {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
}

class ToastManager {
  private container: HTMLElement | null = null;
  private instance: any = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
      
      const vnode = h(VToast);
      render(vnode, this.container);
      this.instance = vnode.component?.exposed;
    }
  }

  show(options: ToastOptions) {
    this.ensureContainer();
    return this.instance?.addToast({
      message: options.message,
      variant: options.variant || 'info',
      duration: options.duration ?? 5000,
      closable: options.closable ?? true,
    });
  }

  success(message: string, duration?: number) {
    return this.show({ message, variant: 'success', duration });
  }

  error(message: string, duration?: number) {
    return this.show({ message, variant: 'error', duration });
  }

  warning(message: string, duration?: number) {
    return this.show({ message, variant: 'warning', duration });
  }

  info(message: string, duration?: number) {
    return this.show({ message, variant: 'info', duration });
  }

  remove(id: number) {
    this.instance?.removeToast(id);
  }
}

const toastManager = new ToastManager();

export function useToast() {
  return {
    show: (options: ToastOptions) => toastManager.show(options),
    success: (message: string, duration?: number) => toastManager.success(message, duration),
    error: (message: string, duration?: number) => toastManager.error(message, duration),
    warning: (message: string, duration?: number) => toastManager.warning(message, duration),
    info: (message: string, duration?: number) => toastManager.info(message, duration),
    remove: (id: number) => toastManager.remove(id),
  };
}

