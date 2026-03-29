export type WishStage = "draft" | "clarifying" | "planning" | "ready";

export function deriveWishStage(status: string | null | undefined): WishStage {
  if (!status) return "draft";
  if (status === "clarifying") return "clarifying";
  if (status === "planning") return "planning";
  if (status === "ready") return "ready";
  return "draft";
}

export function getStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "clarifying":
      return "需要补充信息";
    case "planning":
      return "方案待确认";
    case "ready":
      return "准备开始";
    default:
      return "开始发愿";
  }
}
