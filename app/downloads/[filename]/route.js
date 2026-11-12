import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";

export const runtime = "nodejs";

const availableDownloads = new Set([
  "ARLO-OS-Setup.exe",
  "ARLO-OS-1.19.0-mac-universal.dmg"
]);

export async function GET(_request, { params }) {
  const { filename } = await params;
  if (!availableDownloads.has(filename)) {
    return new Response("Download not found.", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "downloads", filename);
  let fileInfo;
  try {
    fileInfo = await stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return new Response("The installer is not available on this server.", {
        status: 404
      });
    }
    throw error;
  }

  return new Response(Readable.toWeb(createReadStream(filePath)), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileInfo.size),
      "Cache-Control": "private, no-store"
    }
  });
}
