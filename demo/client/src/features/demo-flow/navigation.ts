import type { WishExecutionStatus } from "@/domains/wishflow/types";
import { DEMO_SCREEN_LABELS, DEMO_SCREEN_ORDER, DEMO_SCREEN_STATUS_MAP, type DemoScreen } from "./types";

export function getNextDemoScreen(current: DemoScreen): DemoScreen {
  const index = DEMO_SCREEN_ORDER.indexOf(current);
  return index >= 0 && index < DEMO_SCREEN_ORDER.length - 1
    ? DEMO_SCREEN_ORDER[index + 1]
    : current;
}

export function getPreviousDemoScreen(current: DemoScreen): DemoScreen {
  const index = DEMO_SCREEN_ORDER.indexOf(current);
  return index > 0 ? DEMO_SCREEN_ORDER[index - 1] : current;
}

export function getDemoScreenLabel(screen: DemoScreen): string {
  return DEMO_SCREEN_LABELS[screen];
}

export function getWishExecutionStatusFromScreen(screen: DemoScreen): WishExecutionStatus | null {
  if (screen === "splash" || screen === "home" || screen === "chat" || screen === "wishes" || screen === "paywall") {
    return null;
  }

  return DEMO_SCREEN_STATUS_MAP[screen] ?? null;
}
