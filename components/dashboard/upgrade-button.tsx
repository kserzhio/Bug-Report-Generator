"use client";

import { useTransition } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { notifyError } from "@/lib/ui/toast-policy";
import { createStripeCheckoutAction } from "@/src/server/actions/dashboard-actions";

export function UpgradeButton() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const label =
    locale === "uk"
      ? { opening: "Відкриття checkout...", upgrade: "Оновити через Stripe" }
      : { opening: "Opening checkout...", upgrade: "Upgrade with Stripe" };

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await createStripeCheckoutAction();

          if (result.error) {
            notifyError(result.error);
            return;
          }

          if (result.url) {
            window.location.href = result.url;
          }
        });
      }}
    >
      {isPending ? label.opening : label.upgrade}
    </Button>
  );
}
