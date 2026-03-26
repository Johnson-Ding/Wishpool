import { describe, expect, it } from "vitest";
import { getDemoScreenLabel, getNextDemoScreen, getPreviousDemoScreen, getWishExecutionStatusFromScreen } from "../navigation";

describe("demo flow navigation", () => {
  it("returns next and previous screens from the canonical order", () => {
    expect(getNextDemoScreen("home")).toBe("paywall");
    expect(getPreviousDemoScreen("chat")).toBe("paywall");
    expect(getNextDemoScreen("feedback")).toBe("feedback");
  });

  it("maps demo screens to business statuses", () => {
    expect(getWishExecutionStatusFromScreen("home")).toBeNull();
    expect(getWishExecutionStatusFromScreen("chat")).toBe("clarifying");
    expect(getWishExecutionStatusFromScreen("collab-prep")).toBe("locking");
    expect(getWishExecutionStatusFromScreen("feedback")).toBe("completed");
  });

  it("exposes consistent labels for progress hints", () => {
    expect(getDemoScreenLabel("home")).toBe("许愿池 V2.0 Demo");
    expect(getDemoScreenLabel("fulfillment")).toBe("活动履约 US-06");
  });
});
