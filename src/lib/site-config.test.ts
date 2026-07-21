import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("site phone configuration", () => {
  it("keeps the primary and backup phones in call priority order", async () => {
    vi.stubEnv("NEXT_PUBLIC_PHONE_DISPLAY", "0435 248 809");
    vi.stubEnv("NEXT_PUBLIC_BACKUP_PHONE_DISPLAY", "0478 516 702");

    const { siteConfig } = await import("@/lib/site-config");

    expect(siteConfig.phoneContacts).toEqual([
      {
        kind: "primary",
        display: "0435 248 809",
        href: "tel:0435248809",
      },
      {
        kind: "backup",
        display: "0478 516 702",
        href: "tel:0478516702",
      },
    ]);
  });

  it("builds dial links from environment overrides", async () => {
    vi.stubEnv("NEXT_PUBLIC_PHONE_DISPLAY", "+61 435 248 809");
    vi.stubEnv("NEXT_PUBLIC_BACKUP_PHONE_DISPLAY", "+61 478 516 702");

    const { siteConfig } = await import("@/lib/site-config");

    expect(siteConfig.primaryPhone.href).toBe("tel:+61435248809");
    expect(siteConfig.backupPhone.href).toBe("tel:+61478516702");
  });
});
