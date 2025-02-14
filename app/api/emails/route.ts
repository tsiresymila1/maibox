import { eventEmitter } from "@/lib/event";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const to = (formData.get("to") ?? "") as string;
    const from = (formData.get("from") ?? "") as string;
    const subject = (formData.get("subject") ?? "") as string;
    const text = (formData.get("text") ?? "") as string;
    const html = (formData.get("html") ?? "") as string;
    const raw = (formData.get("raw") ?? "") as string;
    const headers = (formData.get("headers") ?? "") as string;
    const files = (formData.getAll("attachments") ?? []) as File[];

    const email = await prisma.email.create({
      data: { to, from, subject, text, html, headers, raw },
    });

    const attachments = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(process.cwd(), "public/uploads", file.name);
        await writeFile(filePath, buffer);
        return await prisma.attachment.create({
          data: {
            fileName: file.name,
            fileType: file.type,
            fileUrl: `/uploads/${file.name}`,
            emailId: email.id,
          },
        });
      })
    );
    revalidatePath("/");
    eventEmitter.emit("message", email);
    return NextResponse.json({ email, attachments });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating email" },
      { status: 500 }
    );
  }
}
