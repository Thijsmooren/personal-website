import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDiscoverySession } from "@/lib/discovery-auth";
import DiscoveryForm from "./form";
import styles from "./discovery.module.css";

export const metadata: Metadata = { title: "Frascati Centre | Discovery", robots: { index: false, follow: false } };

export default async function FrascatiDiscovery() {
  const cookieStore = await cookies();
  const person = await readDiscoverySession(cookieStore.get("frascati_session")?.value, process.env.DISCOVERY_SESSION_SECRET || process.env.CLASSIQ_PASSWORD);
  if (!person) redirect("/discovery/frascati/unlock");
  return (
    <div className={styles.page}>
      <header className={styles.header}><div className={styles.brand}><Image src="/frascati-logo.webp" alt="Frascati Centre" width={200} height={80} priority /></div></header>
      <DiscoveryForm person={person} />
    </div>
  );
}
