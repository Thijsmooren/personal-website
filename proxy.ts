import { NextResponse, type NextRequest } from "next/server";
import { hasValidClassiqSession } from "@/lib/classiq-auth";
export async function proxy(request: NextRequest) { if (request.nextUrl.pathname === "/classiq/unlock") return NextResponse.next(); const valid = await hasValidClassiqSession(request.cookies.get("classiq_session")?.value, process.env.CLASSIQ_PASSWORD); if (valid) return NextResponse.next(); const unlockUrl = new URL("/classiq/unlock", request.url); unlockUrl.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(unlockUrl); }
export const config = { matcher: ["/classiq/:path*"] };
