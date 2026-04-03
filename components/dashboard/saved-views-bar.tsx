"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteSavedViewAction, saveSavedViewAction, type ActionState } from "@/src/server/actions/dashboard-actions";
import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";
import { useActionStateToast } from "@/src/hooks/use-action-state-toast";

const initialState: ActionState = {};

type SavedViewItem = {
  id: string;
  name: string;
  queryString: string;
  visibility: "PRIVATE" | "WORKSPACE";
  isOwnedByCurrentUser: boolean;
  ownerLabel: string;
};

export function SavedViewsBar({
  scope,
  currentQueryString,
  currentUserId,
  canManageWorkspaceViews,
  views
}: {
  scope: "HISTORY" | "LIBRARY";
  currentQueryString: string;
  currentUserId: string;
  canManageWorkspaceViews: boolean;
  views: SavedViewItem[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveSavedViewAction, initialState);
  const [isDeleting, startDeleting] = useTransition();

  useActionStateToast(state);

  function deleteView(id: string) {
    startDeleting(async () => {
      const result = await deleteSavedViewAction(id);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Saved view deleted.");
      router.refresh();
    });
  }

  const basePath = scope === "HISTORY" ? "/dashboard/history" : "/dashboard/library";

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <Link href={basePath} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
          Clear filters
        </Link>
        {views.map((view) => {
          const canDelete = view.isOwnedByCurrentUser || canManageWorkspaceViews;

          return (
            <div key={view.id} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  view.visibility === "WORKSPACE"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {view.visibility === "WORKSPACE" ? "Team" : "Private"}
              </span>
              <Link href={view.queryString ? `${basePath}?${view.queryString}` : basePath} className="text-xs font-semibold text-slate-700">
                {view.name}
              </Link>
              {view.visibility === "WORKSPACE" && !view.isOwnedByCurrentUser ? (
                <span className="text-[10px] text-slate-500">by {view.ownerLabel}</span>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800"
                  disabled={isDeleting}
                  onClick={() => deleteView(view.id)}
                  aria-label={`Delete saved view ${view.name}`}
                >
                  x
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <form action={formAction} className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
        <input type="hidden" name="scope" value={scope} />
        <input type="hidden" name="queryString" value={currentQueryString} />
        <input type="hidden" name="currentUserId" value={currentUserId} />
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Save current filters</label>
          <Input name="name" placeholder="For example: Critical checkout bugs" disabled={pending} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Visibility</label>
          <select
            name="visibility"
            defaultValue="PRIVATE"
            disabled={pending}
            className="h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm"
          >
            <option value="PRIVATE">Private</option>
            <option value="WORKSPACE">Team (workspace)</option>
          </select>
        </div>
        <Button disabled={pending}>{pending ? "Saving..." : "Save view"}</Button>
      </form>
    </div>
  );
}
