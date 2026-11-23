import type { Metadata } from "next";
import Image from "next/image";
import styles from "../discovery.module.css";

export const metadata: Metadata = { title: "Frascati Centre | Discovery", robots: { index: false, follow: false } };

export default async function Unlock({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className={styles.loginPage}>
      <header className={styles.header}><div className={styles.brand}><Image src="/frascati-logo-header.png" alt="Frascati Centre" width={489} height={141} priority /></div><span className={styles.headerLabel}>A short introduction</span></header>
      <div className={styles.shell}>
      <aside className={styles.sidebar}><span className={styles.sidebarLine} /><p>Frascati Centre</p><h2>Before seeing each other.</h2><span className={styles.sidebarBottom}>A conversation with Matthias Ndesario</span></aside>
      <section className={styles.loginCard}>
        <p className={styles.eyebrow}>A practical starting point for AI</p>
        <h1>Before we begin</h1>
        <p>Enter the first name from your invitation to open your own questions. You can see what you type.</p>
        <form action="/api/discovery/login" method="post" className={styles.loginForm}>
          <label htmlFor="discovery-name">First name</label>
          <input id="discovery-name" name="name" type="text" autoComplete="off" autoCapitalize="words" spellCheck={false} required maxLength={40} autoFocus />
          {error && <p className={styles.error} role="alert">That name was not recognised. Please check your invitation.</p>}
          <button type="submit" className={styles.primary}>Open my questions</button>
        </form>
      <p className={styles.loginFootnote}>Your answers are only sent when you press Send at the end.</p>
      </section>
      </div>
    </main>
  );
}
