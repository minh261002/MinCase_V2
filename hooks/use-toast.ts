import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
    });
  },
  loading: (message: string, description?: string) => {
    sonnerToast.loading(message, {
      description,
    });
  },
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  message: sonnerToast.message,
  dismiss: sonnerToast.dismiss,
};

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}
