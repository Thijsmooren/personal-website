import { describe, expect, it } from "vitest";
import { createDiscoverySession, personFromName, readDiscoverySession } from "./discovery-auth";
import { discovery, emptyAnswers, exportAnswers, validateAnswers } from "./discovery";

describe("Frascati discovery", () => {
  it("opens the correct portal from the visible first name", async () => {
    expect(personFromName("Rachel")).toBe("Rachel");
    expect(personFromName("vivian")).toBe("Viv");
    expect(personFromName("Viv")).toBe("Viv");
    expect(personFromName("Unknown")).toBeNull();
    const session = await createDiscoverySession("Viv", "test-secret");
    expect(await readDiscoverySession(session, "test-secret")).toBe("Viv");
    expect(await readDiscoverySession(session, "wrong-secret")).toBeNull();
    expect(await readDiscoverySession(session.replace("Viv", "Rachel"), "test-secret")).toBeNull();
  });

  it("validates all known choices and preserves literal export text", () => {
    const answers = emptyAnswers();
    answers["3"].selected = ["Marketing and content", "Events and campaigns"];
    answers["6"].text = '<script>alert("x")</script>';
    expect(validateAnswers(answers)).toBe(true);
    const text = exportAnswers(answers, "Rachel", "2026-11-23");
    expect(text).toContain('6. Is there anything about AI you would like to ask or discuss?\n<script>alert("x")</script>');
    expect(text).toContain("Respondent: Rachel");
    const invalidChoice = structuredClone(answers);
    invalidChoice["3"].selected.push("Unknown area");
    expect(validateAnswers(invalidChoice)).toBe(false);
    const unknown = structuredClone(answers) as typeof answers;
    unknown["20"] = { ...unknown["6"] };
    expect(validateAnswers(unknown)).toBe(false);
    const long = structuredClone(answers);
    long["6"].text = "x".repeat(1501);
    expect(validateAnswers(long)).toBe(false);
    expect(validateAnswers(emptyAnswers())).toBe(true);
    expect(discovery.questions).toHaveLength(6);
  });
});
