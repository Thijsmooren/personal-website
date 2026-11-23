import { createClassiqSession, hasValidClassiqSession } from "./classiq-auth";

export const adminPassword = () => process.env.DISCOVERY_ADMIN_PASSWORD || process.env.CLASSIQ_PASSWORD;

export async function hasDiscoveryAdminSession(token: string | undefined): Promise<boolean> {
  return hasValidClassiqSession(token, adminPassword());
}

export async function createDiscoveryAdminSession(password: string): Promise<string> {
  return createClassiqSession(password);
}
