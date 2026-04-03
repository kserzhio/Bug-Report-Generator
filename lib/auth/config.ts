import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import GitHub from "next-auth/providers/github";
import GitLab from "next-auth/providers/gitlab";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

import { prisma } from "@/lib/prisma/client";
import { normalizeWorkspaceRole } from "@/src/server/workspace/roles";

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

async function ensureWorkspaceForUser(userId: string, userName?: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: true
    }
  });

  if (!user) {
    return;
  }

  if (user.memberships.length > 0) {
    if (!user.defaultWorkspaceId) {
      await prisma.user.update({
        where: { id: userId },
        data: { defaultWorkspaceId: user.memberships[0].workspaceId }
      });
    }
    return;
  }

  const firstName = (userName ?? user.name ?? "My").trim().split(" ")[0] || "My";
  const workspaceName = `${firstName}'s Workspace`;
  const workspaceSlug = await createUniqueWorkspaceSlug(workspaceName);

  await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug
      }
    });

    await tx.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "OWNER"
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: { defaultWorkspaceId: workspace.id }
    });

    await tx.subscription.create({
      data: {
        userId,
        workspaceId: workspace.id,
        plan: "FREE",
        status: "ACTIVE"
      }
    });
  });
}

const providers: NonNullable<NextAuthConfig["providers"]> = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
        include: {
          memberships: true
        }
      });

      if (!user?.passwordHash) {
        return null;
      }

      const isValid = await compare(credentials.password as string, user.passwordHash);

      if (!isValid) {
        return null;
      }

      const workspaceId = user.defaultWorkspaceId ?? user.memberships[0]?.workspaceId ?? null;
      const membership = user.memberships.find((item) => item.workspaceId === workspaceId) ?? user.memberships[0] ?? null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId,
        plan: user.plan,
        workspaceRole: membership ? normalizeWorkspaceRole(membership.role) : null
      };
    }
  })
];

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.unshift(
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  );
}

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  providers.unshift(
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}/v2.0`
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.unshift(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  );
}

if (process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET) {
  providers.unshift(
    GitLab({
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET
    })
  );
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/sign-in"
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) {
        return false;
      }

      await ensureWorkspaceForUser(user.id, user.name);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.workspaceId = user.workspaceId;
        token.plan = user.plan;
        token.workspaceRole = user.workspaceRole;
      }

      if (token.sub) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: {
            memberships: true
          }
        });

        if (currentUser) {
          const workspaceId = currentUser.defaultWorkspaceId ?? currentUser.memberships[0]?.workspaceId ?? null;
          const membership = currentUser.memberships.find((item) => item.workspaceId === workspaceId) ?? currentUser.memberships[0] ?? null;

          token.workspaceId = workspaceId;
          token.plan = currentUser.plan;
          token.workspaceRole = membership ? normalizeWorkspaceRole(membership.role) : null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.workspaceId = (token.workspaceId as string | null) ?? null;
        session.user.plan = (token.plan as string | null) ?? null;
        session.user.workspaceRole = (token.workspaceRole as string | null) ?? null;
      }

      return session;
    }
  }
};


