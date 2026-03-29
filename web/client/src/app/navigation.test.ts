import { describe, expect, it } from "vitest";
import { primaryNavItems } from "./navigation";

describe("primaryNavItems", () => {
  it("defines the five primary product surfaces", () => {
    expect(primaryNavItems).toHaveLength(5);
    expect(primaryNavItems.map((item) => item.path)).toEqual([
      "/plaza",
      "/wish/new",
      "/wishes",
      "/notifications",
      "/me",
    ]);
    expect(primaryNavItems.map((item) => item.label)).toEqual([
      "广场",
      "发愿",
      "我的愿望",
      "通知",
      "我的",
    ]);
  });
});
