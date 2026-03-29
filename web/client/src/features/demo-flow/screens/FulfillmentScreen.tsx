import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function FulfillmentScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [tab, setTab] = useState<"itinerary" | "exception">("itinerary");

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="活动履约" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 进度 */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>心愿进度</p>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>85%</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: "var(--border)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--accent)" }}>活动进行中 · 今天出发</p>
        </div>

        {/* Tab */}
        <div className="flex gap-2">
          {[
            { key: "itinerary", label: "今日行程" },
            { key: "exception", label: "异常处理" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t.key ? "var(--primary)" : "var(--secondary)",
                color: tab === t.key ? "var(--background)" : "var(--muted-foreground)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "itinerary" ? (
            <motion.div key="it" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-3">
              {/* 行程时间轴 */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>今日行程</p>
                {scenario.itinerary.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="flex flex-col items-center" style={{ minWidth: 16 }}>
                      <div className="w-3 h-3 rounded-full mt-1" style={{
                        background: item.done ? "var(--accent)" : item.active ? "var(--primary)" : "var(--border)",
                      }} />
                      {i < 3 && <div className="w-0.5 h-5 mt-1" style={{ background: item.done ? "var(--accent)" : "var(--border)" }} />}
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.time}</p>
                      <p className="text-sm" style={{ color: item.active ? "var(--primary)" : "var(--foreground)", fontWeight: item.active ? 600 : 400 }}>{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* 参与人状态 */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>参与人状态</p>
                {scenario.participants.map(p => (
                  <div key={p.name} className="flex items-center gap-3 py-1.5">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>{p.name}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.72 0.12 185 / 12%)", color: "var(--accent)" }}>{p.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="ex" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3">
              {/* 搭子退出 */}
              <div className="rounded-2xl p-4" style={{ background: "oklch(var(--primary-lch) / 8%)", border: "1px solid oklch(var(--primary-lch) / 25%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "var(--primary)" }}>!</span>
                  <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>{scenario.exceptionTitle}</p>
                </div>
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{scenario.exceptionDesc}</p>
                <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>{scenario.exceptionEta}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl text-xs" style={{ background: "var(--primary)", color: "var(--background)" }}>{scenario.exceptionActions[0]}</button>
                  <button className="flex-1 py-2 rounded-xl text-xs" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>{scenario.exceptionActions[1]}</button>
                </div>
              </div>
              {/* 核验失败 */}
              <div className="rounded-2xl p-4" style={{ background: "oklch(var(--destructive) / 8%)", border: "1px solid oklch(var(--destructive) / 25%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "var(--destructive)" }}>!</span>
                  <p className="text-sm font-semibold" style={{ color: "var(--destructive)" }}>票务核验失败</p>
                </div>
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>入场核验未通过</p>
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>原因：订单信息不匹配</p>
                <p className="text-xs mb-3" style={{ color: "var(--accent)" }}>AI 已联系平台处理 · 预计 15 分钟内解决</p>
                <button className="px-4 py-2 rounded-xl text-xs" style={{ background: "oklch(var(--destructive) / 15%)", color: "var(--destructive)" }}>联系客服</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pb-5 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
          className="w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: "var(--background)", boxShadow: "0 8px 24px var(--ring)" }}>
          活动完成，提交反馈 →
        </motion.button>
      </div>
    </div>
  );
}

// ── 反馈 + 故事卡（活动结束）─────────────────────────────────
