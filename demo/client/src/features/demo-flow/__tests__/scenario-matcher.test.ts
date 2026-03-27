import { describe, expect, it } from "vitest";
import { WISH_SCENARIOS } from "../data";
import { FALLBACK_SCENARIO_ID, matchScenarioByWishInput } from "../scenario-matcher";

describe("scenario matcher", () => {
  it("matches skiing wishes directly without clarification", () => {
    const result = matchScenarioByWishInput("我想去崇礼滑雪，找个有车的搭子");
    expect(result.scenarioId).toBe(2);
    expect(result.needsClarification).toBe(false);
  });

  it("matches hotpot and solo dining wishes directly", () => {
    const result = matchScenarioByWishInput("想找一家适合一个人吃火锅的小店");
    expect(result.scenarioId).toBe(4);
    expect(result.needsClarification).toBe(false);
  });

  it("falls back with clarification needed when no keyword matches", () => {
    const result = matchScenarioByWishInput("我想试试看一个新的周末体验");
    expect(result.scenarioId).toBe(FALLBACK_SCENARIO_ID);
    expect(result.needsClarification).toBe(true);
    expect(FALLBACK_SCENARIO_ID).toBe(2);
  });

  it("exposes a complete skiing scenario payload", () => {
    expect(WISH_SCENARIOS[2]).toBeDefined();
    expect(WISH_SCENARIOS[2].wishText).toContain("滑雪");
    expect(WISH_SCENARIOS[2].feedbackTitle).toContain("滑雪");
  });
});
