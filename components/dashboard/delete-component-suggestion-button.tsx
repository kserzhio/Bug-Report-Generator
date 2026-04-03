"use client";

import { useTransition } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";
import { deleteComponentIssueSuggestionAction } from "@/src/server/actions/dashboard-actions";

export function DeleteComponentSuggestionButton({
  suggestionId
}: {
  suggestionId: string;
}) {
  const [pending, startTransition] = useTransition();
  const locale = useLocale();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await deleteComponentIssueSuggestionAction(suggestionId);

          if (result.error) {
            notifyError(result.error);
            return;
          }

          notifySuccess(
            result.success ??
              (locale === "uk"
                ? "Підказку проблеми компонента видалено."
                : "Component issue suggestion deleted.")
          );
        });
      }}
    >
      {pending
        ? locale === "uk"
          ? "Видалення..."
          : "Deleting..."
        : locale === "uk"
          ? "Видалити"
          : "Delete"}
    </Button>
  );
}
