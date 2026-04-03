import Link from "next/link";

import { auth } from "@/lib/auth";
import { acceptWorkspaceInviteForCurrentUserAction } from "@/src/server/actions/auth-actions";

export default async function AcceptInvitePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim();
  const session = await auth();

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-950">Invalid invite link</h1>
          <p className="mt-2 text-sm text-slate-600">The invite token is missing.</p>
          <Link href="/sign-in" className="mt-4 inline-block text-sm font-semibold text-primary">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-950">You are invited to a workspace</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in or create an account using the invited email to join.</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link href={`/sign-in?invite=${encodeURIComponent(token)}`} className="text-sm font-semibold text-primary">
              Sign in
            </Link>
            <Link href={`/sign-up?invite=${encodeURIComponent(token)}`} className="text-sm font-semibold text-primary">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const result = await acceptWorkspaceInviteForCurrentUserAction(token);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-semibold text-slate-950">Workspace invite</h1>
        <p className={`mt-2 text-sm ${result.error ? "text-red-600" : "text-slate-600"}`}>
          {result.error ?? result.success}
        </p>
        <Link href="/dashboard/settings" className="mt-4 inline-block text-sm font-semibold text-primary">
          Open dashboard settings
        </Link>
      </div>
    </div>
  );
}