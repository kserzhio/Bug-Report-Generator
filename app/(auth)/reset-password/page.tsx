import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password | Bug Writer",
  robots: {
    index: false,
    follow: false
  }
};

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="w-full max-w-md">
      <ResetPasswordForm token={params.token ?? ""} />
    </div>
  );
}

