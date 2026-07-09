import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 request proxy (formerly `middleware`). A fast, coarse auth gate:
 * redirects unauthenticated users away from app routes and authenticated users
 * away from the auth pages. This only checks for a session cookie — real
 * validation and RBAC happen in Server Components (`auth()`) and server actions.
 * Runs on the Node runtime (proxy has no edge runtime in Next 16).
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/tickets",
  "/contacts",
  "/analytics",
  "/settings",
  "/onboarding",
];
const AUTH_PAGES = ["/login", "/register"];

function hasSessionCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get("authjs.session-token")?.value ??
      req.cookies.get("__Secure-authjs.session-token")?.value,
  );
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = hasSessionCookie(req);
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !authed) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (authed && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except API routes, static assets, and files with extensions.
    "/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|webmanifest)$).*)",
  ],
};
