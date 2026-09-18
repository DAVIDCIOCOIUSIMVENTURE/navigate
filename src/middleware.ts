import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Paths that skip the password gate. `/preview` is the public read-only view
 * of a project: it is meant to be opened by people who have no account and no
 * licence, such as a teacher marking the work, so it must never be redirected
 * to the login page.
 */
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/preview"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get("site-auth")

  if (!authCookie || authCookie.value !== "1") {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
