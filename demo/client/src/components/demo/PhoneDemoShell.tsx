import { AnimatePresence, motion } from "framer-motion";
import { DEMO_SCREEN_ORDER, type DemoScreen } from "@/features/demo-flow/types";

interface PhoneDemoShellProps {
  children: React.ReactNode;
  currentScreen: DemoScreen;
  direction: "forward" | "back";
  pageVariants: {
    initial: (direction: "forward" | "back") => { x: string; opacity: number };
    animate: { x: number; opacity: number };
    exit: (direction: "forward" | "back") => { x: string; opacity: number };
  };
  screenLabel: string;
  onNavigate: (screen: DemoScreen) => void;
}

export function PhoneDemoShell({
  children,
  currentScreen,
  direction,
  onNavigate,
  pageVariants,
  screenLabel,
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
          className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full z-50 pointer-events-none"
          style={{ background: "oklch(0.08 0.02 265)" }}
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
      </div>

      <div className="absolute bottom-8 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {DEMO_SCREEN_ORDER.filter((screen) => screen !== "splash").map((screen) => (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              title={screen}
              className="transition-all rounded-full"
              style={{
                width: currentScreen === screen ? 20 : 6,
                height: 6,
                background: currentScreen === screen ? "var(--primary)" : "oklch(0.3 0.02 265)",
              }}
            />
          ))}
        </div>
        <p className="text-xs" style={{ color: "oklch(0.4 0.01 265)" }}>
          {screenLabel}
        </p>
      </div>
    </div>
  );
}
