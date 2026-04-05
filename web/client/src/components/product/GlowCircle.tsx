import { motion } from "framer-motion";

interface GlowCircleProps {
  onClick: () => void;
}

export function GlowCircle({ onClick }: GlowCircleProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative -mt-4 flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
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
        className="absolute inset-2 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, var(--background) 0%, transparent 70%)",
          animation: "breath-inner 3s ease-in-out infinite",
        }}
      />
    </motion.button>
  );
}
