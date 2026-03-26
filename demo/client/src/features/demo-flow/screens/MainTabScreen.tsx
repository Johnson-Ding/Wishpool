import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../shared";
import { HomeScreen } from "./HomeScreen";
import { MyWishesTab } from "./MyWishesTab";

type TabId = "square" | "wishes";

interface MainTabScreenProps {
  isMember: boolean;
  onWishClick: () => void;
  onDoSameClick: (bottleId: number) => void;
}

export function MainTabScreen({ isMember, onWishClick, onDoSameClick }: MainTabScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("square");
  const [showPublisher, setShowPublisher] = useState(false);
  const [publisherInput, setPublisherInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const pendingCount = 2; // mock badge count

  // 模拟逐字转写
  const MOCK_TRANSCRIPT = "我想去海边放松一下";
  const transcriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTranscribing = () => {
    setIsRecording(true);
    setPublisherInput("");
    let charIndex = 0;
    const tick = () => {
      if (charIndex < MOCK_TRANSCRIPT.length) {
        charIndex++;
        setPublisherInput(MOCK_TRANSCRIPT.slice(0, charIndex));
        transcriptTimer.current = setTimeout(tick, 120 + Math.random() * 80);
      } else {
        setIsRecording(false);
      }
    };
    transcriptTimer.current = setTimeout(tick, 600);
  };

  const openPublisher = () => {
    setShowPublisher(true);
    startTranscribing();
  };

  const handlePublisherSubmit = () => {
    if (transcriptTimer.current) {
      clearTimeout(transcriptTimer.current);
      transcriptTimer.current = null;
    }
    setIsRecording(false);
    setShowPublisher(false);
    setPublisherInput("");
    onWishClick();
  };

  const handleClosePublisher = () => {
    if (transcriptTimer.current) {
      clearTimeout(transcriptTimer.current);
      transcriptTimer.current = null;
    }
    setIsRecording(false);
    setShowPublisher(false);
    setPublisherInput("");
  };

  return (
    <div className="flex flex-col h-full relative">
      <StatusBar />

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "square" && (
          <HomeScreen
            isMember={isMember}
            onWishClick={onWishClick}
            onDoSameClick={onDoSameClick}
            tabMode
          />
        )}
        {activeTab === "wishes" && <MyWishesTab />}
      </div>

      {/* ── Tab bar ── */}
      <div
        className="flex items-end justify-around px-4 pb-5 pt-2"
        style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}
      >
        {/* Left: 愿望广场 */}
        <button
          onClick={() => setActiveTab("square")}
          className="flex flex-col items-center gap-1 py-1 px-4"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)"}
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span
            className="text-xs"
            style={{
              color: activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)",
              fontWeight: activeTab === "square" ? 600 : 400,
            }}
          >
            广场
          </span>
        </button>

        {/* Center: Publisher — 单击/长按均直接进入录音 */}
        <button
          onClick={openPublisher}
          className="relative -mt-5 flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            boxShadow: "0 4px 20px var(--ring)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--background)"
            strokeWidth="2.5"
          >
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              fill="var(--background)"
            />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
          </svg>
        </button>

        {/* Right: 我的愿望 */}
        <button
          onClick={() => setActiveTab("wishes")}
          className="flex flex-col items-center gap-1 py-1 px-4 relative"
        >
          <div className="relative">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={activeTab === "wishes" ? "var(--primary)" : "var(--muted-foreground)"}
              strokeWidth="1.8"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {pendingCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  lineHeight: 1,
                }}
              >
                {pendingCount}
              </span>
            )}
          </div>
          <span
            className="text-xs"
            style={{
              color: activeTab === "wishes" ? "var(--primary)" : "var(--muted-foreground)",
              fontWeight: activeTab === "wishes" ? 600 : 400,
            }}
          >
            我的
          </span>
        </button>
      </div>

      {/* ── Publisher panel overlay ── */}
      <AnimatePresence>
        {showPublisher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-end"
            style={{ background: "oklch(0 0 0 / 45%)" }}
            onClick={handleClosePublisher}
          >
            <motion.div
              initial={{ y: 280 }}
              animate={{ y: 0 }}
              exit={{ y: 280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="w-full rounded-t-[28px] px-5 pt-4 pb-8"
              style={{
                background: "var(--card)",
                borderTop: "1px solid var(--border)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div
                className="w-10 h-1 rounded-full mx-auto mb-4"
                style={{ background: "var(--border)" }}
              />

              {/* 录音状态指示 */}
              {isRecording && (
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full recording-pulse"
                    style={{ background: "#f87171" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#f87171" }}
                  >
                    正在聆听...
                  </span>
                </div>
              )}

              {/* 转写内容区 */}
              <div className="glass-card rounded-2xl px-4 py-3 mb-4 min-h-[72px]">
                <textarea
                  value={publisherInput}
                  onChange={(e) => setPublisherInput(e.target.value)}
                  placeholder={isRecording ? "说出你的心愿…" : "我想要…"}
                  rows={2}
                  className="w-full bg-transparent text-sm outline-none resize-none"
                  style={{ color: "var(--foreground)" }}
                />
              </div>

              {/* 提交 */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePublisherSubmit}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm"
                style={{
                  background: publisherInput.trim()
                    ? "linear-gradient(135deg, var(--primary), var(--accent))"
                    : "var(--secondary)",
                  color: publisherInput.trim()
                    ? "var(--background)"
                    : "var(--muted-foreground)",
                }}
              >
                开始许愿
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
