import type { Metadata } from "next";
import Image from "next/image";
import styles from "../../discovery.module.css";

export const metadata: Metadata = { title: "Frascati responses | Private", robots: { index: false, follow: false } };

export default async function ResponsesUnlock({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className={styles.loginPage}>
      <header className={styles.header}><div className={styles.brand}><Image src="/frascati-logo-header.png" alt="Frascati Centre" width={489} height={141} priority /></div><span className={styles.headerLabel}>Private responses</span></header>
    <section className={styles.loginCard}>
      <p className={styles.eyebrow}>Private responses</p>
      <h1>Open responses</h1>
      <p>Enter your admin password to view Rachel and Viv&apos;s answers.</p>
      <form action="/api/discovery/admin-login" method="post" className={styles.loginForm}>
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus />
        {error && <p className={styles.error} role="alert">That password was not recognised.</p>}
        <button type="submit" className={styles.primary}>Open responses</button>
      </form>
    </section>
  </main>;
}
