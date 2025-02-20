import { existsSync, readFileSync } from "fs";
import mime from "mime-types";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (!params.path)
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });

  const filePath = join(process.cwd(), "public", "attachments", ...params.path);

  if (!existsSync(filePath))
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  const file = readFileSync(filePath);
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  return new NextResponse(file, {
    headers: { "Content-Type": mimeType },
  });
}
