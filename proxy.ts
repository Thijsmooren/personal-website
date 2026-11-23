import { NextResponse, type NextRequest } from "next/server";
import { hasValidClassiqSession } from "@/lib/classiq-auth";
import { readDiscoverySession } from "@/lib/discovery-auth";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/discovery/frascati")) {
    if (request.nextUrl.pathname === "/discovery/frascati/unlock") return NextResponse.next();
    const person = await readDiscoverySession(request.cookies.get("frascati_session")?.value, process.env.DISCOVERY_SESSION_SECRET);
    return person ? NextResponse.next() : NextResponse.redirect(new URL("/discovery/frascati/unlock", request.url));
  }
  if (request.nextUrl.pathname === "/classiq/unlock") return NextResponse.next();
  const valid = await hasValidClassiqSession(request.cookies.get("classiq_session")?.value, process.env.CLASSIQ_PASSWORD);
  if (valid) return NextResponse.next();
  const unlockUrl = new URL("/classiq/unlock", request.url);
  unlockUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(unlockUrl);
}
export const config = { matcher: ["/classiq/:path*", "/classiq-presentation/:path*", "/discovery/frascati/:path*"] };
