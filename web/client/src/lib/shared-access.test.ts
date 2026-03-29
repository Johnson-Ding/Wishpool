import { describe, expect, it } from "vitest";
import { mapIntentToScenario } from "../../../../shared/wishpool-access/agent-api";
import { toFeedItem, toWishTasks } from "../../../../shared/wishpool-access/api";

describe("shared wishpool access layer", () => {
  it("maps feed rows into the plaza-friendly shape", () => {
    const item = toFeedItem({
      id: 7,
      fulfillment_id: "fulfillment-1",
      source_type: "community",
      type: "story",
      tag: "城市活动",
      tag_color: "#fff",
      tag_bg: "#000",
      title: "第一次参加夜跑",
      meta: "3人助力",
      loc: "上海",
      excerpt: "终于跑出门了",
      likes: 12,
      link: "https://example.com",
      is_active: true,
      created_at: "2026-03-29T00:00:00.000Z",
    });

    expect(item).toMatchObject({
      id: 7,
      fulfillmentId: "fulfillment-1",
      sourceType: "community",
      type: "story",
      likes: 12,
      isActive: true,
    });
  });

  it("maps wish rows and gracefully handles empty lists", () => {
    expect(toWishTasks(null)).toEqual([]);

    const wishes = toWishTasks([
      {
        id: "wish-1",
        user_id: "device-1",
        title: "周末海边放松",
        intent: "想找个周末去海边吹风",
        status: "planning",
        city: "上海",
        budget: "500",
        time_window: "next weekend",
        raw_input: "海边放松",
        ai_plan: { steps: 3 },
        confirmed_at: null,
        created_at: "2026-03-29T00:00:00.000Z",
        updated_at: "2026-03-29T01:00:00.000Z",
      },
    ]);

    expect(wishes).toHaveLength(1);
    expect(wishes[0]).toMatchObject({
      id: "wish-1",
      userId: "device-1",
      timeWindow: "next weekend",
      aiPlan: { steps: 3 },
    });
  });

  it("keeps scenario mapping stable for both known and unknown intent types", () => {
    expect(mapIntentToScenario("travel")).toBe(2);
    expect(mapIntentToScenario("growth")).toBe(1);
    expect(mapIntentToScenario("unknown")).toBe(2);
  });
});
