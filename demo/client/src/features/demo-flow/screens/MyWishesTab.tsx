import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CharacterContext, getCharacterAvatar } from "../shared";
import { ThemeSelector } from "@/components/ThemeSelector";
import { SettingsPanel } from "@/features/settings/SettingsPanel";

// Status color mapping to CSS variables
const getStatusColor = (status: WishStatus) => {
  switch (status) {
    case "pending": return "var(--warning)";
    case "in_progress": return "var(--success)";
    case "completed": return "var(--accent)";
    default: return "var(--muted-foreground)";
  }
};

// ── Mock 数据 ────────────────────────────────────────────────────
type WishStatus = "pending" | "in_progress" | "completed";

interface MockWish {
  id: string;
  title: string;
  icon: string;
  status: WishStatus;
  statusLabel: string;
  summary: string;
  date: string;
}

const MOCK_WISHES: MockWish[] = [
  {
    id: "w1",
    title: "周末去滑雪",
    icon: "⛷️",
    status: "pending",
    statusLabel: "方案待确认",
    summary: "AI 已生成 3 个滑雪方案，等待你选择",
    date: "3月22日",
  },
  {
    id: "w2",
    title: "带爸妈短途旅行",
    icon: "🏡",
    status: "pending",
    statusLabel: "需补充信息",
    summary: "请确认出行日期和预算范围",
    date: "3月24日",
  },
  {
    id: "w3",
    title: "海边吹吹风",
    icon: "🌊",
    status: "in_progress",
    statusLabel: "执行中",
    summary: "已预订民宿，正在确认交通方案",
    date: "3月20日",
  },
  {
    id: "w4",
    title: "看个展",
    icon: "🎨",
    status: "completed",
    statusLabel: "已完成",
    summary: "UCCA 当代艺术展 · 已生成回顾故事卡",
    date: "3月15日",
  },
];

// ── 组件 ─────────────────────────────────────────────────────────
export function MyWishesTab() {
  const { character } = useContext(CharacterContext);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const avatar = getCharacterAvatar(character);

  const pendingWishes = MOCK_WISHES.filter((w) => w.status === "pending");
  const otherWishes = MOCK_WISHES.filter((w) => w.status !== "pending");

  const renderWishCard = (wish: MockWish) => {
    const isPending = wish.status === "pending";
    const isExpanded = expandedId === wish.id;

    return (
      <motion.div
        key={wish.id}
        layout
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpandedId(isExpanded ? null : wish.id)}
        className="rounded-2xl p-4 cursor-pointer transition-colors"
        style={{
          background: isPending
            ? `linear-gradient(135deg, ${getStatusColor(wish.status)}08, ${getStatusColor(wish.status)}04)`
            : "var(--card)",
          border: isPending
            ? `1px solid ${getStatusColor(wish.status)}30`
            : "1px solid var(--border)",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: "var(--secondary)" }}
          >
            {wish.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4
                className="text-sm font-semibold truncate"
                style={{ color: "var(--foreground)" }}
              >
                {wish.title}
              </h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                style={{
                  background: `${getStatusColor(wish.status)}18`,
                  color: getStatusColor(wish.status),
                }}
              >
                {wish.statusLabel}
              </span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              {wish.summary}
            </p>
            <p
              className="text-xs mt-1.5"
              style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
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
              <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                {isPending ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{
                        background: getStatusColor(wish.status),
                        color: "var(--foreground)",
                      }}
                    >
                      去处理
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="py-2 px-4 rounded-xl text-xs"
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
                    className="flex-1 py-2 rounded-xl text-xs"
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

      {/* Settings panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden">
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <span
            className="font-heading font-semibold text-sm"
            style={{ color: "var(--foreground)" }}
          >
            我的愿望
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThemeSelector(true)}
            className="p-1.5 rounded-full"
            style={{ color: "var(--muted-foreground)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-full"
            style={{ color: "var(--muted-foreground)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="2" />
              <path d="M12 1v6m0 6v10M1 12h6m6 0h10" />
              <path d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" />
            </svg>
          </button>
        </div>
      </div>

      {/* Wish list */}
      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
        {/* 待决策 */}
        {pendingWishes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                待决策
              </span>
              <span
                className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)", fontSize: "10px" }}
              >
                {pendingWishes.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {pendingWishes.map(renderWishCard)}
            </div>
          </div>
        )}

        {/* 进行中 · 已完成 */}
        {otherWishes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--muted-foreground)" }}
              >
                进行中 · 已完成
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {otherWishes.map(renderWishCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
