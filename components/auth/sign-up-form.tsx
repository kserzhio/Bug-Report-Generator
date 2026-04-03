"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInWithGitLabAction,
  signInWithGithubAction,
  signInWithGoogleAction,
  signInWithMicrosoftAction,
  signUpAction,
  type AuthFormState
} from "@/src/server/actions/auth-actions";

const initialState: AuthFormState = {};

export function SignUpForm({
  inviteToken,
  next,
  googleEnabled,
  microsoftEnabled,
  githubEnabled,
  gitlabEnabled
}: {
  inviteToken?: string;
  next?: string;
  googleEnabled?: boolean;
  microsoftEnabled?: boolean;
  githubEnabled?: boolean;
  gitlabEnabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const t = useI18n();

  return (
    <Card className="w-full max-w-md border-white/10 bg-[#151A21]/95 text-white shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">{t.auth.createAccountTitle}</CardTitle>
        <p className="text-sm text-zinc-400">{t.auth.createAccountSubtitle}</p>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="name" className="text-zinc-300">{t.auth.fullName}</Label>
            <Input id="name" name="name" placeholder="Alex QA" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">{t.auth.email}</Label>
            <Input id="email" name="email" type="email" placeholder="qa@company.com" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">{t.auth.password}</Label>
            <Input id="password" name="password" type="password" placeholder="Create a password" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          <Button className="w-full bg-gradient-to-r from-[#E41F07] to-[#B91804] text-white hover:opacity-95" disabled={pending}>
            {pending ? t.auth.creatingAccount : t.auth.createAccount}
          </Button>
          <p className="text-sm text-zinc-400">
            {t.auth.alreadyAccount}{" "}
            <Link
              href={
                inviteToken
                  ? `/sign-in?invite=${encodeURIComponent(inviteToken)}${next ? `&next=${encodeURIComponent(next)}` : ""}`
                  : next
                    ? `/sign-in?next=${encodeURIComponent(next)}`
                    : "/sign-in"
              }
              className="text-[#A78BFA] hover:text-[#C4B5FD]"
            >
              {t.common.signIn}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
