import { describe, expect, it } from "vitest";
import { deriveWishStage, getStatusLabel } from "./flow";

describe("wish flow helpers", () => {
  it("derives compose stage from wish status", () => {
    expect(deriveWishStage(null)).toBe("draft");
    expect(deriveWishStage("clarifying")).toBe("clarifying");
    expect(deriveWishStage("planning")).toBe("planning");
    expect(deriveWishStage("ready")).toBe("ready");
  });

  it("returns product labels for key statuses", () => {
    expect(getStatusLabel("clarifying")).toBe("需要补充信息");
    expect(getStatusLabel("planning")).toBe("方案待确认");
    expect(getStatusLabel("ready")).toBe("准备开始");
  });
});
