import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";
import type { GeneratedPlan } from "@/lib/agent-api";

export function AiPlanScreen({
  onNext,
  onBack,
  scenario,
  generatedPlan
}: {
  onNext: () => void;
  onBack: () => void;
  scenario: WishScenario;
  generatedPlan?: GeneratedPlan | null;
}) {
  // 优先使用动态方案，回退到静态方案
  const activePlan = generatedPlan || {
    wishText: scenario.wishText,
    durationText: scenario.durationText,
    decisionTitle: scenario.decisionTitle,
    decisionOptions: scenario.decisionOptions,
    planSteps: scenario.planSteps
  };

  const [headcount, setHeadcount] = useState<string>(activePlan.decisionOptions[0]?.key || "solo");
  const [confirmed, setConfirmed] = useState(false);

  const steps = activePlan.planSteps;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onNext, 800);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar
        title="AI 为你制定方案"
        onBack={onBack}
        right={
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(var(--accent-lch) / 15%)", color: "var(--accent)" }}>
            已规划
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 心愿卡 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4"
        >
          <p className="text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            {generatedPlan ? "你的心愿 · AI 个性化方案" : "你的心愿"}
          </p>
          <p className="font-heading font-semibold" style={{ color: "var(--foreground)" }}>
            {activePlan.wishText}
          </p>
        </motion.div>

        {/* 方案卡 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              完整执行方案 · 共 {steps.length} 步
            </p>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{activePlan.durationText}</span>
          </div>
          {steps.map((s, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3" style={{
              borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span className="text-sm font-semibold w-5 mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.num}</span>
              <div className="flex-1">
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{s.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.desc}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: `${s.typeColor}18`, color: s.typeColor,
                  }}>{s.type}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* AI 决策问题 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{activePlan.decisionTitle}</p>
          </div>
          <div className="flex flex-col gap-2">
            {activePlan.decisionOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setHeadcount(opt.key as typeof headcount)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{
                  background: headcount === opt.key ? "oklch(var(--primary-lch) / 12%)" : "var(--secondary)",
                  border: headcount === opt.key ? "1.5px solid oklch(var(--primary-lch) / 50%)" : "1.5px solid transparent",
                  color: "var(--foreground)",
                }}
              >
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: headcount === opt.key ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {headcount === opt.key && (
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                  )}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 确认按钮 */}
      <div className="px-5 pb-5 pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: confirmed ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: confirmed ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: confirmed ? "none" : "0 8px 24px var(--ring)",
          }}
        >
          {confirmed ? (
            <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>启动执行中...</span></>
          ) : "确认，开始执行 →"}
        </motion.button>
      </div>
    </div>
  );
}

// ── US-02：执行轮次更新 ────────────────────────────────────────
