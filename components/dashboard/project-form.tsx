"use client";

import { useActionState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { createProjectAction, type ActionState } from "@/src/server/actions/dashboard-actions";
import { useActionStateToast } from "@/src/hooks/use-action-state-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function ProjectForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);
  const locale = useLocale();

  useActionStateToast(state);

  const copy =
    locale === "uk"
      ? {
          namePlaceholder: "Назва нового проєкту",
          descriptionPlaceholder: "Короткий опис (опціонально)",
          creating: "Створення...",
          create: "Створити проєкт"
        }
      : {
          namePlaceholder: "New project name",
          descriptionPlaceholder: "Short description (optional)",
          creating: "Creating...",
          create: "Create project"
        };

  return (
    <form action={formAction} className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <Input name="name" placeholder={copy.namePlaceholder} required />
      <Textarea name="description" placeholder={copy.descriptionPlaceholder} className="min-h-24" />
      <Button disabled={pending}>{pending ? copy.creating : copy.create}</Button>
    </form>
  );
}
