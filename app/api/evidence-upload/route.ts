import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 6;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

function sanitizeBaseName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function getSafeExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();

  if (!ext || ext.length > 8 || /[^a-z0-9.]/i.test(ext)) {
    return ".bin";
  }

  return ext;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { defaultWorkspaceId: true }
  });

  if (!user?.defaultWorkspaceId) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 400 });
  }

  const body = await request.formData();
  const rawFiles = body.getAll("files");
  const files = rawFiles.filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_FILES_PER_REQUEST} files at once.` },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence", user.defaultWorkspaceId);
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type is not allowed: ${file.type || "unknown"}.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File ${file.name} is too large. Max size is 15MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeBaseName = sanitizeBaseName(file.name) || "evidence";
    const extension = getSafeExtension(file.name);
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
    const storedFileName = `${safeBaseName}-${uniqueSuffix}${extension}`;
    const filePath = path.join(uploadDir, storedFileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/evidence/${user.defaultWorkspaceId}/${storedFileName}`;

    await prisma.evidenceAsset.upsert({
      where: {
        workspaceId_userId_url: {
          workspaceId: user.defaultWorkspaceId,
          userId: session.user.id,
          url
        }
      },
      update: {
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size
      },
      create: {
        workspaceId: user.defaultWorkspaceId,
        userId: session.user.id,
        url,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size
      }
    });

    urls.push(url);
  }

  return NextResponse.json({ urls }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { defaultWorkspaceId: true }
  });

  if (!user?.defaultWorkspaceId) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 400 });
  }

  const payload = (await request.json().catch(() => null)) as { url?: string } | null;
  const rawUrl = payload?.url?.trim();

  if (!rawUrl) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  let pathname = rawUrl;

  try {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      pathname = new URL(rawUrl).pathname;
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  const workspacePrefix = `/uploads/evidence/${user.defaultWorkspaceId}/`;

  if (!pathname.startsWith(workspacePrefix)) {
    return NextResponse.json({ error: "Unsupported evidence URL." }, { status: 400 });
  }

  const fileName = path.basename(pathname);

  if (!fileName || fileName === "." || fileName === "..") {
    return NextResponse.json({ error: "Invalid evidence URL." }, { status: 400 });
  }

  const asset = await prisma.evidenceAsset.findUnique({
    where: {
      workspaceId_userId_url: {
        workspaceId: user.defaultWorkspaceId,
        userId: session.user.id,
        url: pathname
      }
    },
    select: {
      generatedBugId: true,
      reusableBugId: true
    }
  });

  if (!asset) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  if (asset.generatedBugId || asset.reusableBugId) {
    return NextResponse.json(
      { error: "Attachment is already linked to a saved report." },
      { status: 409 }
    );
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "evidence",
    user.defaultWorkspaceId,
    fileName
  );

  try {
    await unlink(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;

    if (code !== "ENOENT") {
      throw error;
    }
  }

  await prisma.evidenceAsset.delete({
    where: {
      workspaceId_userId_url: {
        workspaceId: user.defaultWorkspaceId,
        userId: session.user.id,
        url: pathname
      }
    }
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
