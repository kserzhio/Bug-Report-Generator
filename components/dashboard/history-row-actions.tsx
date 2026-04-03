"use client";

import Link from "next/link";
import { CheckCircle2, Copy, Download, ExternalLink, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { notifyError, notifySuccess } from "@/lib/ui/toast-policy";
import { bulkDeleteHistoryBugsAction } from "@/src/server/actions/dashboard-actions";

export function HistoryRowActions({
  bugId,
  openHref,
  duplicateHref
}: {
  bugId: string;
  openHref: string;
  duplicateHref: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  function copyId() {
    void navigator.clipboard.writeText(bugId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function deleteOne() {
    startDeleting(async () => {
      const result = await bulkDeleteHistoryBugsAction([bugId]);

      if (result.error) {
        notifyError(result.error);
        return;
      }

      notifySuccess(result.success ?? "Bug deleted.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={copyId}
        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-white/10"
        title="Copy id"
      >
        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
      </button>

      <Link
        href={duplicateHref}
        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-white/10"
        title="Duplicate"
      >
        <Download className="h-3.5 w-3.5 text-zinc-400" />
      </Link>

      <Link
        href={openHref}
        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-white/10"
        title="Open"
      >
        <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
      </Link>

      <button
        type="button"
        onClick={deleteOne}
        disabled={isDeleting}
        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-red-500/10"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5 text-zinc-500 transition-colors hover:text-red-400" />
      </button>
    </div>
  );
}
