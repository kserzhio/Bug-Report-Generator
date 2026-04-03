import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { safeAuth } from "@/lib/auth/safe-auth";

export const metadata: Metadata = {
  title: "Create account | Bug Writer",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ invite?: string; next?: string }>;
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
    <div className="w-full max-w-md">
      <SignUpForm
        inviteToken={params.invite}
        next={nextPath}
        googleEnabled={googleEnabled}
        microsoftEnabled={microsoftEnabled}
        githubEnabled={githubEnabled}
        gitlabEnabled={gitlabEnabled}
      />
    </div>
  );
}


