import { describe, expect, it } from "vitest";
import { WISH_SCENARIOS } from "../data";
import { FALLBACK_SCENARIO_ID, matchScenarioByWishInput } from "../scenario-matcher";

describe("scenario matcher", () => {
  it("matches skiing wishes to the skiing scenario", () => {
    expect(matchScenarioByWishInput("我想去崇礼滑雪，找个有车的搭子")).toBe(2);
  });

  it("matches hotpot and solo dining wishes to the dining scenario", () => {
    expect(matchScenarioByWishInput("想找一家适合一个人吃火锅的小店")).toBe(4);
  });

  it("falls back to the skiing scenario when no keyword matches", () => {
    expect(matchScenarioByWishInput("我想试试看一个新的周末体验")).toBe(FALLBACK_SCENARIO_ID);
    expect(FALLBACK_SCENARIO_ID).toBe(2);
  });

  it("exposes a complete skiing scenario payload", () => {
    expect(WISH_SCENARIOS[2]).toBeDefined();
    expect(WISH_SCENARIOS[2].wishText).toContain("滑雪");
    expect(WISH_SCENARIOS[2].feedbackTitle).toContain("滑雪");
  });
});
