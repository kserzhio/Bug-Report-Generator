"use server";

import { randomBytes } from "crypto";

import { Prisma } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { AuthError } from "next-auth";
import nodemailer from "nodemailer";

import { auth, signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { normalizeWorkspaceRole } from "@/src/server/workspace/roles";

export type AuthFormState = {
  error?: string;
};

export type PasswordResetState = {
  error?: string;
  success?: string;
  resetLink?: string;
};

function slugifyWorkspaceName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

async function createUniqueWorkspaceSlug(baseName: string) {
  const baseSlug = slugifyWorkspaceName(baseName) || "workspace";

  for (let index = 0; index < 10; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

async function getInviteByToken(inviteToken: string) {
  if (!inviteToken) {
    return null;
  }

  return prisma.workspaceInvite.findUnique({
    where: { token: inviteToken },
    include: {
      workspace: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

function isInviteActive(invite: Awaited<ReturnType<typeof getInviteByToken>>) {
  if (!invite) {
    return false;
  }

  if (invite.acceptedAt) {
    return false;
  }

  return invite.expiresAt.getTime() > Date.now();
}

async function applyInviteToExistingUser(userId: string, inviteToken: string) {
  const invite = await getInviteByToken(inviteToken);

  if (!invite || !isInviteActive(invite)) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const existingMember = await tx.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: invite.workspaceId
      },
      select: { id: true }
    });

    if (!existingMember) {
      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: invite.workspaceId,
          role: normalizeWorkspaceRole(invite.role)
        }
      });
    }

    await tx.workspaceInvite.update({
      where: { id: invite.id },
      data: {
        acceptedByUserId: userId,
        acceptedAt: new Date()
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        defaultWorkspaceId: invite.workspaceId
      }
    });

    const existingSubscription = await tx.subscription.findFirst({
      where: {
        userId,
        workspaceId: invite.workspaceId
      },
      select: { id: true }
    });

    if (!existingSubscription) {
      await tx.subscription.create({
        data: {
          userId,
          workspaceId: invite.workspaceId,
          plan: "FREE",
          status: "ACTIVE"
        }
      });
    }
  });
}

function resolveSafeRedirectPath(rawValue: string | null | undefined) {
  const value = (rawValue ?? "").trim();

  if (!value) {
    return "/dashboard";
  }

  if (!value.startsWith("/dashboard")) {
    return "/dashboard";
  }

  return value;
}

function buildPasswordResetLink(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const path = `/reset-password?token=${encodeURIComponent(token)}`;

  return appUrl ? `${appUrl}${path}` : path;
}

async function sendPasswordResetEmail(email: string, resetLink: string) {
  const emailServer = process.env.EMAIL_SERVER?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim();

  if (!emailServer || !emailFrom) {
    return false;
  }

  const transport = nodemailer.createTransport(emailServer);
  await transport.sendMail({
    from: emailFrom,
    to: email,
    subject: "Reset your Bug Writer password",
    text: `Use this link to reset your password: ${resetLink}\n\nThis link expires in 60 minutes.`,
    html: `<p>Use this link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 60 minutes.</p>`
  });

  return true;
}

