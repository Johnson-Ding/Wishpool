import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../shared";
import { HomeScreen } from "./HomeScreen";
import { MyWishesTab } from "./MyWishesTab";
import type { WishScenario } from "../data";
import type { DemoScreen } from "../types";
import { GlowCircle } from "@/components/product/GlowCircle";
import { DEFAULT_WISH_OPTIONS, DEFAULT_MURMUR_OPTIONS } from "@/features/wish-bubble/wish-bubble-data";
import { useWishBubble } from "@/features/wish-bubble/WishBubbleContext";
import { WishBubble } from "@/features/wish-bubble/WishBubble";
import { ChatDetailScreen } from "./ChatDetailScreen";
import { VoiceInputOverlay } from "@/components/VoiceInputOverlay";

const MOCK_TRANSCRIPTS = [
  "这周想留一个晚上给自己去散散步。",
  "我想带爸妈找个周末出去走走。",
  "忽然很想去海边吹吹风。",
];

interface MainTabScreenProps {
  currentScreen: DemoScreen;
  scenario: WishScenario;
  onNavigate: (screen: DemoScreen, nextDirection?: "forward" | "back") => void;
  onScenarioChange: (scenarioId: number) => void;
  glowCircleMode: "flow" | "wish" | "murmur";
  onGlowCircleModeChange: (mode: "flow" | "wish" | "murmur") => void;
}

export function MainTabScreen({ currentScreen, scenario, onNavigate, onScenarioChange, glowCircleMode, onGlowCircleModeChange }: MainTabScreenProps) {
  const { showBubble, hideBubble, isVisible } = useWishBubble();
  const [chatDraft, setChatDraft] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceFromHome, setVoiceFromHome] = useState(false);

  const activeTab = useMemo<"square" | "chat" | "wishes">(() => {
    if (currentScreen === "chat") return "chat";
    if (currentScreen === "wishes") return "wishes";
    return "square";
  }, [currentScreen]);

  const goHome = () => {
    hideBubble();
    onNavigate("home", "back");
  };

  const goChat = () => {
    onNavigate("chat", "forward");
  };

  const goWishes = () => {
    hideBubble();
    onNavigate("wishes", "forward");
  };

  const handleVoiceComplete = () => {
    const transcript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
    const type = transcript.includes("想") ? "wish" : "murmur";
    setVoiceOpen(false);
    if (voiceFromHome) {
      // 首页长按：语音完成后先进聊天页，再把结果插入对话流
      goChat();
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type, text: transcript } }));
      }, 150);
      setVoiceFromHome(false);
    } else {
      window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type, text: transcript } }));
    }
  };

  const handleGlowClick = () => {
    if (activeTab === "chat") {
      if (glowCircleMode === "flow") {
        showBubble(DEFAULT_WISH_OPTIONS, DEFAULT_MURMUR_OPTIONS, "dual");
      } else if (glowCircleMode === "wish") {
        const wishText = DEFAULT_WISH_OPTIONS[0]?.text;
        if (wishText) {
          window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type: "wish", text: wishText } }));
        }
        onGlowCircleModeChange("flow");
        hideBubble();
      } else if (glowCircleMode === "murmur") {
        const murmurText = DEFAULT_MURMUR_OPTIONS[0]?.text;
        if (murmurText) {
          window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type: "murmur", text: murmurText } }));
        }
        onGlowCircleModeChange("flow");
        hideBubble();
      }
      return;
    }
    goChat();
  };

  const handleGlowLongPress = () => {
    if (activeTab === "chat") {
      // 聊天页长按：直接打开语音
      setVoiceFromHome(false);
      setVoiceOpen(true);
      return;
    }
    // 首页长按：先开语音，完成后再进聊天页
    setVoiceFromHome(true);
    setVoiceOpen(true);
  };

  return (
    <div className="flex h-full flex-col relative" style={{ background: "var(--background)" }}>
      {/* 气泡蒙层背板 */}
      {activeTab === "chat" && isVisible && (
        <div
          className="absolute inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={hideBubble}
        />
      )}
      <StatusBar />

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "square" && (
          <HomeScreen
            isMember
            onWishClick={() => goChat()}
            onDoSameClick={(bottleId) => {
              onScenarioChange(bottleId);
              goChat();
            }}
            tabMode
          />
        )}

        {activeTab === "chat" && (
          <ChatDetailScreen
            scenario={scenario}
            draft={chatDraft}
            onDraftChange={setChatDraft}
            onScenarioChange={onScenarioChange}
            glowCircleMode={glowCircleMode}
            onGlowCircleModeChange={onGlowCircleModeChange}
          />
        )}

        {activeTab === "wishes" && (
          <MyWishesTab
            onResumeWish={(scenarioId) => {
              onScenarioChange(scenarioId);
              onNavigate("chat", "back");
            }}
          />
        )}
      </div>

      {activeTab === "chat" && (
        <div className="px-4 pb-3 pt-2" style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}>
          <div
            className="flex items-center gap-2 rounded-[22px] px-3 py-2.5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h4l2-2h4l2 2h4v12H4z" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            </button>
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && chatDraft.trim()) {
                  window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type: "wish", text: chatDraft.trim() } }));
                  setChatDraft("");
                }
              }}
              placeholder="写下此刻的小愿望或碎碎念..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button
              onClick={() => {
                if (chatDraft.trim()) {
                  window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type: "wish", text: chatDraft.trim() } }));
                  setChatDraft("");
                }
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: chatDraft.trim() ? "var(--primary)" : "var(--secondary)", color: chatDraft.trim() ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
            >
              {chatDraft.trim() ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.63 2.65a2 2 0 0 1-.45 2.11L8 9.99a16 16 0 0 0 6 6l1.51-1.29a2 2 0 0 1 2.11-.45c.86.3 1.75.51 2.65.63A2 2 0 0 1 22 16.92z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      <div
        className="relative flex items-end justify-around px-4 pb-5 pt-2"
        style={{ background: "var(--background)", borderTop: activeTab === "chat" ? "none" : "1px solid var(--border)" }}
      >
        <button onClick={goHome} className="flex flex-col items-center gap-1 py-1 px-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-xs" style={{ color: activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)", fontWeight: activeTab === "square" ? 600 : 400 }}>广场</span>
        </button>

        <div className="relative flex flex-col items-center">
          <GlowCircle
            variant={activeTab === "chat" ? "bar" : "circle"}
            mode={glowCircleMode}
            onClick={handleGlowClick}
            onLongPress={handleGlowLongPress}
          />
          {activeTab === "chat" && isVisible && (
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50">
              <WishBubble />
            </div>
          )}
        </div>

        <button onClick={goWishes} className="flex flex-col items-center gap-1 py-1 px-4 relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "wishes" ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-xs" style={{ color: activeTab === "wishes" ? "var(--primary)" : "var(--muted-foreground)", fontWeight: activeTab === "wishes" ? 600 : 400 }}>我的</span>
        </button>
      </div>

      <AnimatePresence>
        {voiceOpen && <VoiceInputOverlay onCancel={handleVoiceComplete} />}
      </AnimatePresence>
    </div>
  );
}
