import { describe, expect, it } from "vitest";

import { clearHiddenAreaAnswers, createArea, createInitialAnswers, getAreaVisibility, validateQuestionnaire } from "@/lib/questionnaire";
import { detectAllowedFileType, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, normalizeQuestionnaireAnswers, safeFilename } from "@/lib/questionnaire-server";

describe("questionnaire conditional logic", () => {
  it("clears floor-only answers when an area changes to wall-only", () => {
    const area = createArea("bathroom", "area-1");
    const cleaned = clearHiddenAreaAnswers({ ...area, surfaces: ["wall"], screeding: "required", floorWaste: "linear", flushFinish: "flush", underfloorHeating: "new" });
    expect(cleaned.screeding).toBe("");
    expect(cleaned.floorWaste).toBe("");
    expect(cleaned.flushFinish).toBe("");
    expect(cleaned.underfloorHeating).toBe("");
  });

  it("hides wet-area questions for a living room", () => {
    const area = createArea("living_dining", "area-2");
    const cleaned = clearHiddenAreaAnswers({ ...area, surfaces: ["floor"], waterproofing: "yes", floorWaste: "square" });
    expect(getAreaVisibility(cleaned).wetArea).toBe(false);
    expect(cleaned.waterproofing).toBe("");
    expect(cleaned.floorWaste).toBe("");
  });

  it("only skips screeding for confirmed sound and level tile-over", () => {
    const area = createArea("bathroom", "area-3");
    expect(getAreaVisibility({ ...area, surfaces: ["floor"], existingSurface: "tile_over", tileOverCondition: "sound_level" }).showScreeding).toBe(false);
    expect(getAreaVisibility({ ...area, surfaces: ["floor"], existingSurface: "tile_over", tileOverCondition: "not_sure" }).showScreeding).toBe(true);
  });

  it("keeps separate values for independently created areas", () => {
    const bathroom = { ...createArea("bathroom", "bath"), tileSize: "600x600" };
    const kitchen = { ...createArea("kitchen_splashback", "kitchen"), tileSize: "75x300" };
    expect(bathroom.id).not.toBe(kitchen.id);
    expect(bathroom.tileSize).not.toBe(kitchen.tileSize);
  });
});

describe("questionnaire validation", () => {
  it("normalizes a malformed partial payload without throwing", () => {
    const answers = normalizeQuestionnaireAnswers({});
    expect(answers.project.address).toBe("");
    expect(answers.supplies.tiles).toBe("");
    expect(validateQuestionnaire(answers)).toContain("Project address is required.");
  });

  it("requires contact, overview, area keys, supplies and consent", () => {
    const answers = createInitialAnswers();
    expect(validateQuestionnaire(answers).length).toBeGreaterThan(4);
  });

  it("accepts a minimally complete submission with not-sure technical choices", () => {
    const answers = createInitialAnswers();
    answers.customer = { name: "Alex", phone: "0400000000", email: "", role: "owner", roleOther: "" };
    answers.project.address = "1 Test Street, Canberra ACT";
    answers.project.propertyType = "house";
    answers.project.projectType = "renovation";
    answers.project.stage = "planning";
    answers.areas = [{ ...createArea("bathroom", "bath"), surfaces: ["floor", "wall"], existingSurface: "not_sure", tileSelected: "not_sure" }];
    Object.keys(answers.supplies).forEach((key) => { answers.supplies[key as keyof typeof answers.supplies] = "not_sure"; });
    answers.accuracyConfirmed = true;
    answers.privacyAccepted = true;
    expect(validateQuestionnaire(answers)).toEqual([]);
  });

  it("rejects a malformed optional email", () => {
    const answers = createInitialAnswers();
    answers.customer.email = "not-an-email";
    expect(validateQuestionnaire(answers)).toContain("Enter a valid email address or leave it blank.");
  });
});

describe("attachment limits", () => {
  it("keeps the agreed count and size limits", () => {
    expect(MAX_ATTACHMENTS).toBe(10);
    expect(MAX_ATTACHMENT_BYTES).toBe(10 * 1024 * 1024);
  });

  it("randomizes names and only preserves supported extensions", () => {
    expect(safeFilename("bathroom plan.PDF")).toMatch(/^[a-f0-9]{32}\.pdf$/);
    expect(safeFilename("unsafe.html")).toMatch(/^[a-f0-9]{32}$/);
  });

  it("identifies supported content by magic bytes rather than browser MIME", () => {
    expect(detectAllowedFileType(Buffer.from("%PDF-1.7\n"))).toBe("application/pdf");
    expect(detectAllowedFileType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectAllowedFileType(Buffer.from("<script>alert(1)</script>"))).toBeNull();
  });
});
