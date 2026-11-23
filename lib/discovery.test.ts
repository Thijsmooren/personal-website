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
    const answers = emptyAnswers("Rachel");
    answers["7"].selected = ["Event and campaign planning", "Media, sponsor or partner coordination", "Tenant communication"];
    answers["19"].text = '<script>alert("x")</script>';
    expect(validateAnswers(answers, "Rachel")).toBe(true);
    const text = exportAnswers(answers, "Rachel", "2026-11-23");
    expect(text).toContain('19. Anything else we should know before the call?\n<script>alert("x")</script>');
    expect(text).toContain("Respondent: Rachel");
    const tooMany = structuredClone(answers);
    tooMany["7"].selected.push("Social media posts and captions");
    expect(validateAnswers(tooMany, "Rachel")).toBe(false);
    const unknown = structuredClone(answers) as typeof answers;
    unknown["20"] = { ...unknown["19"] };
    expect(validateAnswers(unknown, "Rachel")).toBe(false);
    const long = structuredClone(answers);
    long["19"].text = "x".repeat(1501);
    expect(validateAnswers(long, "Rachel")).toBe(false);
    expect(discovery.questions).toHaveLength(19);
  });
});
