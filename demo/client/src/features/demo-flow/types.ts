import type { WishExecutionStatus } from "@/domains/wishflow/types";

export type CharacterType = "moon" | "star" | "cloud";

export type DemoScreen =
  | "splash"
  | "home"
  | "paywall"
  | "ai-plan"
  | "round-update"
  | "deep-research"
  | "collab-prep"
  | "fulfillment"
  | "feedback";

export const DEMO_SCREEN_ORDER: DemoScreen[] = [
  "splash",
  "home",
  "paywall",
  "ai-plan",
  "round-update",
  "deep-research",
  "collab-prep",
  "fulfillment",
  "feedback",
];

export const DEMO_SCREEN_LABELS: Record<DemoScreen, string> = {
  splash: "",
  home: "许愿池 V2.0 Demo",
  paywall: "付费墙 US-07",
  "ai-plan": "AI出方案 US-01",
  "round-update": "轮次更新 US-02",
  "deep-research": "深度调研 US-04",
  "collab-prep": "协同筹备 US-05",
  fulfillment: "活动履约 US-06",
  feedback: "反馈故事卡",
};

export const DEMO_SCREEN_STATUS_MAP: Record<Exclude<DemoScreen, "splash" | "home" | "paywall">, WishExecutionStatus> = {
  "ai-plan": "planning",
  "round-update": "validating",
  "deep-research": "validating",
  "collab-prep": "locking",
  fulfillment: "in_progress",
  feedback: "completed",
};
