import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CharacterContext, getCharacterAvatar } from "../shared";
import { ThemeSelector } from "@/components/ThemeSelector";
import type { WishDetailData } from "./WishDetailScreen";

// Status color mapping to CSS variables
type WishStatus = "pending" | "in_progress" | "completed";

const getStatusColor = (status: WishStatus) => {
  switch (status) {
    case "pending": return "var(--warning)";
    case "in_progress": return "var(--success)";
    case "completed": return "var(--accent)";
    default: return "var(--muted-foreground)";
  }
};

// ── Mock 数据（关联 scenarioId 用于详情页） ──────────────────────
export const MOCK_WISHES: WishDetailData[] = [
  {
    id: "w1",
    title: "周末去滑雪",
    icon: "⛷️",
    status: "pending",
    statusLabel: "方案待确认",
    summary: "AI 已生成 3 个滑雪方案，等待你选择",
    date: "3月22日",
    scenarioId: 2,
  },
  {
    id: "w2",
    title: "带爸妈短途旅行",
    icon: "🏡",
    status: "pending",
    statusLabel: "需补充信息",
    summary: "请确认出行日期和预算范围",
    date: "3月24日",
    scenarioId: 7,
  },
  {
    id: "w3",
    title: "海边吹吹风",
    icon: "🌊",
    status: "in_progress",
    statusLabel: "执行中",
    summary: "已预订民宿，正在确认交通方案",
    date: "3月20日",
    scenarioId: 1,
  },
  {
    id: "w4",
    title: "看个展",
    icon: "🎨",
    status: "completed",
    statusLabel: "已完成",
    summary: "UCCA 当代艺术展 · 已生成回顾故事卡",
    date: "3月15日",
    scenarioId: 4,
  },
];

// ── 组件 ─────────────────────────────────────────────────────────
interface MyWishesTabProps {
  onOpenWish?: (wish: WishDetailData) => void;
}

export function MyWishesTab({ onOpenWish }: MyWishesTabProps) {
  const { character } = useContext(CharacterContext);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const avatar = getCharacterAvatar(character);

  const pendingWishes = MOCK_WISHES.filter((w) => w.status === "pending");
  const otherWishes = MOCK_WISHES.filter((w) => w.status !== "pending");

  const renderWishCard = (wish: WishDetailData) => {
    const isPending = wish.status === "pending";
    const isExpanded = expandedId === wish.id;

    return (
      <motion.div
        key={wish.id}
        layout
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setExpandedId(isExpanded ? null : wish.id)}
        className="rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
        style={{
          background: isPending
            ? `linear-gradient(135deg, ${getStatusColor(wish.status)}08, ${getStatusColor(wish.status)}04)`
            : "var(--card)",
          border: isPending
            ? `1px solid ${getStatusColor(wish.status)}30`
            : "1px solid var(--border)",
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: "var(--secondary)" }}
          >
            {wish.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h4
                className="text-base font-semibold truncate"
                style={{ color: "var(--foreground)" }}
              >
                {wish.title}
              </h4>
              <span
                className="text-xs px-3 py-1 rounded-full shrink-0 font-medium"
                style={{
                  background: `${getStatusColor(wish.status)}18`,
                  color: getStatusColor(wish.status),
                }}
              >
                {wish.statusLabel}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              {wish.summary}
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--muted-foreground)", opacity: 0.7 }}
            >
              {wish.date}
            </p>
          </div>
        </div>

        {/* Expanded actions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                {isPending ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => { e.stopPropagation(); onOpenWish?.(wish); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: getStatusColor(wish.status),
                        color: "var(--foreground)",
                      }}
                    >
                      去处理
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                      className="py-2.5 px-6 rounded-xl text-sm"
                      style={{
                        background: "var(--secondary)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      稍后
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => { e.stopPropagation(); onOpenWish?.(wish); }}
                    className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--foreground)",
                    }}
                  >
                    查看详情
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: "var(--background)" }}>
      {/* Theme selector */}
      <ThemeSelector open={showThemeSelector} onClose={() => setShowThemeSelector(false)} />

      {/* Wish list - 全宽容器 */}
      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "none" }}>
        {/* 待决策 */}
        {pendingWishes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 px-2">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                待决策
              </span>
              <span
                className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)", fontSize: "11px" }}
              >
                {pendingWishes.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingWishes.map(renderWishCard)}
            </div>
          </div>
        )}

        {/* 进行中 · 已完成 */}
        {otherWishes.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4 px-2">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--muted-foreground)" }}
              >
                进行中 · 已完成
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {otherWishes.map(renderWishCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
