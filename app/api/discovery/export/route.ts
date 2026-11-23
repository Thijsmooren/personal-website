import { type NextRequest } from "next/server";
import { hasDiscoveryAdminSession } from "@/lib/discovery-admin";
import { listDiscoveryResponses, responsesToCsv } from "@/lib/discovery-storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!await hasDiscoveryAdminSession(request.cookies.get("frascati_admin_session")?.value)) return new Response("Unauthorized", { status: 401 });
  try {
    const csv = responsesToCsv(await listDiscoveryResponses());
    return new Response(`\uFEFF${csv}`, { headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=frascati-responses.csv",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch { return new Response("Storage unavailable", { status: 503 }); }
}
