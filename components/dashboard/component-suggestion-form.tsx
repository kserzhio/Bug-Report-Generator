"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { SelectField } from "@/components/forms/select-field";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getWcagCriterionOptions,
  inferWcagVersion,
  WCAG_VERSION_OPTIONS,
  type WcagVersion
} from "@/src/domain/services/wcag-options";
import {
  type ActionState,
  upsertComponentIssueSuggestionAction
} from "@/src/server/actions/dashboard-actions";
import { useActionStateToast } from "@/src/hooks/use-action-state-toast";

const initialState: ActionState = {};

const severities = ["Low", "Medium", "High", "Critical"].map((value) => ({
  label: value,
  value
}));

type EditableSuggestion = {
  id: string;
  title: string;
  componentKey: string;
  category: string;
  tags: string[];
  severity: string;
  affectedUsers: string;
  actualBehavior: string;
  expectedBehavior: string;
  wcagCriterion: string;
  notes: string | null;
};

export function ComponentSuggestionForm({
  editableSuggestions,
  selectedSuggestionId
}: {
  editableSuggestions: EditableSuggestion[];
  selectedSuggestionId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    upsertComponentIssueSuggestionAction,
    initialState
  );

  useActionStateToast(state);
  const [editingId, setEditingId] = useState(selectedSuggestionId ?? "");
  const locale = useLocale();

  const selected = editableSuggestions.find((suggestion) => suggestion.id === editingId);
  const [wcagVersion, setWcagVersion] = useState<WcagVersion>(
    inferWcagVersion(selected?.wcagCriterion)
  );

  const wcagOptions = useMemo(
    () => getWcagCriterionOptions(wcagVersion, selected?.wcagCriterion),
    [selected?.wcagCriterion, wcagVersion]
  );

  useEffect(() => {
    setWcagVersion(inferWcagVersion(selected?.wcagCriterion));
  }, [selected?.wcagCriterion]);

  const c =
    locale === "uk"
      ? {
          editTitle: "Редагувати підказку компонента",
          createTitle: "Створити підказку компонента",
          createNew: "Нова підказка",
          title: "Назва підказки",
          componentKey: "Ключ компонента (напр. modal)",
          category: "Категорія",
          tags: "Теги через кому (опціонально)",
          users: "Кого зачіпає (опціонально)",
          actual: "Фактична поведінка",
          expected: "Очікувана поведінка",
          notes: "Нотатки (опціонально)",
          saving: "Збереження...",
          update: "Оновити підказку",
          save: "Зберегти підказку"
        }
      : {
          editTitle: "Edit component suggestion",
          createTitle: "Create component suggestion",
          createNew: "Create new suggestion",
          title: "Suggestion title",
          componentKey: "Component key (e.g. modal)",
          category: "Category",
          tags: "Tags (comma separated, optional)",
          users: "Affected users (optional)",
          actual: "Actual behavior",
          expected: "Expected behavior",
          notes: "Optional notes",
          saving: "Saving...",
          update: "Update suggestion",
          save: "Save suggestion"
        };

  const suggestionCategories = locale === "uk"
    ? [
        { label: "Загальне", value: "general" },
        { label: "Форми", value: "forms" },
        { label: "Діалоги / модалки", value: "dialogs" },
        { label: "Навігація", value: "navigation" },
        { label: "Таблиці", value: "tables" },
        { label: "Статусні повідомлення", value: "status-messages" },
        { label: "Клавіатура", value: "keyboard" },
        { label: "Скрінрідер", value: "screen-reader" },
        { label: "ARIA", value: "aria" },
        { label: "Контент / структура", value: "content-structure" }
      ]
    : [
        { label: "General", value: "general" },
        { label: "Forms", value: "forms" },
        { label: "Dialogs / Modals", value: "dialogs" },
        { label: "Navigation", value: "navigation" },
        { label: "Tables", value: "tables" },
        { label: "Status messages", value: "status-messages" },
        { label: "Keyboard", value: "keyboard" },
        { label: "Screen reader", value: "screen-reader" },
        { label: "ARIA", value: "aria" },
        { label: "Content / structure", value: "content-structure" }
      ];

  const severityOptions = locale === "uk"
    ? [
        { label: "Низька", value: "Low" },
        { label: "Середня", value: "Medium" },
        { label: "Висока", value: "High" },
        { label: "Критична", value: "Critical" }
      ]
    : severities;

  const wcagVersionOptions = locale === "uk"
    ? [
        { label: "WCAG 2.1", value: "2.1" },
        { label: "WCAG 2.2", value: "2.2" }
      ]
    : WCAG_VERSION_OPTIONS.map((option) => ({ ...option }));

  return (
    <form
      key={editingId || "new"}
      action={formAction}
      className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">
          {selected ? c.editTitle : c.createTitle}
        </h2>
        <SelectField
          value={editingId}
          onChange={(event) => setEditingId(event.target.value)}
          options={[{ label: c.createNew, value: "" }].concat(
            editableSuggestions.map((suggestion) => ({
              label: suggestion.title,
              value: suggestion.id
            }))
          )}
        />
      </div>

      <input type="hidden" name="suggestionId" value={editingId} />
      <Input name="title" placeholder={c.title} defaultValue={selected?.title ?? ""} required />
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          name="componentKey"
          placeholder={c.componentKey}
          defaultValue={selected?.componentKey ?? ""}
          required
        />
        <SelectField
          name="severity"
          options={severityOptions}
          defaultValue={selected?.severity ?? "Medium"}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          name="category"
          options={suggestionCategories}
          defaultValue={selected?.category ?? "general"}
        />
        <Input
          name="tags"
          placeholder={c.tags}
          defaultValue={selected?.tags?.join(", ") ?? ""}
        />
      </div>
      <Input
        name="affectedUsers"
        placeholder={c.users}
        defaultValue={selected?.affectedUsers ?? ""}
      />
      <Textarea
        name="actualBehavior"
        placeholder={c.actual}
        className="min-h-24"
        defaultValue={selected?.actualBehavior ?? ""}
      />
      <Textarea
        name="expectedBehavior"
        placeholder={c.expected}
        className="min-h-24"
        defaultValue={selected?.expectedBehavior ?? ""}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          name="wcagVersion"
          value={wcagVersion}
          onChange={(event) => setWcagVersion(event.target.value as WcagVersion)}
          options={wcagVersionOptions}
        />
        <SelectField
          key={`${editingId}-${wcagVersion}`}
          name="wcagCriterion"
          options={wcagOptions}
          defaultValue={
            wcagOptions.some((option) => option.value === selected?.wcagCriterion)
              ? selected?.wcagCriterion
              : wcagOptions[0]?.value
          }
        />
      </div>
      <Textarea
        name="notes"
        placeholder={c.notes}
        className="min-h-20"
        defaultValue={selected?.notes ?? ""}
      />
      <Button disabled={pending}>
        {pending ? c.saving : selected ? c.update : c.save}
      </Button>
    </form>
  );
}
