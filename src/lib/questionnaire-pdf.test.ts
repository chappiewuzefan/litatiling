import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";

import { createArea, createInitialAnswers } from "@/lib/questionnaire";
import { generateQuestionnairePdf } from "@/lib/questionnaire-pdf";

describe("questionnaire PDF", () => {
  it("creates a readable multi-language PDF", async () => {
    const answers = createInitialAnswers();
    answers.customer = { name: "测试客户 Alex", phone: "0400 000 000", email: "", role: "owner", roleOther: "" };
    answers.project.address = "Canberra ACT 堪培拉";
    answers.areas = [{ ...createArea("bathroom", "bath"), surfaces: ["floor", "wall"], existingSurface: "bare_concrete", tileSelected: "not_sure", notes: "需要现场确认防水" }];
    const bytes = await generateQuestionnairePdf(answers, [], "test-id", "2026-07-11T00:00:00.000Z");
    expect(bytes.byteLength).toBeGreaterThan(10_000);
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBeGreaterThan(0);
  }, 20_000);
});
