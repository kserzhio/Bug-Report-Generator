"use client";

import { useActionState, useEffect, useState } from "react";

import { SelectField } from "@/components/forms/select-field";
import { useI18n, useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionStateToast } from "@/src/hooks/use-action-state-toast";
import { updateSettingsAction, type ActionState } from "@/src/server/actions/dashboard-actions";

const initialState: ActionState = {};
const localeOptions = [
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" }
];

type UiLocale = "en" | "uk";

export function SettingsForm({
  workspaceName,
  defaultTools,
  uiLocale,
  jiraBaseUrl,
  jiraProjectKey,
  jiraIssueType,
  azureBaseUrl,
  azureWorkItemType,
  linearTeamId,
  canEdit
}: {
  workspaceName: string;
  defaultTools: string;
  uiLocale: UiLocale;
  jiraBaseUrl: string;
  jiraProjectKey: string;
  jiraIssueType: string;
  azureBaseUrl: string;
  azureWorkItemType: string;
  linearTeamId: string;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const [selectedLocale, setSelectedLocale] = useState<UiLocale>(uiLocale);
  const t = useI18n();
  const locale = useLocale();

  useActionStateToast(state);

  useEffect(() => {
    document.documentElement.lang = selectedLocale;
  }, [selectedLocale]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">{locale === "uk" ? "Назва workspace" : "Workspace name"}</Label>
        <Input id="workspaceName" name="workspaceName" defaultValue={workspaceName} disabled={!canEdit || pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultTools">{locale === "uk" ? "Інструменти за замовчуванням" : "Default tools"}</Label>
        <Input id="defaultTools" name="defaultTools" defaultValue={defaultTools} disabled={!canEdit || pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="uiLocale">{locale === "uk" ? "Мова" : "Language"}</Label>
        <SelectField
          id="uiLocale"
          name="uiLocale"
          value={selectedLocale}
          onChange={(event) => setSelectedLocale(event.target.value as UiLocale)}
          options={localeOptions}
          disabled={!canEdit || pending}
        />
      </div>
      <div className="space-y-2 border-t border-slate-200 pt-4">
        <p className="text-sm font-medium text-slate-900">{locale === "uk" ? "Інтеграції трекерів" : "Tracker integrations"}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="jiraBaseUrl">Jira base URL</Label>
        <Input id="jiraBaseUrl" name="jiraBaseUrl" defaultValue={jiraBaseUrl} placeholder="https://your-team.atlassian.net" disabled={!canEdit || pending} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="jiraProjectKey">Jira project key</Label>
          <Input id="jiraProjectKey" name="jiraProjectKey" defaultValue={jiraProjectKey} placeholder="WEB" disabled={!canEdit || pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jiraIssueType">Jira issue type</Label>
          <Input id="jiraIssueType" name="jiraIssueType" defaultValue={jiraIssueType} placeholder="Bug" disabled={!canEdit || pending} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="azureBaseUrl">Azure DevOps project URL</Label>
        <Input id="azureBaseUrl" name="azureBaseUrl" defaultValue={azureBaseUrl} placeholder="https://dev.azure.com/org/project" disabled={!canEdit || pending} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="azureWorkItemType">Azure work item type</Label>
          <Input id="azureWorkItemType" name="azureWorkItemType" defaultValue={azureWorkItemType} placeholder="Bug" disabled={!canEdit || pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linearTeamId">Linear team key/id</Label>
          <Input id="linearTeamId" name="linearTeamId" defaultValue={linearTeamId} placeholder="ENG" disabled={!canEdit || pending} />
        </div>
      </div>
      <Button disabled={!canEdit || pending}>{pending ? t.common.loading : t.common.save}</Button>
      {!canEdit ? (
        <p className="text-xs text-slate-600">
          {locale === "uk"
            ? "Потрібна роль Admin або Owner для зміни налаштувань workspace."
            : "Admin or Owner role is required to change workspace settings."}
        </p>
      ) : null}
    </form>
  );
}
