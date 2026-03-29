import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function PaywallScreen({ onJoin, onBack }: { onJoin: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleJoin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onJoin(); }, 1600);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <div className="flex-1 flex flex-col overflow-y-auto px-5">
        {/* 顶部关闭 */}
        <div className="flex justify-end pt-2 pb-4">
          <button onClick={onBack} className="p-1.5 rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 许愿池封面区 */}
        <div className="relative rounded-3xl overflow-hidden mb-6" style={{ height: 160, background: "var(--secondary)" }}>
          <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${MOON_BG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, oklch(0.11 0.025 265 / 70%))" }} />
          <StarField />
          <div className="absolute bottom-4 left-5">
            <div className="w-12 h-12 rounded-full overflow-hidden mb-2 moon-pulse">
              <img src={MOON_AVATAR} alt="许愿池" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-4 right-5 text-right">
            <p className="font-heading text-2xl font-bold gold-text">¥10</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ 月 · 随时取消</p>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="font-heading text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>开通会员，解锁许愿能力</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>AI 帮你规划、执行、跟进，直到心愿实现</p>
        </div>

        {/* 权益列表 */}
        <div className="flex flex-col gap-3 mb-6">
          {[
            { icon: "🎯", title: "发布心愿", desc: "AI 直出完整执行方案，你只需确认关键决策" },
            { icon: "🎟️", title: "资源助力", desc: "买票、预约、核验，平台全程协助" },
            { icon: "🤝", title: "人群助力", desc: "AI按人群画像发邀约，匹配同频搭子" },
            { icon: "📍", title: "每2天跟进", desc: "轮次更新心愿进度，卡点主动通知" },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 glass-card rounded-2xl p-4">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
              </div>
              <span className="ml-auto mt-0.5 text-lg">✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部按钮区 */}
      <div className="px-5 pb-6 pt-2 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: loading ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: loading ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: loading ? "none" : "0 8px 24px var(--ring)",
          }}
        >
          {loading ? (
            <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>开通中...</span></>
          ) : (
            <span>立即开通 · ¥10/月</span>
          )}
        </motion.button>
        <button onClick={onBack} className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          先逛逛，暂不开通
        </button>
      </div>
    </div>
  );
}
