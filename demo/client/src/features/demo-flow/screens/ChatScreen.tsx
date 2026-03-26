import { useEffect, useMemo, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

type Message = { role: "ai" | "user"; text: string };

function buildChatFlow(scenario: WishScenario, wishInput: string) {
  const effectiveWish = wishInput.trim() || scenario.wishText;

  return [
    { aiMsg: "你好！说说你想实现什么心愿？随便说，我来帮你想清楚。", userReply: effectiveWish },
    { aiMsg: "收到，我先按这个心愿为你梳理方向。\n\n接下来我会结合你的偏好，继续生成执行方案。", userReply: "" },
  ];
}

export function ChatScreen({ scenario, wishInput, onWishInputChange, onSubmitWish, onBack }: { scenario: WishScenario; wishInput: string; onWishInputChange: (value: string) => void; onSubmitWish: () => void; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [autoProgress, setAutoProgress] = useState(true);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatFlow = useMemo(() => buildChatFlow(scenario, wishInput), [scenario, wishInput]);

  const handleMic = () => {
    setRecording(r => !r);
    if (!recording) {
      setTimeout(() => {
        const nextWishInput = wishInput.trim() || "我想去崇礼滑雪，找个有车的搭子";
        setRecording(false);
        onWishInputChange(nextWishInput);
      }, 2000);
    }
  };

  useEffect(() => {
    setMessages([]);
    setStep(0);
    setTyping(false);
    setAutoProgress(true);
  }, [chatFlow]);

  useEffect(() => {
    if (!autoProgress) return;
    if (step >= chatFlow.length) {
      const timer = setTimeout(onSubmitWish, 600);
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
  }, [step, autoProgress, chatFlow, onSubmitWish, onWishInputChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="说出你的心愿" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                  <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
                </div>
              )}
              <div
                className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === "ai" ? "var(--card)" : "var(--primary)",
                  color: msg.role === "ai" ? "var(--foreground)" : "var(--primary-foreground)",
                  borderRadius: msg.role === "ai" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                  whiteSpace: "pre-line",
                }}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ borderRadius: "4px 18px 18px 18px" }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }}
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-5 pt-2 flex items-center gap-2">
        <div className="flex-1 glass-card rounded-2xl px-4 py-3 flex items-center gap-2">
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
          {recording && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#f87171" }}
            />
          )}
        </div>
        <motion.button
          onClick={handleMic}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center recording-pulse"
          style={{
            background: recording
              ? "linear-gradient(135deg, #f87171, #ef4444)"
              : "var(--primary)",
            color: "var(--background)",
            boxShadow: recording ? "0 0 16px oklch(0.55 0.22 25 / 60%)" : undefined,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </motion.button>
        <button
          onClick={onSubmitWish}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
