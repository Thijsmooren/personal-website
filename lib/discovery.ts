import raw from "./discovery-questions.json";

export type Person = "Rachel" | "Viv";
export type Answer = { selected: string[]; other: string; comment: string; text: string; skipped: boolean };
export type Answers = Record<string, Answer>;
export type Question = { id: number; text: string; type: "single" | "multi" | "text"; options?: string[]; optionsFrom?: number; extraOptions?: string[]; help?: string; max?: number };
export type DiscoveryConfig = { client: string; ownerName: string; people: Record<Person, { title: string; note: string }>; steps: { title: string; ids: number[] }[]; questions: Question[] };

export const discovery = raw as DiscoveryConfig;
const byId = new Map(discovery.questions.map((question) => [question.id, question]));

export function optionsFor(question: Question): string[] {
  return question.optionsFrom
    ? [...(byId.get(question.optionsFrom)?.options ?? []), ...(question.extraOptions ?? [])]
    : question.options ?? [];
}

export function emptyAnswers(person: Person): Answers {
  return Object.fromEntries(discovery.questions.map((question) => [String(question.id), {
    selected: question.id === 1 ? [person] : [], other: "", comment: "", text: "", skipped: false,
  }]));
}

export function validateAnswers(value: unknown, person: Person): value is Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  if (Object.keys(answers).length !== discovery.questions.length) return false;
  for (const [id, candidate] of Object.entries(answers)) {
    const question = byId.get(Number(id));
    if (!question || !candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
    const answer = candidate as Record<string, unknown>;
    if (Object.keys(answer).some((key) => !["selected", "other", "comment", "text", "skipped"].includes(key))) return false;
    if (!Array.isArray(answer.selected) || answer.selected.some((item) => typeof item !== "string")) return false;
    if (typeof answer.other !== "string" || answer.other.length > 200) return false;
    if (typeof answer.comment !== "string" || answer.comment.length > 800) return false;
    if (typeof answer.text !== "string" || answer.text.length > 1500) return false;
    if (typeof answer.skipped !== "boolean") return false;
    const selected = answer.selected as string[];
    if (new Set(selected).size !== selected.length) return false;
    if (selected.some((item) => !optionsFor(question).includes(item))) return false;
    if (question.type === "single" && selected.length > 1) return false;
    if (question.type === "text" && selected.length > 0) return false;
    if (question.max && selected.length > question.max) return false;
    if (answer.skipped && (selected.length || answer.other || answer.comment || answer.text)) return false;
  }
  return (answers["1"] as Answer).selected.length === 1 && (answers["1"] as Answer).selected[0] === person;
}

export function exportAnswers(answers: Answers, person: Person, date: string): string {
  const lines = [`Discovery answers: ${discovery.client}`, `Respondent: ${person}`, `Date: ${date}`, ""];
  for (const question of discovery.questions) {
    const answer = answers[String(question.id)];
    const value = answer.skipped ? "To discuss on the call" : question.type === "text" ? answer.text : answer.selected.join(", ");
    lines.push(`${question.id}. ${question.text}`, value || "Not answered");
    if (answer.other) lines.push(`Other: ${answer.other}`);
    if (answer.comment) lines.push(`Comment: ${answer.comment}`);
    lines.push("");
  }
  return lines.join("\n");
}
