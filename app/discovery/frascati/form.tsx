"use client";

import { useEffect, useRef, useState } from "react";
import { discovery, emptyAnswers, exportAnswers, type Answers, type Person, type Question } from "@/lib/discovery";
import styles from "./discovery.module.css";

const today = () => new Date().toISOString().slice(0, 10);

export default function DiscoveryForm({ person }: { person: Person }) {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState(-1);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
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
      if (!sent && Object.values(answers).some((answer) => answer.selected.length || answer.text || answer.other)) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [answers, sent]);

  function update(question: Question, patch: Partial<Answers[string]>) {
    id.current = null;
    setAnswers((current) => ({ ...current, [question.id]: { ...current[String(question.id)], ...patch } }));
  }
  function toggle(question: Question, option: string) {
    const current = answers[String(question.id)];
    const selected = question.type === "single" ? [option] : current.selected.includes(option)
      ? current.selected.filter((item) => item !== option) : [...current.selected, option];
    update(question, { selected, other: selected.includes("Other") ? current.other : "" });
  }
  function clear(question: Question) {
    update(question, { selected: [], other: "", text: "" });
  }
  function reset() {
    if (!window.confirm("Clear all your unsent answers and start again?")) return;
    setAnswers(emptyAnswers()); setStep(-1); setSent(false); setMessage(""); setFallbackText(""); id.current = null; date.current = null;
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
    if (!id.current) id.current = crypto.randomUUID();
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
      setMessage(`${error instanceof Error ? error.message : "Could not save your answers."} Your answers are still here. Try again, or download a copy and send it to ${discovery.ownerName}.`);
    } finally { setSending(false); }
  }

  function renderQuestion(question: Question) {
    const answer = answers[String(question.id)];
    return <fieldset className={styles.question} key={question.id}>
      <legend>{question.id}. {question.text}</legend>
      {question.type === "text" ? <textarea aria-label={question.text} maxLength={1500} value={answer.text} onChange={(event) => update(question, { text: event.target.value })} /> : <>
        <div className={styles.options}>
          {question.options?.map((option) => <label className={styles.option} key={option}>
            <input type={question.type === "single" ? "radio" : "checkbox"} name={`q-${question.id}`} checked={answer.selected.includes(option)} onChange={() => toggle(question, option)} />
            <span>{option}</span>
          </label>)}
        </div>
        {answer.selected.includes("Other") && <label className={styles.otherLabel}>Please specify<input type="text" maxLength={200} value={answer.other} onChange={(event) => update(question, { other: event.target.value })} /></label>}
      </>}
      {(answer.selected.length > 0 || answer.text) && <button type="button" className={styles.textButton} onClick={() => clear(question)}>Clear answer</button>}
    </fieldset>;
  }

  if (sent) return <main className={styles.card}>
    <p className={styles.eyebrow}>Thank you</p><h1 ref={heading} tabIndex={-1}>Your answers have been received</h1>
    <p>Thank you. We will go through them together on the call.</p>
    <button type="button" className={styles.secondary} onClick={download}>Download a copy for yourself</button>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
  </main>;

  if (step === -1) return <main className={styles.card}>
    <p className={styles.eyebrow}>A few questions for you</p><h1 ref={heading} tabIndex={-1}>Welcome, {person}.</h1>
    <p>These are some questions to help understand your work. This will take about 5 minutes. Feel free to skip any questions (just leave them blank). Thanks in advance.</p>
    <button type="button" className={styles.primary} onClick={() => setStep(0)}>Start</button>
  </main>;

  if (step === 0) return <main className={styles.card}>
    <p className={styles.eyebrow}>For {person}</p>
    <h1 ref={heading} tabIndex={-1}>A few questions before seeing each other</h1>
    <p>Answer what you can. You can leave any question blank.</p>
    {discovery.questions.map(renderQuestion)}
    <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setStep(-1)}>Back</button><button type="button" className={styles.primary} onClick={() => setStep(1)}>Review answers</button></div>
    <button type="button" className={styles.textButton} onClick={reset}>Reset answers</button>
  </main>;

  return <main className={`${styles.card} ${styles.review}`}>
    <p className={styles.eyebrow}>Review and send</p><h1 ref={heading} tabIndex={-1}>Your answers</h1>
    <p>Please check your answers before sending.</p>
    {discovery.questions.map((question) => {
      const answer = answers[String(question.id)];
      const value = question.type === "text" ? answer.text : answer.selected.join(", ");
      return <section className={styles.reviewItem} key={question.id}>
        <h2>{question.id}. {question.text}</h2><p>{value || "Not answered"}</p>
        {answer.other && <p>Other: {answer.other}</p>}
      </section>;
    })}
    <p className={styles.privacy}>When you press Send, your answers are saved for {discovery.ownerName} to review before our conversation.</p>
    <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
    <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setStep(0)}>Edit answers</button><button type="button" className={styles.primary} disabled={sending} onClick={send}>{sending ? "Sending…" : "Send my answers"}</button></div>
    <div className={styles.extras}><button type="button" className={styles.secondary} onClick={download}>Download .txt</button><button type="button" className={styles.secondary} onClick={copy}>Copy answers</button></div>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
    {fallbackText && <textarea className={styles.copyFallback} aria-label="Select and copy your answers" readOnly value={fallbackText} onFocus={(event) => event.currentTarget.select()} />}
  </main>;
}
