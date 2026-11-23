import { describe, expect, it } from "vitest";
import { emptyAnswers } from "./discovery";
import { responsesToCsv, type StoredResponse } from "./discovery-storage";

describe("Frascati CSV export", () => {
  it("includes both people and keeps spreadsheet formulas as text", () => {
    const rachel = emptyAnswers();
    rachel["4"].text = "=IMPORTXML(\"https://example.com\")";
    const viv = emptyAnswers();
    viv["3"].selected = ["Centre operations"];
    const responses: StoredResponse[] = [
      { id: "1", person: "Rachel", submittedAt: "2026-11-23T10:00:00Z", answers: rachel, text: "Rachel" },
      { id: "2", person: "Viv", submittedAt: "2026-11-23T11:00:00Z", answers: viv, text: "Viv" },
    ];
    const csv = responsesToCsv(responses);
    expect(csv).toContain('"Rachel"');
    expect(csv).toContain('"Viv"');
    expect(csv).toContain("'=IMPORTXML");
    expect(csv).toContain('"Centre operations"');
  });
});
