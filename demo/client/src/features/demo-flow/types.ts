import type { WishExecutionStatus } from "@/domains/wishflow/types";

export type CharacterType = "moon" | "star" | "cloud";

export type DemoScreen =
  | "splash"
  | "home"
  | "chat"
  | "wishes"
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
  "chat",
  "wishes",
];

export const DEMO_SCREEN_LABELS: Record<DemoScreen, string> = {
  splash: "",
  home: "许愿池广场",
  chat: "许愿池群聊",
  wishes: "我的愿望",
  paywall: "Phase 2 预留",
  "ai-plan": "Phase 2 预留",
  "round-update": "Phase 2 预留",
  "deep-research": "Phase 2 预留",
  "collab-prep": "Phase 2 预留",
  fulfillment: "Phase 2 预留",
  feedback: "Phase 2 预留",
};

export const DEMO_SCREEN_STATUS_MAP: Partial<Record<DemoScreen, WishExecutionStatus>> = {};
