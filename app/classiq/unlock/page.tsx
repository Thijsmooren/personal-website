import Link from "next/link";

export default async function ClassiqUnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const target = next?.startsWith("/classiq") ? next : "/classiq";

  return (
    <main className="classiq-page">
      <article className="classiq-card">
        <div className="classiq-topline">
          <img src="/classiq-logo.svg" alt="Classiq" />
          <span>Private presentation</span>
        </div>
        <p className="classiq-label">Quantum Solutions Architect · Europe</p>
        <h1>Enter the password.</h1>
        <div className="classiq-rule" />
        <p>This private presentation is available to people with the password.</p>
        <form className="classiq-form" action="/api/classiq/unlock" method="post">
          <input type="hidden" name="next" value={target} />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
          <button type="submit">Open presentation <span aria-hidden="true">→</span></button>
        </form>
        {error && <p className="classiq-error">That password is not correct. Please try again.</p>}
        <Link className="classiq-back" href="/">← Back to home</Link>
      </article>
    </main>
  );
}
