import { AnimatePresence, motion } from "framer-motion";
import type { DemoScreen } from "@/features/demo-flow/types";

interface PhoneDemoShellProps {
  children: React.ReactNode;
  currentScreen: DemoScreen;
  direction: "forward" | "back";
  pageVariants: {
    initial: (direction: "forward" | "back") => { x: string; opacity: number };
    animate: { x: number; opacity: number };
    exit: (direction: "forward" | "back") => { x: string; opacity: number };
  };
}

export function PhoneDemoShell({
  children,
  currentScreen,
  direction,
  pageVariants,
}: PhoneDemoShellProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors duration-500"
      style={{ background: "var(--background)", padding: "20px" }}
    >
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(var(--primary-lch) / 8%), transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />

      <div className="phone-shell relative flex flex-col overflow-hidden" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif" }}>
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full z-50 pointer-events-none phone-notch"
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute inset-0 flex flex-col"
            style={{ background: "var(--background)" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <div id="phone-demo-overlays" className="absolute inset-0 z-[80] pointer-events-none" />
      </div>

    </div>
  );
}
