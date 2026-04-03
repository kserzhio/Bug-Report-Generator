"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";
import {
  getWcagCriterionOptions,
  type WcagVersion
} from "@/src/domain/services/wcag-options";
import {
  duplicateHistoryBugAction,
  updateHistoryBugInlineAction
} from "@/src/server/actions/dashboard-actions";

type HistoryItem = {
  id: string;
  title: string;
  severity: string;
  wcagVersion: string;
  wcagCriterion: string;
  component: string;
  screenName: string;
  notes: string | null;
  updatedAt: string;
  projectId: string | null;
  videoUrl: string | null;
  screenshotUrls: string | null;
};

type ProjectOption = {
  label: string;
  value: string;
};

type HistoryItemEditorLabels = {
  openEdit: string;
  quickEdit: string;
  duplicate: string;
  cancel: string;
  save: string;
  saving: string;
  duplicating: string;
  severity: string;
  component: string;
  screen: string;
  wcagVersion: string;
  wcagCriterion: string;
  notes: string;
  project: string;
  evidence: string;
  updatedAt: string;
  updatedFallback: string;
  duplicatedFallback: string;
};

const severityOptions = ["Critical", "High", "Medium", "Low"].map((value) => ({
  label: value,
  value
}));

function parseEvidenceUrls(value: string | null | undefined) {
  return (value ?? "")
    .split(/\n|,|\s+/g)
    .map((part) => part.trim())
    .filter((part) => /^https?:\/\//i.test(part) || part.startsWith("/"));
}

function shortLabelFromUrl(url: string) {
  const clean = url.split("?")[0] ?? url;
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? url;
}

export function HistoryItemInlineEditor({
  item,
  projectOptions,
  labels
}: {
  item: HistoryItem;
  projectOptions: ProjectOption[];
  labels: HistoryItemEditorLabels;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDuplicating, startDuplicateTransition] = useTransition();
  const [formState, setFormState] = useState({
    severity: item.severity,
    component: item.component,
    screenName: item.screenName,
    wcagVersion: item.wcagVersion as WcagVersion,
    wcagCriterion: item.wcagCriterion,
    notes: item.notes ?? "",
    projectId: item.projectId ?? ""
  });

  const wcagOptions = useMemo(
    () => getWcagCriterionOptions(formState.wcagVersion, formState.wcagCriterion),
    [formState.wcagVersion, formState.wcagCriterion]
  );

  const formattedDate = useMemo(() => new Date(item.updatedAt).toLocaleString(), [item.updatedAt]);
  const screenshotLinks = useMemo(() => parseEvidenceUrls(item.screenshotUrls), [item.screenshotUrls]);
  const hasEvidence = Boolean(item.videoUrl?.trim()) || screenshotLinks.length > 0;

  function onChange<K extends keyof typeof formState>(key: K, value: (typeof formState)[K]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function saveInline() {
    startSaveTransition(async () => {
      const result = await updateHistoryBugInlineAction({
        id: item.id,
        projectId: formState.projectId,
        severity: formState.severity,
        component: formState.component,
        screenName: formState.screenName,
        wcagVersion: formState.wcagVersion,
        wcagCriterion: formState.wcagCriterion,
        notes: formState.notes
      });

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? labels.updatedFallback);
      setIsEditing(false);
    });
  }

  function duplicateInline() {
    startDuplicateTransition(async () => {
      const result = await duplicateHistoryBugAction(item.id);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? labels.duplicatedFallback);
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {labels.updatedAt}: {formattedDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing((value) => !value)}>
            {labels.quickEdit}
          </Button>
          <Link href={`/dashboard/generator?bugId=${item.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {labels.openEdit}
          </Link>
          <Button type="button" size="sm" onClick={duplicateInline} disabled={isDuplicating}>
            {isDuplicating ? labels.duplicating : labels.duplicate}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-1 text-xs text-slate-600 md:grid-cols-2">
        <p>{labels.severity}: {formState.severity}</p>
        <p>WCAG {formState.wcagVersion}: {formState.wcagCriterion}</p>
        <p>{labels.component}: {formState.component}</p>
        <p>{labels.screen}: {formState.screenName}</p>
      </div>

      {hasEvidence ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{labels.evidence}</p>
          <div className="flex flex-wrap gap-2">
            {item.videoUrl?.trim() ? (
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
              >
                Video
              </a>
            ) : null}
            {screenshotLinks.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {shortLabelFromUrl(url)}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              id={`severity-${item.id}`}
              value={formState.severity}
              onChange={(event) => onChange("severity", event.target.value)}
              options={severityOptions}
            />
            <SelectField
              id={`project-${item.id}`}
              value={formState.projectId}
              onChange={(event) => onChange("projectId", event.target.value)}
              options={projectOptions}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={formState.component}
              onChange={(event) => onChange("component", event.target.value)}
              placeholder={labels.component}
            />
            <Input
              value={formState.screenName}
              onChange={(event) => onChange("screenName", event.target.value)}
              placeholder={labels.screen}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              id={`wcag-version-${item.id}`}
              value={formState.wcagVersion}
              onChange={(event) => onChange("wcagVersion", event.target.value as WcagVersion)}
              options={[{ label: "WCAG 2.1", value: "2.1" }, { label: "WCAG 2.2", value: "2.2" }]}
            />
            <SelectField
              id={`wcag-criterion-${item.id}`}
              value={formState.wcagCriterion}
              onChange={(event) => onChange("wcagCriterion", event.target.value)}
              options={wcagOptions}
            />
          </div>
          <Textarea
            value={formState.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder={labels.notes}
            className="min-h-20"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              {labels.cancel}
            </Button>
            <Button type="button" onClick={saveInline} disabled={isSaving}>
              {isSaving ? labels.saving : labels.save}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
