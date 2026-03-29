import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function RoundUpdateScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [action, setAction] = useState<"none" | "continue" | "adjust">("none");

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar
        title="第 2 轮进展"
        onBack={onBack}
        right={
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.72 0.12 185 / 15%)", color: "var(--accent)" }}>
            进行中
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 总进度 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>总进度</p>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{scenario.roundProgress}</span>
          </div>
          <div className="h-2 rounded-full mb-1" style={{ background: "var(--border)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: scenario.roundProgress }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.roundEta}</p>
        </motion.div>

        {/* 已完成 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>已完成</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(var(--accent-lch) / 12%)", color: "var(--accent)" }}>本轮 2 项</span>
          </div>
          {scenario.roundCompleted.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < 1 ? "1px solid var(--border)" : "none" }}>
              <span className="text-base mt-0.5" style={{ color: "var(--accent)" }}>{item.icon}</span>
              <div>
                <p className="text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.src}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 下一步 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>下一步</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(var(--primary-lch) / 12%)", color: "var(--primary)" }}>需你确认</span>
          </div>
          {scenario.roundNext.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < 1 ? "1px solid var(--border)" : "none" }}>
              <span className="text-base mt-0.5" style={{ color: item.urgent ? "var(--primary)" : "var(--muted-foreground)" }}>{item.icon}</span>
              <div>
                <p className="text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.src}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 资源状态 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-4">
          <p className="font-heading font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>资源状态</p>
          {scenario.resources.map(r => (
            <div key={r.name} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.name}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{
                background: r.ok ? "oklch(0.72 0.12 185 / 12%)" : "oklch(var(--primary-lch) / 10%)",
                color: r.ok ? "var(--accent)" : "var(--primary)",
              }}>{r.status}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 操作按钮 */}
      <div className="px-5 pb-5 pt-2 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setAction("continue"); setTimeout(onNext, 400); }}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: action === "continue" ? "var(--primary)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: "var(--background)", boxShadow: "0 6px 20px var(--ring)" }}
        >
          确认继续
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setAction("adjust")}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: "var(--secondary)", color: "var(--foreground)" }}
        >
          调整条件
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="px-3 py-3.5 rounded-2xl text-sm"
          style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
        >
          暂停
        </motion.button>
      </div>
    </div>
  );
}

// ── US-04：深度调研候选搭子 ────────────────────────────────────
