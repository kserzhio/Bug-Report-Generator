"use client";

import { useTransition } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { notifyError } from "@/lib/ui/toast-policy";
import { createStripePortalAction } from "@/src/server/actions/dashboard-actions";

export function CustomerPortalButton() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const label =
    locale === "uk"
      ? { opening: "Відкриття portal...", open: "Керувати підпискою" }
      : { opening: "Opening portal...", open: "Manage subscription" };

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await createStripePortalAction();

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
      {isPending ? label.opening : label.open}
    </Button>
  );
}
