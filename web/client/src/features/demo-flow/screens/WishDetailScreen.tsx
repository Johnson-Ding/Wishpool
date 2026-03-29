import { useState } from "react";
import { motion } from "framer-motion";
import { NavBar, StatusBar } from "../shared";
import type { WishScenario } from "../data";

type WishStatus = "pending" | "in_progress" | "completed";

export interface WishDetailData {
  id: string;
  title: string;
  icon: string;
  status: WishStatus;
  statusLabel: string;
  summary: string;
  date: string;
  scenarioId: number;
}

const getStatusColor = (status: WishStatus) => {
  switch (status) {
    case "pending": return "var(--warning)";
    case "in_progress": return "var(--success)";
    case "completed": return "var(--accent)";
    default: return "var(--muted-foreground)";
  }
};

interface WishDetailScreenProps {
  wish: WishDetailData;
  scenario: WishScenario;
  onBack: () => void;
  onGoToPlan: (scenarioId: number) => void;
}

export function WishDetailScreen({ wish, scenario, onBack, onGoToPlan }: WishDetailScreenProps) {
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarifyFields, setClarifyFields] = useState({
    intent: "",
    city: "",
    budget: "",
    timeWindow: "",
  });
  const [clarifySubmitted, setClarifySubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const isPending = wish.status === "pending";
  const isCompleted = wish.status === "completed";

  const handleClarifySubmit = () => {
    setClarifySubmitted(true);
    setTimeout(() => setClarifyOpen(false), 600);
  };

  const handleConfirmPlan = () => {
    setConfirmed(true);
    setTimeout(() => onGoToPlan(wish.scenarioId), 600);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar
        title="愿望详情"
        onBack={onBack}
        right={
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: `${getStatusColor(wish.status)}18`,
              color: getStatusColor(wish.status),
            }}
          >
            {wish.statusLabel}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
        {/* ── 愿望头部卡片 ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--secondary)" }}
            >
              {wish.icon}
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-semibold text-base mb-1" style={{ color: "var(--foreground)" }}>
                {wish.title}
              </h2>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{wish.date}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            {scenario.wishText}
          </p>
        </motion.div>

        {/* ── AI 方案摘要 ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              AI 执行方案
            </p>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {scenario.durationText}
            </span>
          </div>
          {scenario.planSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3"
              style={{
                borderBottom: i < scenario.planSteps.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                className="text-sm font-semibold w-5 mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                {step.num}
              </span>
              <div className="flex-1">
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{step.title}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${step.typeColor}18`, color: step.typeColor }}
                >
                  {step.type}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── 推进轮次（非 completed 时显示） ── */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                推进轮次
              </p>
              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                {scenario.roundProgress}
              </span>
            </div>
            {/* 进度条 */}
            <div className="h-2 rounded-full mb-3" style={{ background: "var(--border)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: scenario.roundProgress }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
              />
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              {scenario.roundEta}
            </p>

            {/* 已完成项 */}
            {scenario.roundCompleted.map((item, i) => (
              <div key={`done-${i}`} className="flex items-start gap-2.5 py-2">
                <span className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: "var(--foreground)" }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>{item.src}</p>
                </div>
              </div>
            ))}

            {/* 下一步 */}
            {scenario.roundNext.map((item, i) => (
              <div key={`next-${i}`} className="flex items-start gap-2.5 py-2">
                <span
                  className="text-xs mt-0.5"
                  style={{ color: item.urgent ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: "var(--foreground)" }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>{item.src}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── 资源状态 ── */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-4"
          >
            <p className="font-heading font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>
              资源状态
            </p>
            {scenario.resources.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-1.5">
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.name}</span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: r.ok ? "oklch(0.72 0.12 185 / 12%)" : "oklch(var(--primary-lch) / 10%)",
                    color: r.ok ? "var(--accent)" : "var(--primary)",
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── 澄清表单（pending 状态可展开） ── */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-4"
          >
            <button
              onClick={() => setClarifyOpen(!clarifyOpen)}
              className="flex items-center justify-between w-full"
            >
              <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                补充关键信息
              </p>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                style={{
                  transform: clarifyOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {clarifyOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-3 flex flex-col gap-3"
              >
                {[
                  { key: "intent" as const, label: "愿望描述", placeholder: "更具体地描述你想要的..." },
                  { key: "city" as const, label: "城市", placeholder: "你在哪座城市？" },
                  { key: "budget" as const, label: "预算", placeholder: "大概预算范围" },
                  { key: "timeWindow" as const, label: "时间窗口", placeholder: "希望什么时候完成？" },
                ].map((field) => (
                  <div key={field.key}>
                    <label
                      className="text-xs mb-1 block"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={clarifyFields[field.key]}
                      onChange={(e) =>
                        setClarifyFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        background: "var(--secondary)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                ))}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClarifySubmit}
                  className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
                  style={{
                    background: clarifySubmitted
                      ? "var(--accent)"
                      : "linear-gradient(135deg, var(--accent), oklch(0.72 0.15 185))",
                    color: "var(--background)",
                  }}
                >
                  {clarifySubmitted ? "已保存 ✓" : "保存澄清"}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── 完成摘要（completed 状态显示） ── */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4"
          >
            <p className="font-heading font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>
              完成回顾
            </p>
            <p className="text-sm mb-2" style={{ color: "var(--foreground)" }}>
              {scenario.feedbackTitle}
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              {scenario.feedbackMeta}
            </p>
            {scenario.supportDetails.map((detail, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5">
                <span className="text-base">{detail.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                    {detail.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {detail.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── 底部操作区 ── */}
      <div className="px-5 pb-5 pt-2 flex gap-2">
        {isPending && (
          <>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleConfirmPlan}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
              style={{
                background: confirmed
                  ? "var(--primary)"
                  : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
                color: "var(--background)",
                boxShadow: "0 6px 20px var(--ring)",
              }}
            >
              {confirmed ? "跳转中..." : "确认方案，开始推进"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="px-4 py-3.5 rounded-2xl text-sm"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              onClick={onBack}
            >
              稍后
            </motion.button>
          </>
        )}
        {wish.status === "in_progress" && (
          <>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onGoToPlan(wish.scenarioId)}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
                color: "var(--background)",
                boxShadow: "0 6px 20px var(--ring)",
              }}
            >
              查看推进详情
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="px-4 py-3.5 rounded-2xl text-sm"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
            >
              暂停
            </motion.button>
          </>
        )}
        {isCompleted && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onGoToPlan(wish.scenarioId)}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--accent), oklch(0.72 0.15 185))",
              color: "var(--background)",
            }}
          >
            查看故事卡
          </motion.button>
        )}
      </div>
    </div>
  );
}
