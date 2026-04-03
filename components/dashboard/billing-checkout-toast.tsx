"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { notifySuccess, notifyWarning } from "@/lib/ui/toast-policy";
import { useToastMessages } from "@/src/hooks/use-toast-messages";

export function BillingCheckoutToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handledValue = useRef<string | null>(null);
  const t = useToastMessages();

  useEffect(() => {
    const checkout = searchParams.get("checkout");

    if (!checkout || handledValue.current === checkout) {
      return;
    }

    handledValue.current = checkout;

    if (checkout === "success") {
      notifySuccess(t.billing.checkoutSuccess);
    } else if (checkout === "cancelled") {
      notifyWarning(t.billing.checkoutCancelled);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("checkout");
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, t]);

  return null;
}

