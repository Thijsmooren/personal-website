import type { Metadata } from "next";
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
      <header className={styles.header}><div className={styles.brand}><span className={styles.brandName}>FRASCATI</span><span>CENTRE</span></div><span>Discovery</span></header>
      <DiscoveryForm person={person} />
      <footer className={styles.footer}>Frascati Centre · A practical starting point for AI</footer>
    </div>
  );
}
