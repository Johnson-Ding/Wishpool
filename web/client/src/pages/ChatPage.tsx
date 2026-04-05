import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RotateCcw, Target } from "lucide-react";
import { ThemeContext } from "@/contexts/theme/ThemeContext";
import { StarField } from "@/components/ui/StarField";
import { CloudField } from "@/components/ui/CloudField";

type IPCharacterType = "moon" | "cloud" | "star";
type ChatMode = "casual" | "wish";
type Message = { role: "ai" | "user"; text: string };

interface IPCharacterConfig {
  id: IPCharacterType;
  name: string;
  avatar: string;
  description: string;
}

const IP_CHARACTER_CONFIGS: Record<IPCharacterType, IPCharacterConfig> = {
  moon: { id: "moon", name: "眠眠月", avatar: "🌙", description: "温柔陪伴" },
  cloud: { id: "cloud", name: "朵朵云", avatar: "☁️", description: "轻松自在" },
  star: { id: "star", name: "芽芽星", avatar: "⭐", description: "活力满满" },
};

export function ChatPage() {
  const { theme } = useContext(ThemeContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<IPCharacterType>("moon");
  const [currentMode, setCurrentMode] = useState<ChatMode>("casual");
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentCharacterConfig = IP_CHARACTER_CONFIGS[currentCharacter];

  useEffect(() => {
    // 初始问候
    const greetings = {
      moon: "你好呀～我是眠眠月，今天心情怎么样？有什么想聊的吗？",
      cloud: "Hello～我是朵朵云，今天天气不错呢，有什么想聊的话题吗？",
      star: "嗨！我是芽芽星，今天过得如何？有什么有趣的事情想分享吗？",
    };
    setMessages([{ role: "ai", text: greetings[currentCharacter] }]);
  }, [currentCharacter]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleCharacterSwitch = (characterId: IPCharacterType) => {
    setCurrentCharacter(characterId);
    setShowCharacterSelector(false);
    setMessages([]);
  };

  const handleModeSwitch = (mode: ChatMode) => {
    setCurrentMode(mode);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages((m) => [...m, { role: "user", text: inputValue.trim() }]);
    setInputValue("");

    // 模拟AI回复
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const aiResponse =
          currentMode === "wish"
            ? "我来帮你梳理这个心愿的具体方案..."
            : `作为${currentCharacterConfig.name}，我觉得这个想法很棒呢！`;
        setMessages((m) => [...m, { role: "ai", text: aiResponse }]);
      }, 800);
    }, 300);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* 背景动画 */}
      {theme === "cloud" && <CloudField />}
      {theme === "moon" && <StarField />}

      <div className="relative z-10 flex-1 flex flex-col" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 space-y-3">
          {/* Character selector */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowCharacterSelector(!showCharacterSelector)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-lg">
                  {currentCharacterConfig.avatar}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {currentCharacterConfig.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Character dropdown */}
              <AnimatePresence>
                {showCharacterSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px]"
                  >
                    {Object.values(IP_CHARACTER_CONFIGS).map((character) => (
                      <button
                        key={character.id}
                        onClick={() => handleCharacterSwitch(character.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm">
                          {character.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{character.name}</div>
                          <div className="text-xs text-gray-500">{character.description}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleModeSwitch("casual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentMode === "casual" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              随意聊天
            </button>
            <button
              onClick={() => handleModeSwitch("wish")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentMode === "wish" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Target className="w-4 h-4" />
              心愿澄清
            </button>
          </div>
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                    {currentCharacterConfig.avatar}
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
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm flex-shrink-0">
                  {currentCharacterConfig.avatar}
                </div>
                <div
                  className="rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5"
                  style={{ background: "var(--secondary)", borderRadius: "4px 16px 16px 16px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
