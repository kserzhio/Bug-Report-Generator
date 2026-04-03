import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      workspaceId?: string | null;
      plan?: string | null;
      workspaceRole?: string | null;
    };
  }

  interface User {
    workspaceId?: string | null;
    plan?: string | null;
    workspaceRole?: string | null;
  }
}