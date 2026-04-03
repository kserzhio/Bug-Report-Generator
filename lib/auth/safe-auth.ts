import { auth } from "@/lib/auth";

export async function safeAuth() {
  try {
    return await auth();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.includes("JWTSessionError")) {
      return null;
    }

    throw error;
  }
}
