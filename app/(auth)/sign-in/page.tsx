import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Shield, Zap } from "lucide-react";

import { SignInForm } from "@/components/auth/sign-in-form";
import { safeAuth } from "@/lib/auth/safe-auth";

export const metadata: Metadata = {
  title: "Sign in | Bug Writer",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ invite?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/dashboard")
      ? params.next
      : "/dashboard";
  const session = await safeAuth();
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const microsoftEnabled = Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
  const githubEnabled = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const gitlabEnabled = Boolean(process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET);

  if (session?.user) {
    redirect(nextPath);
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <section className="hidden h-full rounded-3xl border border-white/10 bg-[#0F141B]/90 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              QA and Accessibility workflow
            </p>
            <h1 className="mb-4 text-4xl font-semibold leading-tight text-white">
              Sign in and keep shipping cleaner accessibility fixes.
            </h1>
            <p className="max-w-lg text-sm leading-7 text-zinc-400">
              Structured bug reports, WCAG mapping, reusable snippets, and team-ready export flow in one place.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {[
              {
                icon: Shield,
                title: "WCAG-ready reports",
                text: "Every report keeps criterion context and expected behavior clear for dev teams."
              },
              {
                icon: Zap,
                title: "Faster QA output",
                text: "Templates and history save hours when triaging recurring accessibility issues."
              },
              {
                icon: CheckCircle2,
                title: "Production workflow",
                text: "Export to your tracker and keep progress visible across projects and teammates."
              }
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon className="h-4 w-4 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs leading-5 text-zinc-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex h-full w-full max-w-md justify-self-center lg:max-w-none">
          <SignInForm
            inviteToken={params.invite}
            next={nextPath}
            authErrorCode={params.error}
            googleEnabled={googleEnabled}
            microsoftEnabled={microsoftEnabled}
            githubEnabled={githubEnabled}
            gitlabEnabled={gitlabEnabled}
          />
        </div>
      </div>
    </div>
  );
}

