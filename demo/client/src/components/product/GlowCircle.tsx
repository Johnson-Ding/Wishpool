import { motion } from "framer-motion";

import { useRef } from "react";

interface GlowCircleProps {
  onClick: () => void;
  onLongPress?: () => void;
  variant?: "circle" | "bar";
  label?: string;
}

export function GlowCircle({ onClick, onLongPress, variant = "circle", label = "许愿" }: GlowCircleProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handlePointerDown = () => {
    longPressTriggered.current = false;
    if (onLongPress) {
      pressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        onLongPress();
      }, 500);
    }
  };

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handlePointerUp = () => {
    clearPressTimer();
  };

  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    onClick();
  };

  const isBar = variant === "bar";

  return (
    <motion.button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative flex items-center justify-center shadow-lg ${isBar ? "h-12 min-w-[132px] rounded-full px-8" : "-mt-5 w-16 h-16 rounded-full"}`}
      style={{
        background: "linear-gradient(135deg, var(--primary), var(--accent))",
        boxShadow: "0 4px 20px var(--ring)",
        animation: "pulse-gentle 2s ease-in-out infinite",
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`absolute opacity-30 ${isBar ? "inset-x-3 inset-y-2 rounded-full" : "inset-2 rounded-full"}`}
        style={{
          background: isBar
            ? "linear-gradient(90deg, transparent 0%, var(--background) 50%, transparent 100%)"
            : "radial-gradient(circle, var(--background) 0%, transparent 70%)",
          animation: "breath-inner 3s ease-in-out infinite",
        }}
      />
      {isBar && (
        <span className="relative z-10 text-sm font-semibold" style={{ color: "var(--background)" }}>
          {label}
        </span>
      )}
    </motion.button>
  );
}
