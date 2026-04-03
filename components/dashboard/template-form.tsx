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
import { createTemplateAction, type ActionState } from "@/src/server/actions/dashboard-actions";
import { useActionStateToast } from "@/src/hooks/use-action-state-toast";

const initialState: ActionState = {};

const categories = [
  { label: "Forms", value: "forms" },
  { label: "Dialogs", value: "dialogs" },
  { label: "Navigation", value: "navigation" },
  { label: "Tables", value: "tables" },
  { label: "Status messages", value: "status-messages" },
  { label: "Keyboard", value: "keyboard" },
  { label: "Screen reader", value: "screen-reader" }
];

const severities = ["Low", "Medium", "High", "Critical"].map((value) => ({
  label: value,
  value
}));

type EditableTemplate = {
  id: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  component: string | null;
  screenName: string | null;
  affectedUsers: string | null;
  actualBehavior: string;
  expectedBehavior: string;
  wcagVersion: "2.1" | "2.2";
  wcagCriterion: string;
  toolsUsed: string;
  notes: string | null;
};

export function TemplateForm({
  editableTemplates,
  selectedTemplateId
}: {
  editableTemplates: EditableTemplate[];
  selectedTemplateId?: string;
}) {
  const [state, formAction, pending] = useActionState(createTemplateAction, initialState);

  useActionStateToast(state);
  const [editingId, setEditingId] = useState(selectedTemplateId ?? "");
  const locale = useLocale();

  const selected = editableTemplates.find((template) => template.id === editingId);
  const [wcagVersion, setWcagVersion] = useState<WcagVersion>(selected?.wcagVersion ?? "2.2");
  const wcagOptions = useMemo(
    () => getWcagCriterionOptions(wcagVersion, selected?.wcagCriterion),
    [selected?.wcagCriterion, wcagVersion]
  );

  useEffect(() => {
    setWcagVersion(selected?.wcagVersion ?? inferWcagVersion(selected?.wcagCriterion));
  }, [selected?.wcagCriterion, selected?.wcagVersion]);

  function handleWcagVersionChange(nextVersion: WcagVersion) {
    setWcagVersion(nextVersion);
  }

  const c =
    locale === "uk"
      ? {
          editTitle: "Редагувати кастомний шаблон",
          createTitle: "Створити кастомний шаблон",
          createNew: "Створити новий шаблон",
          templateTitle: "Назва шаблону",
          desc: "Яку проблему покриває цей шаблон?",
          component: "Рекомендований компонент (опціонально)",
          screen: "Рекомендований екран/сторінка (опціонально)",
          users: "Affected users (опціонально)",
          actual: "Фактична поведінка",
          expected: "Очікувана поведінка",
          tools: "Інструменти",
          notes: "Додаткові нотатки (опціонально)",
          saving: "Збереження...",
          update: "Оновити шаблон",
          save: "Зберегти шаблон"
        }
      : {
          editTitle: "Edit custom template",
          createTitle: "Create custom template",
          createNew: "Create new template",
          templateTitle: "Template title",
          desc: "What issue does this template cover?",
          component: "Suggested component (optional)",
          screen: "Suggested screen/page (optional)",
          users: "Affected users (optional)",
          actual: "Actual behavior",
          expected: "Expected behavior",
          tools: "Tools used",
          notes: "Optional notes",
          saving: "Saving...",
          update: "Update template",
          save: "Save custom template"
        };

  return (
    <form key={editingId || "new"} action={formAction} className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{selected ? c.editTitle : c.createTitle}</h2>
        <SelectField
          value={editingId}
          onChange={(event) => setEditingId(event.target.value)}
          options={[{ label: c.createNew, value: "" }].concat(
            editableTemplates.map((template) => ({
              label: template.title,
              value: template.id
            }))
          )}
        />
      </div>
      <input type="hidden" name="templateId" value={editingId} />
      <Input name="title" placeholder={c.templateTitle} defaultValue={selected?.title ?? ""} required />
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField name="category" options={categories} defaultValue={selected?.category ?? "forms"} />
        <SelectField name="severity" options={severities} defaultValue={selected?.severity ?? "Medium"} />
      </div>
      <Textarea name="description" placeholder={c.desc} className="min-h-24" defaultValue={selected?.description ?? ""} />
      <Input name="component" placeholder={c.component} defaultValue={selected?.component ?? ""} />
      <Input name="screenName" placeholder={c.screen} defaultValue={selected?.screenName ?? ""} />
      <Input name="affectedUsers" placeholder={c.users} defaultValue={selected?.affectedUsers ?? ""} />
      <Textarea name="actualBehavior" placeholder={c.actual} className="min-h-24" defaultValue={selected?.actualBehavior ?? ""} />
      <Textarea name="expectedBehavior" placeholder={c.expected} className="min-h-24" defaultValue={selected?.expectedBehavior ?? ""} />
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          name="wcagVersion"
          value={wcagVersion}
          onChange={(event) => handleWcagVersionChange(event.target.value as WcagVersion)}
          options={WCAG_VERSION_OPTIONS.map((option) => ({ ...option }))}
        />
        <SelectField key={`${editingId}-${wcagVersion}`} name="wcagCriterion" options={wcagOptions} defaultValue={wcagOptions.some((option) => option.value === selected?.wcagCriterion) ? selected?.wcagCriterion : wcagOptions[0]?.value} />
      </div>
      <Input name="toolsUsed" placeholder={c.tools} defaultValue={selected?.toolsUsed ?? ""} />
      <Textarea name="notes" placeholder={c.notes} className="min-h-20" defaultValue={selected?.notes ?? ""} />
      <Button disabled={pending}>{pending ? c.saving : selected ? c.update : c.save}</Button>
    </form>
  );
}
