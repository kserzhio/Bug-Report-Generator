import type { ExternalToast } from "sonner";
import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

const TOAST_DURATION: Record<ToastType, number> = {
  success: 2200,
  error: 4200,
  warning: 3400,
  info: 2600
};

function showToast(type: ToastType, message: string, options?: ExternalToast) {
  const duration = options?.duration ?? TOAST_DURATION[type];

  if (type === "success") {
    toast.success(message, { ...options, duration });
    return;
  }

  if (type === "error") {
    toast.error(message, { ...options, duration });
    return;
  }

  if (type === "warning") {
    toast.warning(message, { ...options, duration });
    return;
  }

  toast(message, { ...options, duration });
}

export function notifySuccess(message: string, options?: ExternalToast) {
  showToast("success", message, options);
}

export function notifyError(message: string, options?: ExternalToast) {
  showToast("error", message, options);
}

export function notifyWarning(message: string, options?: ExternalToast) {
  showToast("warning", message, options);
}

export function notifyInfo(message: string, options?: ExternalToast) {
  showToast("info", message, options);
}
