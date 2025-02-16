import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("sessionToken");
  const email = req.cookies.get("email");
  const password = req.cookies.get("password");

  const validEmail = process.env.ADMIN_EMAIL || "admin@mail.com";
  const validPassword = process.env.ADMIN_PASSWORD || "password";

  const isValidEmail = email?.value === validEmail;
  const isValidPassword = password?.value === validPassword;

  if (!session || !isValidEmail || !isValidPassword) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|login|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
