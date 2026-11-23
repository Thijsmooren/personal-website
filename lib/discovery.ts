import raw from "./discovery-questions.json";

export type Person = "Rachel" | "Viv";
export type Answer = { selected: string[]; other: string; text: string };
export type Answers = Record<string, Answer>;
export type Question = { id: number; text: string; type: "single" | "multi" | "text"; options?: string[] };
export type DiscoveryConfig = { client: string; ownerName: string; questions: Question[] };

export const discovery = raw as DiscoveryConfig;
const byId = new Map(discovery.questions.map((question) => [question.id, question]));

export function emptyAnswers(): Answers {
  return Object.fromEntries(discovery.questions.map((question) => [String(question.id), {
    selected: [], other: "", text: "",
  }]));
}

export function validateAnswers(value: unknown): value is Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  if (Object.keys(answers).length !== discovery.questions.length) return false;
  for (const [id, candidate] of Object.entries(answers)) {
    const question = byId.get(Number(id));
    if (!question || !candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
    const answer = candidate as Record<string, unknown>;
    if (Object.keys(answer).length !== 3 || Object.keys(answer).some((key) => !["selected", "other", "text"].includes(key))) return false;
    if (!Array.isArray(answer.selected) || answer.selected.some((item) => typeof item !== "string")) return false;
    if (typeof answer.other !== "string" || answer.other.length > 200) return false;
    if (typeof answer.text !== "string" || answer.text.length > 1500) return false;
    const selected = answer.selected as string[];
    if (new Set(selected).size !== selected.length) return false;
    if (selected.some((item) => !question.options?.includes(item))) return false;
    if (question.type === "single" && selected.length > 1) return false;
    if (question.type === "text" && (selected.length > 0 || answer.other)) return false;
    if (!selected.includes("Other") && answer.other) return false;
    if (question.type !== "text" && answer.text) return false;
  }
  return true;
}

export function exportAnswers(answers: Answers, person: Person, date: string): string {
  const lines = [`Discovery answers: ${discovery.client}`, `Respondent: ${person}`, `Date: ${date}`, ""];
  for (const question of discovery.questions) {
    const answer = answers[String(question.id)];
    const value = question.type === "text" ? answer.text : answer.selected.join(", ");
    lines.push(`${question.id}. ${question.text}`, value || "Not answered");
    if (answer.other) lines.push(`Other: ${answer.other}`);
    lines.push("");
  }
  return lines.join("\n");
}
