"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validEmail = process.env.ADMIN_EMAIL || "admin@mail.com";
  const validPassword = process.env.ADMIN_PASSWORD || "password";

  if (email !== validEmail || password !== validPassword) {
    return { error: "Invalid email or password" };
  }

  cookies().set("email", email, { httpOnly: true, secure: true, path: "/" });
  cookies().set("password", validPassword, {
    httpOnly: true,
    secure: true,
    path: "/",
  });
  cookies().set("sessionToken", "random-session-token", {
    httpOnly: true,
    secure: true,
    path: "/",
  });
  revalidatePath("/");
  return { success: true };
}

export async function logOut() {
  cookies().delete("email");
  cookies().delete("password");
  cookies().delete("sessionToken");
  revalidatePath("/");
  return { success: true };
}