export async function acceptWorkspaceInviteForCurrentUserAction(inviteToken: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Sign in first." };
  }

  const invite = await getInviteByToken(inviteToken);

  if (!invite || !isInviteActive(invite)) {
    return { error: "Invite is invalid or expired." };
  }

  if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return { error: "Invite email does not match the signed in account." };
  }

  await applyInviteToExistingUser(session.user.id, inviteToken);

  return { success: `Joined ${invite.workspace.name}.` };
}

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const inviteToken = String(formData.get("inviteToken") ?? "").trim();
  const next = resolveSafeRedirectPath(String(formData.get("next") ?? ""));

  if (name.length < 2) {
    return { error: "Enter your full name." };
  }

  if (!email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const passwordHash = await hash(password, 12);
  const invite = inviteToken ? await getInviteByToken(inviteToken) : null;

  if (inviteToken) {
    if (!invite || !isInviteActive(invite)) {
      return { error: "Invite is invalid or expired." };
    }

    if (invite.email.toLowerCase() !== email) {
      return { error: "This invite was created for a different email." };
    }
  }

  const workspaceName = `${name.split(" ")[0]}'s Workspace`;
  const workspaceSlug = await createUniqueWorkspaceSlug(workspaceName);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          plan: "free",
          defaultWorkspaceId: invite ? invite.workspaceId : null
        }
      });

      if (invite) {
        await tx.workspaceMember.create({
          data: {
            userId: user.id,
            workspaceId: invite.workspaceId,
            role: normalizeWorkspaceRole(invite.role)
          }
        });

        await tx.workspaceInvite.update({
          where: { id: invite.id },
          data: {
            acceptedByUserId: user.id,
            acceptedAt: new Date()
          }
        });

        await tx.subscription.create({
          data: {
            userId: user.id,
            workspaceId: invite.workspaceId,
            plan: "FREE",
            status: "ACTIVE"
          }
        });

        return;
      }

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: workspaceSlug
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: { defaultWorkspaceId: workspace.id }
      });

      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "OWNER"
        }
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          plan: "FREE",
          status: "ACTIVE"
        }
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "An account with this email already exists." };
    }

    return { error: "Could not create your account right now." };
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: next
  });

  return {};
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const inviteToken = String(formData.get("inviteToken") ?? "").trim();
  const next = resolveSafeRedirectPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  if (inviteToken) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (user?.passwordHash) {
      const valid = await compare(password, user.passwordHash);

      if (valid) {
        const invite = await getInviteByToken(inviteToken);

        if (invite && isInviteActive(invite) && invite.email.toLowerCase() === email) {
          await applyInviteToExistingUser(user.id, inviteToken);
        }
      }
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: next
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }

    throw error;
  }

  return {};
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = resolveSafeRedirectPath(String(formData.get("next") ?? ""));

  await signIn("google", {
    redirectTo: next
  });
}

export async function signInWithMicrosoftAction(formData: FormData) {
  const next = resolveSafeRedirectPath(String(formData.get("next") ?? ""));

  await signIn("microsoft-entra-id", {
    redirectTo: next
  });
}

export async function signInWithGithubAction(formData: FormData) {
  const next = resolveSafeRedirectPath(String(formData.get("next") ?? ""));

  await signIn("github", {
    redirectTo: next
  });
}

export async function signInWithGitLabAction(formData: FormData) {
  const next = resolveSafeRedirectPath(String(formData.get("next") ?? ""));

  await signIn("gitlab", {
    redirectTo: next
  });
}

export async function requestPasswordResetAction(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  });

  if (!user) {
    return {
      success: "If this email exists, a reset link has been sent."
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  const resetLink = buildPasswordResetLink(token);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        identifier: user.email
      }
    });

    await tx.passwordResetToken.create({
      data: {
        identifier: user.email,
        token,
        expiresAt
      }
    });
  });

  try {
    const emailSent = await sendPasswordResetEmail(user.email, resetLink);

    return {
      success: emailSent
        ? "Reset link sent. Check your inbox."
        : "Email is not configured. Use the one-time reset link below.",
      ...(emailSent ? {} : { resetLink })
    };
  } catch {
    return {
      success: "Email provider is unavailable. Use the one-time reset link below.",
      resetLink
    };
  }
}

export async function resetPasswordAction(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "Invalid reset token." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  });

  if (!resetToken || resetToken.expiresAt.getTime() <= Date.now()) {
    return { error: "Reset token is invalid or expired." };
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.identifier },
    select: { id: true }
  });

  if (!user) {
    return { error: "Reset token is invalid or expired." };
  }

  const passwordHash = await hash(password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        identifier: resetToken.identifier
      }
    });
  });

  return { success: "Password updated. You can sign in now." };
}
