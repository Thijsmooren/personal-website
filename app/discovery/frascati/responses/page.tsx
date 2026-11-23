import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasDiscoveryAdminSession } from "@/lib/discovery-admin";
import { listDiscoveryResponses } from "@/lib/discovery-storage";
import styles from "../discovery.module.css";

export const metadata: Metadata = { title: "Frascati responses | Private", robots: { index: false, follow: false } };

export default async function ResponsesPage() {
  const cookieStore = await cookies();
  if (!await hasDiscoveryAdminSession(cookieStore.get("frascati_admin_session")?.value)) redirect("/discovery/frascati/responses/unlock");
  let responses: Awaited<ReturnType<typeof listDiscoveryResponses>> = [];
  let storageError = false;
  try { responses = await listDiscoveryResponses(); } catch { storageError = true; }
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.brand}><Image src="/frascati-logo-header.png" alt="Frascati Centre" width={489} height={141} priority /></div><span className={styles.headerLabel}>Private responses</span></header>
    <section className={styles.card}>
      <p className={styles.eyebrow}>Private · Frascati Centre</p>
      <h1>Responses</h1>
      {storageError ? <p role="alert">Private storage is not connected yet. Connect a private Vercel Blob store to this project, then refresh this page.</p> : <>
        <p>{responses.length} {responses.length === 1 ? "response" : "responses"} received.</p>
        {responses.length > 0 && <a className={styles.primaryLink} href="/api/discovery/export">Download CSV</a>}
        {responses.map((response) => <details className={styles.responseDetail} key={response.id}>
          <summary>{response.person} · {new Date(response.submittedAt).toLocaleString("en-IE", { timeZone: "Europe/Dublin", dateStyle: "medium", timeStyle: "short" })}</summary>
          <pre>{response.text}</pre>
        </details>)}
      </>}
      <form action="/api/discovery/admin-logout" method="post"><button className={styles.textButton} type="submit">Sign out</button></form>
    </section>
  </main>;
}
