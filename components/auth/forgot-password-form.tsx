"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction, type PasswordResetState } from "@/src/server/actions/auth-actions";

const initialState: PasswordResetState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);
  const locale = useLocale();
  const c =
    locale === "uk"
      ? {
          title: "Відновлення пароля",
          subtitle: "Введіть email, і ми надішлемо посилання для скидання пароля.",
          email: "Email",
          send: "Надіслати посилання",
          sending: "Надсилання...",
          back: "Повернутися до входу",
          oneTimeLink: "Разове посилання для скидання"
        }
      : {
          title: "Reset password",
          subtitle: "Enter your email and we will send a password reset link.",
          email: "Email",
          send: "Send reset link",
          sending: "Sending...",
          back: "Back to sign in",
          oneTimeLink: "One-time reset link"
        };

  return (
    <Card className="w-full max-w-md border-white/10 bg-[#151A21]/95 text-white shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">{c.title}</CardTitle>
        <p className="text-sm text-zinc-400">{c.subtitle}</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">{c.email}</Label>
            <Input id="email" name="email" type="email" placeholder="qa@company.com" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
          {state.resetLink ? (
            <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-xs text-amber-100">
              <p className="font-semibold">{c.oneTimeLink}</p>
              <a href={state.resetLink} className="break-all underline">
                {state.resetLink}
              </a>
            </div>
          ) : null}
          <Button className="w-full bg-gradient-to-r from-[#E41F07] to-[#B91804] text-white hover:opacity-95" disabled={pending}>
            {pending ? c.sending : c.send}
          </Button>
          <p className="text-center text-sm text-zinc-400">
            <Link href="/sign-in" className="font-medium text-[#A78BFA] hover:text-[#C4B5FD]">
              {c.back}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
