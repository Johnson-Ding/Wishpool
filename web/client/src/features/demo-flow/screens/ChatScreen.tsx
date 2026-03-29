import { useEffect, useMemo, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

type Message = { role: "ai" | "user"; text: string };

function buildChatFlow(scenario: WishScenario, wishInput: string) {
  const effectiveWish = wishInput.trim() || scenario.wishText;

  return [
    { aiMsg: "你好！说说你想实现什么心愿？随便说，我来帮你想清楚。", userReply: effectiveWish },
    { aiMsg: "收到，我先按这个心愿为你梳理方向。\n\n接下来我会结合你的偏好，继续生成执行方案。", userReply: "" },
  ];
}

export function ChatSheet({ scenario, wishInput, onWishInputChange, onComplete, onClose }: { scenario: WishScenario; wishInput: string; onWishInputChange: (value: string) => void; onComplete: () => void; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [autoProgress, setAutoProgress] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatFlow = useMemo(() => buildChatFlow(scenario, wishInput), [scenario, wishInput]);

  useEffect(() => {
    setMessages([]);
    setStep(0);
    setTyping(false);
    setAutoProgress(true);
  }, [chatFlow]);

  useEffect(() => {
    if (!autoProgress) return;
    if (step >= chatFlow.length) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }

    setTyping(true);
    const t1 = setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", text: chatFlow[step].aiMsg }]);
      if (chatFlow[step].userReply) {
        const t2 = setTimeout(() => {
          const reply = chatFlow[step].userReply;
          onWishInputChange(reply);
          setMessages(m => [...m, { role: "user", text: reply }]);
          setStep(s => s + 1);
        }, 1200);
        return () => clearTimeout(t2);
      }
      setStep(s => s + 1);
    }, 900);
    return () => clearTimeout(t1);
  }, [step, autoProgress, chatFlow, onComplete, onWishInputChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-end"
      style={{ background: "oklch(0 0 0 / 45%)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="w-full rounded-t-[28px] flex flex-col"
        style={{ background: "var(--card)", borderTop: "1px solid var(--border)", maxHeight: "65%" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-10 h-1 rounded-full absolute top-2 left-1/2 -translate-x-1/2" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI 帮你想清楚</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1">
                    <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: msg.role === "ai" ? "var(--secondary)" : "var(--primary)",
                    color: msg.role === "ai" ? "var(--foreground)" : "var(--primary-foreground)",
                    borderRadius: msg.role === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5" style={{ background: "var(--secondary)", borderRadius: "4px 16px 16px 16px" }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }}
                      animate={{ y: [0, -5, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 pb-5 pt-2 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex-1 rounded-2xl px-3.5 py-2.5 flex items-center" style={{ background: "var(--secondary)" }}>
            <input
              value={wishInput}
              onChange={e => {
                setAutoProgress(false);
                onWishInputChange(e.target.value);
              }}
              placeholder="回复..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <button
            onClick={onComplete}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)", color: "var(--background)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
