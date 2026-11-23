import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createDiscoverySession } from "@/lib/discovery-auth";
import { emptyAnswers, exportAnswers } from "@/lib/discovery";
import { POST } from "./route";

const blob = vi.hoisted(() => ({ put: vi.fn(), list: vi.fn(), get: vi.fn() }));
vi.mock("@vercel/blob", () => blob);

const base = "https://matthiasndesario.com";
const secret = "test-only-session-secret";
afterEach(() => { vi.unstubAllGlobals(); });

function request(body: object, cookie: string, origin = base) {
  return new NextRequest(`${base}/api/discovery/submit`, {
    method: "POST", headers: { origin, cookie: `frascati_session=${cookie}`, "content-type": "application/json", "x-forwarded-for": "test-client" },
    body: JSON.stringify(body),
  });
}

describe("submission route", () => {
  it("rejects another origin, honeypot and unknown answers", async () => {
    process.env.DISCOVERY_SESSION_SECRET = secret;
    const cookie = await createDiscoverySession("Viv", secret);
    const answers = emptyAnswers();
    const payload = { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), website: "", answers };
    expect((await POST(request(payload, cookie, "https://other.example"))).status).toBe(403);
    expect((await POST(request({ ...payload, website: "spam" }, cookie))).status).toBe(400);
    expect((await POST(request({ ...payload, answers: { ...answers, 20: answers["6"] } }, cookie))).status).toBe(400);
  });

  it("stores one private JSON response with the exact export and accepts a repeated ID", async () => {
    process.env.DISCOVERY_SESSION_SECRET = secret;
    blob.put.mockResolvedValue({ pathname: "saved.json" });
    const cookie = await createDiscoverySession("Rachel", secret);
    const answers = emptyAnswers();
    answers["3"].selected = ["Events and campaigns"];
    const date = new Date().toISOString().slice(0, 10);
    const payload = { id: crypto.randomUUID(), date, website: "", answers };
    expect((await POST(request(payload, cookie))).status).toBe(200);
    expect((await POST(request(payload, cookie))).status).toBe(200);
    expect(blob.put).toHaveBeenCalledTimes(1);
    const [path, body, options] = blob.put.mock.calls[0];
    expect(path).toBe(`frascati-responses/${payload.id}.json`);
    expect(options.access).toBe("private");
    expect(JSON.parse(body).text).toBe(exportAnswers(answers, "Rachel", date));
    expect(JSON.parse(body).person).toBe("Rachel");
  });
});
