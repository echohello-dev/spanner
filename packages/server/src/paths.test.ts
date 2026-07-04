import { describe, expect, it } from "vitest";
import { resolveSpannerHome, SPANNER_VERSION } from "../src/paths.js";

describe("paths", () => {
  it("exports a non-empty version", () => {
    expect(SPANNER_VERSION.length).toBeGreaterThan(0);
  });

  it("resolves $SPANNER_HOME when set", () => {
    const result = resolveSpannerHome({ SPANNER_HOME: "/custom/spanner/home" });
    expect(result).toContain("custom");
    expect(result.endsWith("spanner/home") || result.endsWith("spanner")).toBe(true);
  });

  it("falls back to $HOME/.spanner when unset", () => {
    const result = resolveSpannerHome({ HOME: "/Users/test", SPANNER_HOME: "" });
    expect(result.endsWith(".spanner")).toBe(true);
  });
});
