import { createHash } from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { getAccessibilityNewsItemById } from "@/src/domain/services/accessibility-news-service";

function normalizeNickname(rawNickname: unknown) {
  const value = String(rawNickname ?? "").trim();
  return value.slice(0, 40);
}

function normalizeContent(rawContent: unknown) {
  const value = String(rawContent ?? "").trim();
  return value.slice(0, 2000);
}

function fallbackNicknameFromSession(input: { name?: string | null; email?: string | null }) {
  const byName = (input.name ?? "").trim();

  if (byName.length > 0) {
    return byName.slice(0, 40);
  }

  const byEmail = (input.email ?? "").split("@")[0]?.trim() ?? "";
  if (byEmail.length > 0) {
    return byEmail.slice(0, 40);
  }

  return "User";
}

function normalizeParentId(rawParentId: unknown) {
  const value = String(rawParentId ?? "").trim();
  return value || null;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

function hashIp(ip: string) {
  const salt = process.env.AUTH_SECRET ?? "bug-writer";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = String(searchParams.get("postId") ?? "").trim();

  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  const post = getAccessibilityNewsItemById(postId);
  if (!post || !post.detail) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  const comments = await prisma.newsComment.findMany({
    where: { postId },
    select: {
      id: true,
      parentId: true,
      nickname: true,
      content: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 100
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { postId?: unknown; parentId?: unknown; nickname?: unknown; content?: unknown; website?: unknown }
    | null;
  const postId = String(body?.postId ?? "").trim();
  const parentId = normalizeParentId(body?.parentId);
  const content = normalizeContent(body?.content);
  const honeypot = String(body?.website ?? "").trim();

  if (honeypot.length > 0) {
    return NextResponse.json({ accepted: true }, { status: 202 });
  }

  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  const post = getAccessibilityNewsItemById(postId);
  if (!post || !post.detail) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  if (parentId) {
    const parent = await prisma.newsComment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true }
    });

    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "Reply target is invalid." }, { status: 400 });
    }
  }

  if (content.length < 3) {
    return NextResponse.json({ error: "Comment must be at least 3 characters." }, { status: 400 });
  }

  const session = await auth();
  const clientIp = getClientIp(request);
  const clientIpHash = clientIp ? hashIp(clientIp) : null;
  const nicknameInput = normalizeNickname(body?.nickname);
  const nickname =
    nicknameInput ||
    (session?.user
      ? fallbackNicknameFromSession({ name: session.user.name, email: session.user.email })
      : "");

  if (nickname.length < 2) {
    return NextResponse.json({ error: "Nickname must be at least 2 characters." }, { status: 400 });
  }

  const windowStart = new Date(Date.now() - 1000 * 60 * 5);

  const rateLimitConditions: Array<{ userId?: string; ipHash?: string; nickname?: string }> = [];

  if (session?.user?.id) {
    rateLimitConditions.push({ userId: session.user.id });
  }

  if (clientIpHash) {
    rateLimitConditions.push({ ipHash: clientIpHash });
  }

  if (!session?.user?.id && !clientIpHash) {
    rateLimitConditions.push({ nickname });
  }

  const recentCount = await prisma.newsComment.count({
    where: {
      createdAt: { gte: windowStart },
      OR: rateLimitConditions
    }
  });

  if (recentCount >= 6) {
    return NextResponse.json(
      { error: "Too many comments in a short period. Please wait a few minutes." },
      { status: 429 }
    );
  }

  const created = await prisma.newsComment.create({
    data: {
      postId,
      parentId,
      userId: session?.user?.id ?? null,
      ipHash: clientIpHash,
      nickname,
      content
    },
    select: {
      id: true,
      parentId: true,
      nickname: true,
      content: true,
      createdAt: true
    }
  });

  return NextResponse.json({ comment: created }, { status: 201 });
}
