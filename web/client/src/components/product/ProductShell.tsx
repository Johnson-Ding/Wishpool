import { useState, useEffect } from "react";
import { ProductNav } from "./ProductNav";
import { Button } from "@/components/ui/button";
import { StarField, CloudField, getCharacterBg } from "@/components/ui/CharacterVisuals";
import { useTheme } from "@/contexts/theme/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { createWish } from "@/lib/api";
import { getOrCreateDeviceId } from "@/lib/device";
import { useLocation } from "wouter";

interface ProductShellProps {
  children: React.ReactNode;
}

export function ProductShell({ children }: ProductShellProps) {
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    const content = inputValue.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const deviceId = getOrCreateDeviceId();
      await createWish({
        deviceId,
        intent: content,
        rawInput: content,
        title: content.length > 18 ? `${content.slice(0, 18)}…` : content,
      });

      setInputValue("");
      setFeedback({ type: "success", message: "心愿已创建 ✨" });

      // 如果当前在许愿列表页，触发刷新；否则跳转过去
      setTimeout(() => {
        setLocation("/wishes");
        setFeedback(null);
      }, 800);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "创建失败，请重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const character = theme === "star" ? "star" : theme === "cloud" ? "cloud" : "moon";
  const bgImage = getCharacterBg(character);
  const isCloud = character === "cloud";

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-500 relative overflow-hidden"
      style={{
        background: "var(--background)",
        fontFamily: "'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif"
      }}
    >
      {/* 背景图片层 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `url(${bgImage})`,
          opacity: isCloud ? 0.6 : 0.45,
        }}
      />

      {/* 渐变遮罩 */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, oklch(var(--background-lch) / 20%), oklch(var(--background-lch) / 90%))",
        }}
      />

      {/* 动态背景动画 */}
      {mounted && (
        isCloud ? <CloudField /> : <StarField />
      )}

      {/* 装饰光晕 */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(var(--primary-lch) / 12%), transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
          animation: "float 8s ease-in-out infinite",
        }}
      />

      <ProductNav />

      <main className="flex-1 overflow-hidden relative z-10">
        {children}
      </main>

      {/* 底部输入框 - 精致桌面版 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="border-t backdrop-blur-xl z-20"
        style={{
          borderColor: "var(--border)",
          background: "oklch(var(--background-lch) / 85%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex-1 relative"
              style={{
                boxShadow: "0 4px 20px oklch(var(--primary-lch) / 10%)",
                borderRadius: "9999px",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-full px-6 py-4 text-sm outline-none transition-all font-medium"
                style={{
                  background: "var(--input)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 2px oklch(var(--primary-lch) / 40%)";
                  e.target.style.borderColor = "oklch(var(--primary-lch) / 50%)";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "var(--border)";
                }}
                placeholder={isCloud ? "☁️ 许下你的心愿..." : "✨ 许下你的心愿..."}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isSubmitting}
              className="rounded-full font-semibold px-8 py-5 hover:opacity-90 transition-all hover:scale-105"
              style={{
                background: inputValue.trim() && !isSubmitting
                  ? "linear-gradient(135deg, var(--primary), var(--accent))"
                  : "var(--secondary)",
                color: inputValue.trim() && !isSubmitting
                  ? "var(--background)"
                  : "var(--muted-foreground)",
                boxShadow: inputValue.trim() && !isSubmitting
                  ? "0 4px 15px oklch(var(--primary-lch) / 30%)"
                  : "none",
              }}
            >
              {isSubmitting ? "..." : "许愿"}
            </Button>
          </div>

          {/* 反馈消息 */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-center text-sm"
                style={{
                  color: feedback.type === "success" ? "var(--primary)" : "var(--destructive)",
                }}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
