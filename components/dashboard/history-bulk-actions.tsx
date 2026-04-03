"use client";

import { useMemo, useState, useTransition } from "react";

import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";
import { bulkAssignHistoryBugsProjectAction, bulkDeleteHistoryBugsAction } from "@/src/server/actions/dashboard-actions";
import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";

type HistoryItem = {
  id: string;
  title: string;
  severity: string;
  projectId: string | null;
};

export function HistoryBulkActions({
  items,
  projectOptions
}: {
  items: HistoryItem[];
  projectOptions: Array<{ label: string; value: string }>;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetProjectId, setTargetProjectId] = useState("");
  const [isPending, startTransition] = useTransition();

  const allSelected = useMemo(() => items.length > 0 && selectedIds.length === items.length, [items.length, selectedIds.length]);

  function toggleAll() {
    setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  }

  function bulkDelete() {
    startTransition(async () => {
      const result = await bulkDeleteHistoryBugsAction(selectedIds);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Selected bugs deleted.");
      setSelectedIds([]);
      window.location.reload();
    });
  }

  function bulkAssign() {
    startTransition(async () => {
      const result = await bulkAssignHistoryBugsProjectAction(selectedIds, targetProjectId || null);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Selected bugs updated.");
      setSelectedIds([]);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          Select all ({items.length})
        </label>
        <p className="text-sm text-slate-600">Selected: {selectedIds.length}</p>
      </div>
      <div className="max-h-52 space-y-2 overflow-auto rounded-xl border border-slate-100 p-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-slate-50">
            <span className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} />
              {item.title}
            </span>
            <span className="text-xs text-slate-500">{item.severity}</span>
          </label>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Assign selected to project</label>
          <SelectField value={targetProjectId} onChange={(event) => setTargetProjectId(event.target.value)} options={projectOptions} />
        </div>
        <Button variant="outline" disabled={isPending || selectedIds.length === 0} onClick={bulkAssign}>
          {isPending ? "Applying..." : "Apply"}
        </Button>
        <Button variant="outline" disabled={isPending || selectedIds.length === 0} onClick={bulkDelete}>
          {isPending ? "Deleting..." : "Delete selected"}
        </Button>
      </div>
    </div>
  );
}