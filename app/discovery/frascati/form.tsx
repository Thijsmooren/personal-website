"use client";

import { useEffect, useRef, useState } from "react";
import { discovery, emptyAnswers, exportAnswers, optionsFor, type Answers, type Person, type Question } from "@/lib/discovery";
import styles from "./discovery.module.css";

const today = () => new Date().toISOString().slice(0, 10);
const fresh = (): string => crypto.randomUUID();

export default function DiscoveryForm({ person }: { person: Person }) {
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(person));
  const [step, setStep] = useState(-1);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState<number | null>(null);
  const [fallbackText, setFallbackText] = useState("");
  const [website, setWebsite] = useState("");
  const id = useRef<string | null>(null);
  const date = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step >= 0 || sent) heading.current?.focus();
    window.scrollTo(0, 0);
  }, [step, sent]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!sent && Object.entries(answers).some(([number, answer]) => number !== "1" && (answer.selected.length || answer.text || answer.comment || answer.skipped))) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [answers, sent]);

  function update(question: Question, patch: Partial<Answers[string]>) {
    id.current = null;
    setAnswers((current) => ({ ...current, [question.id]: { ...current[String(question.id)], ...patch, skipped: false } }));
    setFieldError(null);
  }
  function toggle(question: Question, option: string) {
    const current = answers[String(question.id)];
    let selected: string[];
    if (question.type === "single") selected = [option];
    else if (current.selected.includes(option)) selected = current.selected.filter((item) => item !== option);
    else if (question.max && current.selected.length >= question.max) { setFieldError(question.id); return; }
    else selected = [...current.selected, option];
    const other = selected.some((item) => ["Other", "Something else", "Someone else"].includes(item)) ? current.other : "";
    update(question, { selected, other });
  }
  function skip(question: Question) {
    id.current = null;
    setAnswers((current) => ({ ...current, [question.id]: { selected: [], other: "", comment: "", text: "", skipped: true } }));
    setFieldError(null);
  }
  function reset() {
    if (!window.confirm("Clear all your unsent answers and start again?")) return;
    setAnswers(emptyAnswers(person)); setStep(-1); setSent(false); setMessage(""); setFallbackText(""); id.current = null; date.current = null;
  }
  function exportText() { return exportAnswers(answers, person, date.current ?? today()); }
  function download() {
    try {
      const blob = new Blob([exportText()], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `discovery-${person.toLowerCase()}-${date.current ?? today()}.txt`; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage("Your copy has been downloaded.");
    } catch { setMessage("Download failed. Please try again."); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(exportText()); setMessage("Answers copied."); }
    catch { setFallbackText(exportText()); setMessage("Clipboard access was denied. Select and copy the text below."); }
  }
  async function send() {
    if (sending || sent) return;
    if (!id.current) id.current = fresh();
    if (!date.current) date.current = today();
    setSending(true); setMessage("Sending your answers…");
    try {
      const response = await fetch("/api/discovery/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.current, date: date.current, website, answers }), signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Could not send your answers.");
      setSent(true); setMessage("");
    } catch (error) {
      setMessage(`${error instanceof Error ? error.message : "Could not send your answers."} Your answers are still here. Try again, or download a copy and email it to ${discovery.ownerName}.`);
    } finally { setSending(false); }
  }

  function renderQuestion(question: Question) {
    const answer = answers[String(question.id)];
    const showOther = answer.selected.some((item) => ["Other", "Something else", "Someone else"].includes(item));
    return <fieldset className={styles.question} key={question.id}>
      <legend>{question.id}. {question.text}</legend>
      {question.help && <p className={styles.help}>{question.help}</p>}
      {question.type === "text" ? <textarea aria-label={question.text} maxLength={1500} value={answer.text} onChange={(event) => update(question, { text: event.target.value })} /> : <>
        <div className={styles.options}>
          {optionsFor(question).map((option) => <label className={styles.option} key={option}>
            <input type={question.type === "single" ? "radio" : "checkbox"} name={`q-${question.id}`} checked={answer.selected.includes(option)} onChange={() => toggle(question, option)} />
            <span>{option}</span>
          </label>)}
        </div>
        {fieldError === question.id && <p className={styles.error} role="alert">Please choose no more than {question.max}.</p>}
        {showOther && <label className={styles.otherLabel}>Please specify<input type="text" maxLength={200} value={answer.other} onChange={(event) => update(question, { other: event.target.value })} /></label>}
      </>}
      <details className={styles.comment}><summary>+ Add a comment (optional)</summary><textarea aria-label={`Comment for question ${question.id}`} maxLength={800} value={answer.comment} onChange={(event) => update(question, { comment: event.target.value })} /></details>
      <button type="button" className={styles.textButton} onClick={() => skip(question)}>Skip, let&apos;s discuss this on the call</button>
      {answer.skipped && <p className={styles.help}>To discuss on the call</p>}
    </fieldset>;
  }

  if (sent) return <main className={styles.card}>
    <p className={styles.eyebrow}>Thank you</p><h1 ref={heading} tabIndex={-1}>Your answers have been sent</h1>
    <p>Thank you, your answers have been sent to {discovery.ownerName}. We will go through them together on the call.</p>
    <button type="button" className={styles.secondary} onClick={download}>Download a copy for yourself</button>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
  </main>;

  if (step === -1) return <main className={styles.card}>
    <p className={styles.eyebrow}>Frascati Centre · {person}</p><h1 ref={heading} tabIndex={-1}>A practical starting point for AI</h1>
    <p>Welcome, {person}. {discovery.people[person].note}</p>
    <p>A few quick questions to help us understand your work and choose one useful first improvement. About 5 minutes. Most questions are multiple choice. Skip anything you like and we can discuss it on the call.</p>
    <p className={styles.privacy}>Please do not include personal details, confidential information, passwords or live customer records. Your answers are only sent when you press Send at the end.</p>
    <button type="button" className={styles.primary} onClick={() => setStep(0)}>Start</button>
  </main>;

  if (step < discovery.steps.length) {
    const current = discovery.steps[step];
    return <main className={styles.card}>
      <div className={styles.progress}><strong>Step {step + 1} of {discovery.steps.length}</strong><span>{person}</span></div>
      <div className={styles.progressTrack}><span style={{ width: `${((step + 1) / discovery.steps.length) * 100}%` }} /></div>
      <h1 ref={heading} tabIndex={-1}>{current.title}</h1>
      {step === discovery.steps.length - 1 && <p className={styles.optionalNote}>These last questions are optional. We can cover them together on the call.</p>}
      {current.ids.map((number) => renderQuestion(discovery.questions.find((question) => question.id === number)!))}
      <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setStep(step - 1)}>Back</button><button type="button" className={styles.primary} onClick={() => setStep(step + 1)}>{step === discovery.steps.length - 1 ? "Review answers" : "Continue"}</button></div>
      <button type="button" className={styles.textButton} onClick={reset}>Reset answers</button>
    </main>;
  }

  return <main className={`${styles.card} ${styles.review}`}>
    <p className={styles.eyebrow}>Review and send</p><h1 ref={heading} tabIndex={-1}>Your answers</h1>
    <p>Please check your answers. You can edit any section before sending.</p>
    {discovery.questions.map((question) => {
      const answer = answers[String(question.id)];
      const value = answer.skipped ? "To discuss on the call" : question.type === "text" ? answer.text : answer.selected.join(", ");
      return <section className={styles.reviewItem} key={question.id}>
        <h2>{question.id}. {question.text}</h2><p>{value || "Not answered"}</p>
        {answer.other && <p>Other: {answer.other}</p>}{answer.comment && <p>Comment: {answer.comment}</p>}
        {question.id !== 1 && <button type="button" className={styles.textButton} onClick={() => setStep(discovery.steps.findIndex((item) => item.ids.includes(question.id)))}>Edit</button>}
      </section>;
    })}
    <p className={styles.privacy}>When you press Send, your answers are emailed to {discovery.ownerName} to prepare for our conversation. Please contact {discovery.ownerName} if you want your answers deleted.</p>
    <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
    <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setStep(discovery.steps.length - 1)}>Back</button><button type="button" className={styles.primary} disabled={sending} onClick={send}>{sending ? "Sending…" : "Send my answers"}</button></div>
    <div className={styles.extras}><button type="button" className={styles.secondary} onClick={download}>Download .txt</button><button type="button" className={styles.secondary} onClick={copy}>Copy answers</button><button type="button" className={styles.secondary} onClick={() => window.print()}>Print</button></div>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
    {fallbackText && <textarea className={styles.copyFallback} aria-label="Select and copy your answers" readOnly value={fallbackText} onFocus={(event) => event.currentTarget.select()} />}
  </main>;
}
