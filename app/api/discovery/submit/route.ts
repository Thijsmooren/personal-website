import { NextResponse, type NextRequest } from "next/server";
import { readDiscoverySession } from "@/lib/discovery-auth";
import { discovery, exportAnswers, validateAnswers } from "@/lib/discovery";

export const runtime = "nodejs";
const attempts = new Map<string, number[]>();
const accepted = new Set<string>();
const pending = new Map<string, Promise<boolean>>();
const json = (data: object, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32_000) throw new Error("Too large");
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin) return json({ error: "Origin rejected." }, 403);
  const person = await readDiscoverySession(request.cookies.get("frascati_session")?.value, process.env.DISCOVERY_SESSION_SECRET || process.env.CLASSIQ_PASSWORD);
  if (!person) return json({ error: "Please reopen your invitation." }, 401);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 60 * 60_000);
  recent.push(now); attempts.set(ip, recent);
  if (recent.length > 5) return json({ error: "Please try again later." }, 429);
  let body: unknown;
  try { body = await readBody(request); } catch { return json({ error: "Invalid or oversized request." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid request." }, 400);
  const data = body as Record<string, unknown>;
  if (data.website) return json({ error: "Submission rejected." }, 400);
  if (typeof data.id !== "string" || !/^[0-9a-f-]{36}$/.test(data.id) || !validateAnswers(data.answers, person)) return json({ error: "Please review your answers." }, 400);
  const id = data.id;
  if (accepted.has(id)) return json({ ok: true, id });
  if (pending.has(id)) {
    const success = await pending.get(id);
    return success ? json({ ok: true, id }) : json({ error: "Saving failed. Please try again." }, 502);
  }
  const formId = process.env.FORMSPREE_FORM_ID;
  if (!formId || !/^[A-Za-z0-9]{6,32}$/.test(formId)) return json({ error: "Sending is not configured yet. Please download or copy your answers." }, 503);
  const date = typeof data.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.date) && Math.abs(Date.parse(data.date) - Date.now()) < 2 * 86_400_000
    ? data.date : new Date().toISOString().slice(0, 10);
  const text = exportAnswers(data.answers, person, date);
  const task = (async () => {
    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: person, client: discovery.client, submitted_at: date, message: text }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) return false;
      accepted.add(id);
      return true;
    } catch { return false; }
    finally { pending.delete(id); }
  })();
  pending.set(id, task);
  const success = await task;
  return success ? json({ ok: true, id }) : json({ error: "Saving failed. Please try again." }, 502);
}
