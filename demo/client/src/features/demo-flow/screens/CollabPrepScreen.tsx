import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function CollabPrepScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [timeChoice, setTimeChoice] = useState(scenario.timeOptions[0]?.key || "default-time");
  const [placeChoice, setPlaceChoice] = useState(scenario.placeOptions[0]?.key || "default-place");
  const [rules, setRules] = useState({ r1: false, r2: false, r3: false });
  const [paying, setPaying] = useState(false);

  const allRules = rules.r1 && rules.r2 && rules.r3;

  const handlePay = () => {
    if (!allRules) return;
    setPaying(true);
    setTimeout(() => { setPaying(false); onNext(); }, 1800);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title={scenario.collabTitle} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 进度 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>心愿进度</p>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>65%</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: "var(--border)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>搭子已确认 · 进入筹备阶段</p>
        </motion.div>

        {/* 参与人 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>参与人</p>
          {scenario.participants.map((p, index) => (
            <div key={p.name} className="flex items-center gap-3 py-1.5">
              <span className="text-xl">{p.emoji}</span>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>{index === 0 ? "发起人" : p.status}</span>
            </div>
          ))}
        </motion.div>

        {/* 待确认 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>待确认事项</p>
          <p className="text-xs mb-2" style={{ color: "var(--foreground)" }}>出发时间</p>
          {[
            { key: "dec28", label: "12月28日（周六）早8点" },
            { key: "dec29", label: "12月29日（周日）早9点" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setTimeChoice(opt.key)}
              className="flex items-center gap-2.5 w-full py-2 text-sm"
              style={{ color: timeChoice === opt.key ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: timeChoice === opt.key ? "var(--primary)" : "var(--muted-foreground)" }}>
                {timeChoice === opt.key && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
              </div>
              {opt.label}
              {timeChoice === opt.key && <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓ 多数</span>}
            </button>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
          <p className="text-xs mb-2" style={{ color: "var(--foreground)" }}>集合地点</p>
          {scenario.placeOptions.map(opt => (
            <button key={opt.key} onClick={() => setPlaceChoice(opt.key)}
              className="flex items-center gap-2.5 w-full py-2 text-sm"
              style={{ color: placeChoice === opt.key ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: placeChoice === opt.key ? "var(--primary)" : "var(--muted-foreground)" }}>
                {placeChoice === opt.key && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
              </div>
              {opt.label}
              {placeChoice === opt.key && <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓ 多数</span>}
            </button>
          ))}
        </motion.div>

        {/* 费用明细 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>费用明细</p>
          {scenario.costs.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{r.label}</p>
                {r.sub && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.sub}</p>}
              </div>
              <span className="text-sm font-semibold" style={{ color: r.amount === "0 元" ? "var(--accent)" : "var(--foreground)" }}>{r.amount}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
          <div className="flex items-center justify-between">
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>合计</span>
            <span className="font-heading font-bold text-lg gold-text">{scenario.totalCost}</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{scenario.splitNote}</p>
        </motion.div>

        {/* 规则确认 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>规则确认（必须全部勾选）</p>
          {[
            { key: "r1" as const, label: "临时退出需提前24h通知" },
            { key: "r2" as const, label: "平台担保支付，活动后释放" },
            { key: "r3" as const, label: "如遇变更AI自动启动补位" },
          ].map(r => (
            <button key={r.key} onClick={() => setRules(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
              className="flex items-center gap-3 w-full py-2">
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: rules[r.key] ? "var(--primary)" : "transparent",
                  border: `2px solid ${rules[r.key] ? "var(--primary)" : "var(--muted-foreground)"}`,
                }}>
                {rules[r.key] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--background)" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>}
              </div>
              <span className="text-sm text-left" style={{ color: "var(--foreground)" }}>{r.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* 支付按钮 */}
      <div className="px-5 pb-5 pt-2">
        <motion.button
          whileTap={allRules ? { scale: 0.97 } : {}}
          onClick={handlePay}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: !allRules ? "oklch(0.25 0.02 265)" : paying ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: !allRules ? "var(--muted-foreground)" : paying ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: allRules && !paying ? "0 8px 24px var(--ring)" : "none",
          }}
        >
          {paying ? (
            <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>支付中...</span></>
          ) : !allRules ? "请先确认全部规则" : "确认并支付锁定 →"}
        </motion.button>
        {allRules && <p className="text-center text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>支付后可随时查看履约进度</p>}
      </div>
    </div>
  );
}

// ── US-06：活动履约 + 异常处理 + 反馈 ─────────────────────────
