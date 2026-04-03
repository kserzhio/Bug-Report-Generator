"use client";

import { useTransition } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { deleteTemplateAction } from "@/src/server/actions/dashboard-actions";

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const [pending, startTransition] = useTransition();
  const locale = useLocale();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteTemplateAction(templateId);
        });
      }}
    >
      {pending ? (locale === "uk" ? "Видалення..." : "Deleting...") : locale === "uk" ? "Видалити" : "Delete"}
    </Button>
  );
}
