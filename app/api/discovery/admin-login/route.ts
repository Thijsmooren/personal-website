import { NextResponse, type NextRequest } from "next/server";
import { adminPassword, createDiscoveryAdminSession } from "@/lib/discovery-admin";

const attempts = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 60 * 60_000);
  recent.push(now); attempts.set(ip, recent);
  if (recent.length > 10) return new Response("Please try again later.", { status: 429 });
  const submitted = (await request.formData()).get("password");
  const password = adminPassword();
  if (!password || typeof submitted !== "string" || submitted !== password) {
    return NextResponse.redirect(new URL("/discovery/frascati/responses/unlock?error=1", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/discovery/frascati/responses", request.url), 303);
  response.cookies.set("frascati_admin_session", await createDiscoveryAdminSession(password), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/",
  });
  return response;
}
