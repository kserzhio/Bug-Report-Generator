"use client";

import { useEffect, useRef } from "react";

import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";

type ToastableActionState = {
  success?: string;
  error?: string;
};

export function useActionStateToast(state: ToastableActionState) {
  const lastSuccess = useRef<string | null>(null);
  const lastError = useRef<string | null>(null);

  useEffect(() => {
    if (!state.success || lastSuccess.current === state.success) {
      return;
    }

    lastSuccess.current = state.success;
    notifySuccess(state.success);
  }, [state.success]);

  useEffect(() => {
    if (!state.error || lastError.current === state.error) {
      return;
    }

    lastError.current = state.error;
    notifyError(state.error);
  }, [state.error]);
}
