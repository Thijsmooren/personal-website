import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const response = NextResponse.redirect(new URL("/discovery/frascati/responses/unlock", request.url), 303);
  response.cookies.set("frascati_admin_session", "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" });
  return response;
}
