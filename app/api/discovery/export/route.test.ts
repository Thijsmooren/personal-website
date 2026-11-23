import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createDiscoveryAdminSession } from "@/lib/discovery-admin";
import { GET } from "./route";

const blob = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), put: vi.fn() }));
vi.mock("@vercel/blob", () => blob);

describe("private Frascati export", () => {
  it("requires the admin session before reading private storage", async () => {
    process.env.DISCOVERY_ADMIN_PASSWORD = "test-admin-password";
    const url = "https://matthiasndesario.com/api/discovery/export";
    expect((await GET(new NextRequest(url))).status).toBe(401);
    expect(blob.list).not.toHaveBeenCalled();
    const token = await createDiscoveryAdminSession("test-admin-password");
    blob.list.mockResolvedValue({ blobs: [], hasMore: false });
    const response = await GET(new NextRequest(url, { headers: { cookie: `frascati_admin_session=${token}` } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(await response.text()).toContain("Respondent");
  });
});
