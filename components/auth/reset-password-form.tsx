"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type PasswordResetState } from "@/src/server/actions/auth-actions";

const initialState: PasswordResetState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const locale = useLocale();
  const c =
    locale === "uk"
      ? {
          title: "Новий пароль",
          subtitle: "Введіть новий пароль для вашого акаунта.",
          password: "Новий пароль",
          confirmPassword: "Підтвердження пароля",
          submit: "Оновити пароль",
          submitting: "Оновлення...",
          successLink: "Перейти до входу",
          invalidToken: "Невалідний токен скидання. Запросіть нове посилання."
        }
      : {
          title: "Set new password",
          subtitle: "Enter a new password for your account.",
          password: "New password",
          confirmPassword: "Confirm password",
          submit: "Update password",
          submitting: "Updating...",
          successLink: "Go to sign in",
          invalidToken: "Invalid reset token. Request a new reset link."
        };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-white/10 bg-[#151A21]/95 text-white shadow-2xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">{c.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-300">{c.invalidToken}</p>
          <Link href="/forgot-password" className="text-sm font-medium text-[#A78BFA] hover:text-[#C4B5FD]">
            Forgot password
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-[#151A21]/95 text-white shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">{c.title}</CardTitle>
        <p className="text-sm text-zinc-400">{c.subtitle}</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">{c.password}</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-300">{c.confirmPassword}</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500" />
          </div>
          {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-emerald-300">
              {state.success}{" "}
              <Link href="/sign-in" className="font-medium text-[#A78BFA] hover:text-[#C4B5FD]">
                {c.successLink}
              </Link>
            </p>
          ) : null}
          <Button className="w-full bg-gradient-to-r from-[#E41F07] to-[#B91804] text-white hover:opacity-95" disabled={pending}>
            {pending ? c.submitting : c.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
