"use server";
import { prisma } from "@/lib/prisma";
import { unlinkSync } from "fs";
import { revalidatePath } from "next/cache";
import path from "path";

export async function markEmailAsRead(emailId: string) {
  if (!emailId) return { error: "Email ID is required" };
  try {
    await prisma.email.update({
      where: { id: emailId },
      data: { read: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating email:", error);
    return { error: "Error marking email as read" };
  }
}

export async function markAllAsRead() {
  try {
    await prisma.email.updateMany({
      where: {
        read: false,
      },
      data: { read: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating email:", error);
    return { error: "Error marking email as read" };
  }
}

export async function getEmails() {
  return await prisma.email.findMany({
    orderBy: { date: "desc" },
    include: { attachments: true },
  });
}

export async function deleteAll() {
  const attachments = await prisma.attachment.findMany();
  for (const att of attachments) {
    try {
      unlinkSync(path.join(process.cwd(), "public", `${att.fileUrl}`));
    } catch (_) {}
  }
  await prisma.email.deleteMany();
  revalidatePath("/");
}
