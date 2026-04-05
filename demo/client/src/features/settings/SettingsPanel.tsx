import { motion, AnimatePresence } from "framer-motion";
import { MembershipStatus } from "./components/MembershipStatus";
import { ThemeStyleEntry } from "./components/ThemeStyleEntry";
import { LogFeedback } from "./components/LogFeedback";
import { UpdateChecker } from "./components/UpdateChecker";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
            style={{
              background: "var(--background)",
              maxHeight: "80vh"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                设置
              </h2>
              <button
                onClick={onClose}
                className="text-2xl leading-none"
                style={{ color: "var(--muted-foreground)" }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 60px)" }}>
              <MembershipStatus />
              <ThemeStyleEntry />
              <LogFeedback />
              <UpdateChecker />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
