import { MembersAccessPanel } from "@/components/dashboard/members-access-panel";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

function formatAuditEventLabel(eventType: string) {
  return eventType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SettingsPage() {
  const context = await getCurrentWorkspaceContext();
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);
  const canEditWorkspace = context.currentRole === "OWNER" || context.currentRole === "ADMIN";
  const noEventsText = locale === "uk" ? "Подій ще немає." : "No events yet.";
  const unknownActor = locale === "uk" ? "Система" : "System";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t.dashboard.settingsTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.settingsSubtitle}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.workspaceDefaults}</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            workspaceName={context.workspace.name}
            defaultTools={context.workspace.defaultTools ?? "NVDA, Axe DevTools, keyboard-only testing"}
            uiLocale={context.workspace.uiLocale === "uk" ? "uk" : "en"}
            jiraBaseUrl={context.workspace.jiraBaseUrl ?? ""}
            jiraProjectKey={context.workspace.jiraProjectKey ?? ""}
            jiraIssueType={context.workspace.jiraIssueType ?? "Bug"}
            azureBaseUrl={context.workspace.azureBaseUrl ?? ""}
            azureWorkItemType={context.workspace.azureWorkItemType ?? "Bug"}
            linearTeamId={context.workspace.linearTeamId ?? ""}
            canEdit={canEditWorkspace}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Members & access</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersAccessPanel
            currentUserId={context.currentUserId}
            currentWorkspaceId={context.workspace.id}
            currentRole={context.currentRole}
            memberships={context.memberships}
            members={context.workspace.members.map((member) => ({
              id: member.id,
              userId: member.userId,
              role: member.role,
              name: member.user.name,
              email: member.user.email
            }))}
            pendingInvites={context.pendingInvites.map((invite) => ({
              id: invite.id,
              email: invite.email,
              role: invite.role,
              createdAt: invite.createdAt.toLocaleString(),
              expiresAt: invite.expiresAt.toLocaleString(),
              invitedBy: invite.invitedBy.name ?? invite.invitedBy.email ?? "Unknown"
            }))}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Workspace activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {context.auditEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{noEventsText}</p>
          ) : (
            context.auditEvents.map((event) => {
              const actor = event.actor?.name ?? event.actor?.email ?? unknownActor;
              return (
                <div key={event.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge>{formatAuditEventLabel(event.eventType)}</Badge>
                      <p className="text-sm font-medium text-slate-900">{event.message}</p>
                    </div>
                    <p className="text-xs text-slate-500">{event.createdAt.toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Actor: {actor}</p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
