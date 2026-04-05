import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, RotateCcw, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI } from "@/lib/agent-api";

// 类型定义
type IPCharacterType = "moon" | "star" | "cloud";
type ChatMode = "casual" | "wish";
type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface IPCharacterConfig {
  id: IPCharacterType;
  name: string;
  description: string;
  avatar: string;
  theme: string;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWishCreated?: (wishText: string) => void;
  initialCharacter?: IPCharacterType;
  initialMode?: ChatMode;
  attachedWish?: string | null;
}

// IP角色配置
const IP_CHARACTER_CONFIGS: Record<IPCharacterType, IPCharacterConfig> = {
  moon: {
    id: "moon",
    name: "眠眠月",
    description: "温和陪伴型AI助手，擅长倾听和温柔引导",
    avatar: "🌙",
    theme: "moon"
  },
  star: {
    id: "star",
    name: "芽芽星",
    description: "活力激励型AI助手，充满正能量和创造力",
    avatar: "⭐",
    theme: "star"
  },
  cloud: {
    id: "cloud",
    name: "朵朵云",
    description: "智慧分析型AI助手，提供理性建议和深度思考",
    avatar: "☁️",
    theme: "cloud"
  }
};

async function callChatAPI(params: {
  character: IPCharacterType;
  mode: ChatMode;
  message: string;
  context?: ChatMessage[];
  attachedWish?: string | null;
}): Promise<{
  reply: string;
  suggestedActions?: Array<{ type: string; label: string; }>;
}> {
  const result = await chatWithAI({
    character: params.character,
    mode: params.mode,
    message: params.message,
    context: params.context,
    attachedWish: params.attachedWish,
  });

  if (!result.success || !result.reply) {
    throw new Error(result.error || "对话请求失败");
  }

  return {
    reply: result.reply,
    suggestedActions: result.suggestedActions?.map((action: { type: string; text: string }) => ({
      type: action.type,
      label: action.text,
    })),
  };
}

export function ChatDialog({
  isOpen,
  onClose,
  onWishCreated,
  initialCharacter = "moon",
  initialMode = "casual",
  attachedWish = null
}: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentCharacter, setCurrentCharacter] = useState<IPCharacterType>(initialCharacter);
  const [currentMode, setCurrentMode] = useState<ChatMode>(initialMode);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentCharacterConfig = IP_CHARACTER_CONFIGS[currentCharacter];

  // 判断是否为执行模式
  const isExecuteMode = currentMode === "wish" || !!attachedWish;

  // 初始化对话
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetings = {
        moon: "你好呀～我是眠眠月，今天心情怎么样？有什么想聊的吗？",
        star: "嗨！我是星星，今天过得如何？有什么有趣的事情想分享吗？",
        cloud: "Hello～我是云朵，今天天气不错呢，有什么想聊的话题吗？"
      };

      const greeting = attachedWish
        ? `关于你的愿望，我们继续聊聊具体怎么推进吧！`
        : greetings[currentCharacter];

      setMessages([{
        id: Date.now().toString(),
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, currentCharacter, attachedWish, messages.length]);

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setIsTyping(true);

    try {
      const result = await callChatAPI({
        character: currentCharacter,
        mode: isExecuteMode ? "wish" : "casual",
        message: userMessage.content,
        context: messages,
        attachedWish
      });

      setIsTyping(false);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // 处理建议操作
      if (result.suggestedActions?.some(action => action.type === "create_wish")) {
        // 可以显示愿望按钮或触发愿望创建
      }
    } catch (error) {
      setIsTyping(false);
      console.error("发送消息失败:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCharacterSwitch = (characterId: IPCharacterType) => {
    setCurrentCharacter(characterId);
    setShowCharacterSelector(false);
    // 可以选择是否重置对话历史
  };

  const handleModeSwitch = (mode: ChatMode) => {
    setCurrentMode(mode);
    // 可以选择是否重置对话历史
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-h-[80vh] rounded-t-3xl flex flex-col border-t border-white/10 bg-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-4 pb-3 space-y-3 border-b border-white/5">
          <div className="w-12 h-1 rounded-full bg-white/20 mx-auto" />

          {/* Character selector and close button */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowCharacterSelector(!showCharacterSelector)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl">
                  {currentCharacterConfig.avatar}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">
                    {currentCharacterConfig.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {isExecuteMode ? "执行模式" : "倾听模式"}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/40" />
              </button>

              {/* Character dropdown */}
              <AnimatePresence>
                {showCharacterSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-card border border-white/10 rounded-2xl shadow-xl z-10 min-w-[200px]"
                  >
                    {Object.values(IP_CHARACTER_CONFIGS).map(character => (
                      <button
                        key={character.id}
                        onClick={() => handleCharacterSwitch(character.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 first:rounded-t-2xl last:rounded-b-2xl text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base">
                          {character.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{character.name}</div>
                          <div className="text-xs text-white/50">{character.description}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-10 h-10 p-0 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Mode switcher - 只在非执行模式时显示 */}
          {!attachedWish && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleModeSwitch("casual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isExecuteMode
                    ? "bg-primary/20 text-primary"
                    : "text-white/50 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                随意聊天
              </button>
              <button
                onClick={() => handleModeSwitch("wish")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isExecuteMode
                    ? "bg-accent/20 text-accent"
                    : "text-white/50 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <Target className="w-4 h-4" />
                心愿澄清
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base flex-shrink-0 mt-1">
                    {currentCharacterConfig.avatar}
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === "assistant"
                      ? "bg-white/5 text-white rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base flex-shrink-0">
                  {currentCharacterConfig.avatar}
                </div>
                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/40"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-2 border-t border-white/5">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-white/5 rounded-2xl px-4 py-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`和${currentCharacterConfig.name}聊天...`}
                className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 px-0"
                disabled={isSending}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
              className="w-12 h-12 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}