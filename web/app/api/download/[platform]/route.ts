import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // large file streaming

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;

  if (platform !== "mac" && platform !== "win") {
    return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  // Read version.json from the filesystem (avoids self-referencing HTTP call)
  let blobUrl: string;
  try {
    const raw = readFileSync(
      join(process.cwd(), "public", "version.json"),
      "utf-8"
    );
    const data = JSON.parse(raw);
    blobUrl = platform === "mac" ? data.mac_url : data.win_url;
  } catch {
    return NextResponse.json({ error: "version.json unreadable." }, { status: 500 });
  }

  if (!blobUrl || blobUrl.includes("PLACEHOLDER")) {
    return NextResponse.json(
      { error: "Download not available yet. Check back soon." },
      { status: 503 }
    );
  }

  const filename = platform === "mac" ? "FilePress.dmg" : "FilePress.exe";

  const blob = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!blob.ok) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${filename}"`,
  });
  const contentLength = blob.headers.get("Content-Length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(blob.body, { headers });
}
