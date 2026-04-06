"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useI18n, useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInAction,
  signInWithGitLabAction,
  signInWithGithubAction,
  signInWithGoogleAction,
  signInWithMicrosoftAction,
  type AuthFormState
} from "@/src/server/actions/auth-actions";

const initialState: AuthFormState = {};

function resolveAuthErrorMessage(code?: string) {
  if (!code) {
    return null;
  }

  if (code === "OAuthAccountNotLinked") {
    return "This email already exists with password login. Sign in with email/password once, then try Google again to link the account.";
  }

  if (code === "AccessDenied") {
    return "Access was denied by the provider. Please try again or use email/password.";
  }

  return "Could not sign in with this provider. Please try again or use email/password.";
}

export function SignInForm({
  inviteToken,
  next,
  authErrorCode,
  googleEnabled,
  microsoftEnabled,
  githubEnabled,
  gitlabEnabled
}: {
  inviteToken?: string;
  next?: string;
  authErrorCode?: string;
  googleEnabled?: boolean;
  microsoftEnabled?: boolean;
  githubEnabled?: boolean;
  gitlabEnabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const t = useI18n();
  const locale = useLocale();
  const oauthErrorMessage = resolveAuthErrorMessage(authErrorCode);
  const signUpHref = inviteToken
    ? `/sign-up?invite=${encodeURIComponent(inviteToken)}${next ? `&next=${encodeURIComponent(next)}` : ""}`
    : next
      ? `/sign-up?next=${encodeURIComponent(next)}`
      : "/sign-up";

  return (
    <Card className="h-full w-full max-w-md border-white/10 bg-[#151A21]/95 text-white shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">{t.auth.signInTitle}</CardTitle>
        <p className="text-sm text-zinc-400">{t.auth.signInSubtitle}</p>
      </CardHeader>
      <CardContent>
        {oauthErrorMessage ? (
          <div className="mb-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <p>{oauthErrorMessage}</p>
            <p className="mt-2">
              <Link href="/forgot-password" className="font-semibold text-amber-200 underline underline-offset-2">
                Forgot your password?
              </Link>
            </p>
          </div>
        ) : null}

        {googleEnabled || microsoftEnabled || githubEnabled || gitlabEnabled ? (
          <>
            <div className="mb-4 space-y-2">
              {googleEnabled ? (
                <form action={signInWithGoogleAction}>
                  {next ? <input type="hidden" name="next" value={next} /> : null}
                  <Button type="submit" variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                    {t.auth.continueWithGoogle}
                  </Button>
                </form>
              ) : null}
              {microsoftEnabled ? (
                <form action={signInWithMicrosoftAction}>
                  {next ? <input type="hidden" name="next" value={next} /> : null}
                  <Button type="submit" variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                    {t.auth.continueWithMicrosoft}
                  </Button>
                </form>
              ) : null}
              {githubEnabled ? (
                <form action={signInWithGithubAction}>
                  {next ? <input type="hidden" name="next" value={next} /> : null}
                  <Button type="submit" variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                    {t.auth.continueWithGithub}
                  </Button>
                </form>
              ) : null}
              {gitlabEnabled ? (
                <form action={signInWithGitLabAction}>
                  {next ? <input type="hidden" name="next" value={next} /> : null}
                  <Button type="submit" variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                    {t.auth.continueWithGitLab}
                  </Button>
                </form>
              ) : null}
            </div>
            <div className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">{t.auth.or}</div>
          </>
        ) : null}
        <form action={formAction} className="space-y-4">
          {inviteToken ? <input type="hidden" name="inviteToken" value={inviteToken} /> : null}
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">{t.auth.email}</Label>
            <Input id="email" name="email" type="email" placeholder="qa@company.com" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">{t.auth.password}</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-[#A78BFA] hover:text-[#C4B5FD]">
              Forgot password?
            </Link>
          </div>
          {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          <Button className="w-full bg-gradient-to-r from-[#E41F07] to-[#B91804] text-white hover:opacity-95" disabled={pending}>
            {pending ? t.auth.signingIn : t.auth.continue}
          </Button>
          <p className="text-center text-sm text-zinc-400">
            {locale === "uk" ? "Ще не маєте акаунта?" : "Don\'t have an account?"}{" "}
            <Link href={signUpHref} className="font-medium text-[#A78BFA] hover:text-[#C4B5FD]">
              {t.auth.createAccount}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
