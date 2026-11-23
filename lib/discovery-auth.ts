import type { Person } from "./discovery";

const encoder = new TextEncoder();
function hex(bytes: ArrayBuffer): string { return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}
function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
export function personFromName(name: string): Person | null {
  const normalized = name.trim().toLocaleLowerCase("en-IE");
  if (normalized === "rachel") return "Rachel";
  if (normalized === "viv" || normalized === "vivian") return "Viv";
  return null;
}
export async function createDiscoverySession(person: Person, secret: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  const payload = `${person}.${expiry}`;
  return `${payload}.${await sign(payload, secret)}`;
}
export async function readDiscoverySession(token: string | undefined, secret: string | undefined): Promise<Person | null> {
  if (!token || !secret) return null;
  const [name, expiry, signature] = token.split(".");
  if ((name !== "Rachel" && name !== "Viv") || !/^\d+$/.test(expiry ?? "") || !signature || Number(expiry) < Math.floor(Date.now() / 1000)) return null;
  const expected = await sign(`${name}.${expiry}`, secret);
  return same(signature, expected) ? name : null;
}
