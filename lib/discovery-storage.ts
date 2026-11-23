import { get, list, put } from "@vercel/blob";
import { discovery, type Answers, type Person } from "./discovery";

const prefix = "frascati-responses/";

export type StoredResponse = {
  id: string;
  person: Person;
  submittedAt: string;
  answers: Answers;
  text: string;
};

export async function saveDiscoveryResponse(response: StoredResponse): Promise<void> {
  await put(`${prefix}${response.id}.json`, JSON.stringify(response), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export async function listDiscoveryResponses(): Promise<StoredResponse[]> {
  const records: StoredResponse[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 100 });
    for (const blob of page.blobs) {
      const file = await get(blob.pathname, { access: "private" });
      if (file?.statusCode !== 200) continue;
      const record = await new Response(file.stream).json() as StoredResponse;
      if ((record.person === "Rachel" || record.person === "Viv") && record.id && record.text) records.push(record);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return records.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

function csvCell(value: string): string {
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function responsesToCsv(responses: StoredResponse[]): string {
  const headings = ["Respondent", "Submitted at", ...discovery.questions.map((question) => `${question.id}. ${question.text}`)];
  const rows = responses.map((response) => [response.person, response.submittedAt, ...discovery.questions.map((question) => {
    const answer = response.answers[String(question.id)];
    if (!answer) return "";
    const value = question.type === "text" ? answer.text : answer.selected.join("; ");
    return answer.other ? `${value} — ${answer.other}` : value;
  })]);
  return [headings, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
