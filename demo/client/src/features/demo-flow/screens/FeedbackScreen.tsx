import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function FeedbackScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    setTimeout(onNext, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="活动反馈" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 完成横幅 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, oklch(var(--primary-lch) / 12%), oklch(var(--accent-lch) / 10%))", border: "1px solid oklch(var(--primary-lch) / 20%)" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none"><StarField /></div>
          <div className="relative z-10 p-5 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-heading font-bold text-base mb-1" style={{ color: "var(--foreground)" }}>{scenario.feedbackTitle}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.feedbackMeta}</p>
          </div>
        </motion.div>

        {/* 助力明细 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>助力方式</p>
          {scenario.supportDetails.map(r => (
            <div key={r.label} className="flex items-center gap-3 py-1.5">
              <span className="text-lg">{r.icon}</span>
              <div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full mr-2" style={{ background: "oklch(var(--primary-lch) / 10%)", color: "var(--primary)" }}>{r.label}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 评价搭子 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>{scenario.partnerLabel}</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="text-2xl transition-transform"
                  style={{ transform: (hoverRating || rating) >= i ? "scale(1.2)" : "scale(1)" }}
                >
                  <span style={{ color: (hoverRating || rating) >= i ? "var(--primary)" : "var(--border)" }}>★</span>
                </button>
              ))}
            </div>
            {rating > 0 && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{["", "很差", "一般", "还不错", "挺好的", "非常棒"][rating]}</span>}
          </div>
          <textarea
            placeholder="写几句评价，帮助下一个人做决定…"
            rows={3}
            className="w-full bg-transparent text-sm outline-none resize-none"
            style={{ color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px" }}
          />
        </motion.div>

        {/* 故事卡 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid oklch(var(--primary-lch) / 20%)" }}>
          <div className="absolute inset-0 pointer-events-none"><StarField /></div>
          <div className="relative z-10">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>生成心愿故事卡</p>
            <div className="rounded-xl p-3 mb-3" style={{ background: "oklch(var(--primary-lch) / 6%)" }}>
              <p className="font-heading font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>{scenario.storyCardTitle}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.storyCardMeta}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: shared ? "var(--accent)" : "var(--primary)", color: "var(--background)" }}
              >
                {shared ? "✓ 已分享漂流瓶" : "分享漂流瓶"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
                留作纪念
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
          className="w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: "var(--background)", boxShadow: "0 8px 24px var(--ring)" }}>
          完成，回到首页
        </motion.button>
      </div>
    </div>
  );
}
