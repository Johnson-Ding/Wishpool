import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface VoiceInputOverlayProps {
  onCancel: () => void;
}

export function VoiceInputOverlay({ onCancel }: VoiceInputOverlayProps) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStartY === null || currentY === null) return;

    const deltaY = touchStartY - currentY;
    if (deltaY > 80) {
      onCancel();
    }

    setTouchStartY(null);
    setCurrentY(null);
  };

  // 计算上滑距离用于视觉反馈
  const swipeDistance = touchStartY !== null && currentY !== null
    ? Math.max(0, touchStartY - currentY)
    : 0;

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{
        background: "transparent",
        pointerEvents: "auto",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 半圆形荧光遮罩 - 从底部升起，完全遮盖导航栏和输入框 */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: "100%",
          pointerEvents: "none",
        }}
        viewBox="0 0 375 812"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="glowGradient" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.7" />
            <stop offset="30%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="187.5"
          cy="812"
          rx="320"
          ry="600"
          fill="url(#glowGradient)"
        />
      </svg>

      {/* 上滑取消提示 */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: -swipeDistance,
          opacity: swipeDistance > 40 ? 0.5 : 1
        }}
        className="absolute bottom-40 flex flex-col items-center gap-2"
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          className="w-8 h-1 rounded-full"
          style={{
            background: "var(--primary)",
            opacity: 0.6,
          }}
        />
        <span
          className="text-sm font-medium"
          style={{
            color: "var(--primary)",
          }}
        >
          上滑取消
        </span>
      </motion.div>
    </motion.div>
  );
}
