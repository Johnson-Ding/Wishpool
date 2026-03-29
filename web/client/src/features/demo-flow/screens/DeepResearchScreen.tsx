import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function DeepResearchScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [decided, setDecided] = useState(false);

  const handleEnter = () => { setDecided(true); setTimeout(onNext, 600); };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="深度调研" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 候选人摘要 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>候选人摘要</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "var(--secondary)" }}>
              {scenario.candidate.emoji}
            </div>
            <div>
              <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{scenario.candidate.title}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.candidate.subtitle}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: "82%", background: "linear-gradient(90deg, var(--accent), var(--primary))" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{scenario.candidate.match}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 站内行为 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>站内行为</p>
          {scenario.behaviorStats.map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{r.label}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{r.value}</span>
            </div>
          ))}
        </motion.div>

        {/* 被评价记录 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs font-semibold px-4 pt-4 pb-2" style={{ color: "var(--muted-foreground)" }}>被评价记录</p>
          {[
            { text: "\"准时靠谱，沟通顺畅\"", sub: "户外搭子 · 2025.11" },
            { text: "\"有自己节奏，不强迫他人\"", sub: "旅行搭子 · 2025.09" },
          ].map((r, i) => (
            <div key={i} className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{r.text}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* AI风险摘要 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>AI 风险摘要</p>
          {scenario.risks.map(r => (
            <div key={r.text} className="flex items-center gap-2 py-1">
              <span className="text-sm" style={{ color: r.ok === true ? "var(--accent)" : r.ok === false ? "var(--destructive)" : "var(--primary)" }}>{r.icon}</span>
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 决策按钮 */}
      <div className="px-5 pb-5 pt-2 flex gap-3">
        <motion.button whileTap={{ scale: 0.96 }} className="flex-1 py-3.5 rounded-2xl text-sm" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
          更换候选人
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={handleEnter} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: decided ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: decided ? "var(--muted-foreground)" : "var(--background)", boxShadow: decided ? "none" : "0 6px 20px var(--ring)" }}>
          {decided ? "进入中..." : "进入协同 →"}
        </motion.button>
      </div>
    </div>
  );
}

// ── US-05：协同筹备 + 支付锁定 ────────────────────────────────
