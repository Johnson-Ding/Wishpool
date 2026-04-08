import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

const MOCK_TEXTS = [
  "这周想留一个晚上给自己去散散步",
  "我想带爸妈找个周末出去走走",
  "忽然很想去海边吹吹风",
  "最近想学一门新技能",
];

interface VoiceInputOverlayProps {
  onCancel: () => void;
}

export function VoiceInputOverlay({ onCancel }: VoiceInputOverlayProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const [mockText, setMockText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const selectedText = useRef(MOCK_TEXTS[Math.floor(Math.random() * MOCK_TEXTS.length)]);

  useEffect(() => {
    setOverlayRoot(document.getElementById("phone-demo-overlays"));
  }, []);

  // 打字机动画
  useEffect(() => {
    const fullText = selectedText.current;
    if (charIndex >= fullText.length) return;
    const timer = setTimeout(() => {
      setMockText(fullText.slice(0, charIndex + 1));
      setCharIndex((i) => i + 1);
    }, 80);
    return () => clearTimeout(timer);
  }, [charIndex]);

  const isCancelling = deltaY > 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setDeltaY(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    setDeltaY(Math.max(0, startY - e.touches[0].clientY));
  };
  const handleTouchEnd = () => {
    if (deltaY > 80) onCancel();
    setStartY(null);
    setDeltaY(0);
  };

  // desktop 支持（demo 用鼠标测试）
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setDeltaY(0);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startY === null) return;
    setDeltaY(Math.max(0, startY - e.clientY));
  };
  const handleMouseUp = () => {
    if (deltaY > 80) onCancel();
    setStartY(null);
    setDeltaY(0);
  };

  if (!overlayRoot) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[70] flex flex-col items-center justify-end overflow-hidden select-none"
      style={{ pointerEvents: "auto", cursor: "ns-resize" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 极淡渐变光晕，从底部升起 */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-full"
        style={{ pointerEvents: "none" }}
        viewBox="0 0 375 812"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="voiceGlow" cx="50%" cy="100%" r="75%">
            <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="35%"  stopColor="var(--primary)" stopOpacity="0.10" />
            <stop offset="65%"  stopColor="var(--primary)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="375" height="812" fill="url(#voiceGlow)" />
      </svg>

      {/* Mock 转录文字 */}
      <div
        className="absolute flex items-center justify-center px-6"
        style={{
          bottom: "170px",
          left: 0,
          right: 0,
          pointerEvents: "none",
          minHeight: "48px",
        }}
      >
        {mockText && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base leading-7 text-center"
            style={{ color: "var(--foreground)" }}
          >
            {mockText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity }}
              style={{ color: "var(--primary)", marginLeft: "1px" }}
            >
              |
            </motion.span>
          </motion.p>
        )}
      </div>

      {/* 上滑取消提示 */}
      <motion.div
        className="absolute flex flex-col items-center gap-1.5"
        style={{
          bottom: "108px",
          pointerEvents: "none",
          transform: `translateY(${-deltaY * 0.25}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M12 19V5M5 12l7-7 7 7"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
        <span
          className="text-xs font-medium"
          style={{
            color: "var(--primary)",
            opacity: isCancelling ? 0.5 : 0.75,
          }}
        >
          {isCancelling ? "松开取消" : "上滑取消"}
        </span>
      </motion.div>

      {/* 声纹波形 */}
      <div
        className="relative flex items-end justify-center gap-0.5 pb-10"
        style={{ height: "72px", width: "100%", pointerEvents: "none" }}
      >
        {Array.from({ length: 38 }).map((_, i) => {
          const seed = ((i * 7 + 3) % 17) / 17;
          return (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: "3px",
                background: "var(--primary)",
                opacity: 0.45,
              }}
              animate={{
                height: [4, seed * 28 + 6, 4],
              }}
              transition={{
                duration: 0.35 + seed * 0.35,
                repeat: Infinity,
                repeatType: "reverse",
                delay: seed * 0.3,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    </motion.div>,
    overlayRoot,
  );
}
