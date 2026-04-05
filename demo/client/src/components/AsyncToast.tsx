import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface AsyncToastProps {
  type: "creating" | "ready";
  wishId: string;
  wishTitle?: string;
  onJump: () => void;
  onDismiss: () => void;
}

export function AsyncToast({ type, wishId, wishTitle, onJump, onDismiss }: AsyncToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    creating: {
      text: "愿望已创建，眠眠月正加紧制作方案，完成后会通知你",
      buttonText: "跳转",
      icon: "🌙",
    },
    ready: {
      text: "方案已生成，点击查看",
      buttonText: "查看",
      icon: "✨",
    },
  };

  const { text, buttonText, icon } = config[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[90%] w-[360px]"
      >
        <div
          className="rounded-2xl p-4 shadow-lg backdrop-blur-sm flex items-start gap-3"
          style={{
            background: "oklch(var(--card-lch) / 95%)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "var(--secondary)" }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--foreground)" }}>
              {text}
            </p>
            {wishTitle && (
              <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                {wishTitle}
              </p>
            )}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onJump}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {buttonText}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className="px-4 py-2 rounded-xl text-sm"
                style={{
                  background: "var(--secondary)",
                  color: "var(--muted-foreground)",
                }}
              >
                稍后
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
