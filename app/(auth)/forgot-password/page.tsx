import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { safeAuth } from "@/lib/auth/safe-auth";

export const metadata: Metadata = {
  title: "Forgot password | Bug Writer",
  robots: {
    index: false,
    follow: false
  }
};

export default async function ForgotPasswordPage() {
  const session = await safeAuth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-md">
      <ForgotPasswordForm />
    </div>
  );
}


