import { describe, expect, it } from "vitest";
import { toFeedItem, toWishTask, toWishTasks } from "./api";

describe("api mappers", () => {
  it("maps drift bottle rows to feed items", () => {
    const result = toFeedItem({
      id: 8,
      fulfillment_id: "fulfillment-1",
      source_type: "seed",
      type: "story",
      tag: "城市活动",
      tag_color: "var(--accent)",
      tag_bg: "oklch(0.7 0.15 180 / 0.15)",
      title: "第一次夜跑",
      meta: "3人助力",
      loc: "上海",
      excerpt: "一次新的开始",
      likes: 12,
      link: "https://example.com",
      is_active: true,
      created_at: "2026-03-29T00:00:00Z",
    });

    expect(result.fulfillmentId).toBe("fulfillment-1");
    expect(result.tagColor).toBe("var(--accent)");
    expect(result.createdAt).toBe("2026-03-29T00:00:00Z");
  });

  it("maps wish rows to camelCase tasks", () => {
    const result = toWishTask({
      id: "wish-1",
      anonymous_user_id: "user-1",
      title: "去看展",
      intent: "周末去看一个展",
      status: "planning",
      city: "上海",
      budget: "200",
      time_window: "周末",
      raw_input: "想周末去看个展",
      ai_plan: { summary: "正在生成" },
      confirmed_at: null,
      created_at: "2026-03-29T00:00:00Z",
      updated_at: "2026-03-29T01:00:00Z",
    });

    expect(result.anonymousUserId).toBe("user-1");
    expect(result.timeWindow).toBe("周末");
    expect(result.aiPlan).toEqual({ summary: "正在生成" });
  });

  it("maps list_my_wishes rpc payloads into task arrays", () => {
    const result = toWishTasks([
      {
        id: "wish-1",
        anonymous_user_id: "user-1",
        title: "去看展",
        intent: "周末去看一个展",
        status: "ready",
        ai_plan: {},
        created_at: "2026-03-29T00:00:00Z",
        updated_at: "2026-03-29T01:00:00Z",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("ready");
  });
});
