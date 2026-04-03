"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";
import { useActionStateToast } from "@/src/hooks/use-action-state-toast";
import {
  inviteWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  revokeWorkspaceInviteAction,
  switchWorkspaceAction,
  type ActionState,
  updateWorkspaceMemberRoleAction
} from "@/src/server/actions/dashboard-actions";

const initialState: ActionState = {};

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" }
];

export function MembersAccessPanel({
  currentUserId,
  currentWorkspaceId,
  currentRole,
  memberships,
  members,
  pendingInvites
}: {
  currentUserId: string;
  currentWorkspaceId: string;
  currentRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  memberships: Array<{
    workspaceId: string;
    workspaceName: string;
    role: string;
  }>;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    name: string | null;
    email: string;
  }>;
  pendingInvites: Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
    expiresAt: string;
    invitedBy: string;
  }>;
}) {
  const router = useRouter();
  const [inviteState, inviteAction, invitePending] = useActionState(inviteWorkspaceMemberAction, initialState);
  const [roleState, roleAction, rolePending] = useActionState(updateWorkspaceMemberRoleAction, initialState);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(currentWorkspaceId);
  const [isSwitching, startSwitchTransition] = useTransition();
  const [isMutating, startMutatingTransition] = useTransition();

  useActionStateToast(inviteState);
  useActionStateToast(roleState);

  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  function handleSwitchWorkspace() {
    if (!activeWorkspaceId || activeWorkspaceId === currentWorkspaceId) {
      return;
    }

    startSwitchTransition(async () => {
      const result = await switchWorkspaceAction(activeWorkspaceId);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Workspace switched.");
      router.refresh();
    });
  }

  function handleRevokeInvite(inviteId: string) {
    startMutatingTransition(async () => {
      const result = await revokeWorkspaceInviteAction(inviteId);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Invite revoked.");
      router.refresh();
    });
  }

  function handleRemoveMember(memberId: string) {
    startMutatingTransition(async () => {
      const result = await removeWorkspaceMemberAction(memberId);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Member removed.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-base font-semibold text-slate-950">Active workspace</h3>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="workspaceSwitch">Switch workspace</Label>
            <SelectField
              id="workspaceSwitch"
              value={activeWorkspaceId}
              onChange={(event) => setActiveWorkspaceId(event.target.value)}
              options={memberships.map((membership) => ({
                value: membership.workspaceId,
                label: `${membership.workspaceName} (${membership.role})`
              }))}
            />
          </div>
          <Button type="button" variant="outline" disabled={isSwitching || activeWorkspaceId === currentWorkspaceId} onClick={handleSwitchWorkspace}>
            {isSwitching ? "Switching..." : "Switch"}
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-base font-semibold text-slate-950">Members</h3>
        <div className="space-y-3">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;

            return (
              <div key={member.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {member.name ?? member.email}
                      {isSelf ? " (You)" : ""}
                    </p>
                    <p className="text-xs text-slate-600">{member.email}</p>
                  </div>
                  <form action={roleAction} className="flex items-center gap-2">
                    <input type="hidden" name="memberId" value={member.id} />
                    <SelectField
                      name="role"
                      defaultValue={member.role}
                      options={[
                        { value: "OWNER", label: "Owner" },
                        { value: "ADMIN", label: "Admin" },
                        { value: "MEMBER", label: "Member" },
                        { value: "VIEWER", label: "Viewer" }
                      ]}
                      disabled={!canManage || isSelf || rolePending || isMutating}
                    />
                    <Button type="submit" variant="outline" disabled={!canManage || isSelf || rolePending || isMutating}>
                      Update
                    </Button>
                  </form>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canManage || isSelf || isMutating || rolePending}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-base font-semibold text-slate-950">Invite member</h3>
        <form action={inviteAction} className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail">Email</Label>
            <Input id="inviteEmail" name="email" type="email" placeholder="qa@company.com" disabled={!canManage || invitePending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteRole">Role</Label>
            <SelectField id="inviteRole" name="role" defaultValue="MEMBER" options={roleOptions} disabled={!canManage || invitePending} />
          </div>
          <Button disabled={!canManage || invitePending}>{invitePending ? "Inviting..." : "Send invite"}</Button>
        </form>
        {inviteState.inviteLink ? (
          <p className="text-xs text-slate-600">
            Invite link: <a href={inviteState.inviteLink} className="font-medium text-primary" target="_blank" rel="noreferrer">{inviteState.inviteLink}</a>
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-base font-semibold text-slate-950">Pending invites</h3>
        {pendingInvites.length === 0 ? (
          <p className="text-sm text-slate-600">No pending invites.</p>
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{invite.email}</p>
                  <p className="text-xs text-slate-600">
                    {invite.role} • expires {invite.expiresAt}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canManage || isMutating}
                  onClick={() => handleRevokeInvite(invite.id)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}