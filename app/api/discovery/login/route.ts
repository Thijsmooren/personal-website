import { NextResponse, type NextRequest } from "next/server";
import { createDiscoverySession, personFromName } from "@/lib/discovery-auth";

const attempts = new Map<string, number[]>();
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 60 * 60_000);
  recent.push(now); attempts.set(ip, recent);
  if (recent.length > 15) return new Response("Please try again later.", { status: 429 });
  let name: FormDataEntryValue | null;
  try { name = (await request.formData()).get("name"); } catch { name = null; }
  const person = typeof name === "string" ? personFromName(name) : null;
  const secret = process.env.DISCOVERY_SESSION_SECRET || process.env.CLASSIQ_PASSWORD;
  if (!person || !secret) return NextResponse.redirect(new URL("/discovery/frascati/unlock?error=1", request.url), 303);
  const response = NextResponse.redirect(new URL("/discovery/frascati", request.url), 303);
  response.cookies.set("frascati_session", await createDiscoverySession(person, secret), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/",
  });
  return response;
}
