import { createContext, useContext, useState, ReactNode } from "react";
import { WishBubbleOption, WishBubbleRecommendation } from "./wish-bubble-data";

interface WishBubbleContextValue {
  isVisible: boolean;
  options: WishBubbleOption[];
  recommendation: WishBubbleRecommendation | null;
  showBubble: (options?: WishBubbleOption[]) => void;
  hideBubble: () => void;
  setRecommendation: (rec: WishBubbleRecommendation | null) => void;
}

const WishBubbleContext = createContext<WishBubbleContextValue | undefined>(undefined);

export function WishBubbleProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<WishBubbleOption[]>([]);
  const [recommendation, setRecommendation] = useState<WishBubbleRecommendation | null>(null);

  const showBubble = (opts?: WishBubbleOption[]) => {
    if (opts) setOptions(opts);
    setIsVisible(true);
  };

  const hideBubble = () => {
    setIsVisible(false);
  };

  return (
    <WishBubbleContext.Provider
      value={{
        isVisible,
        options,
        recommendation,
        showBubble,
        hideBubble,
        setRecommendation,
      }}
    >
      {children}
    </WishBubbleContext.Provider>
  );
}

export function useWishBubble() {
  const context = useContext(WishBubbleContext);
  if (!context) {
    throw new Error("useWishBubble must be used within WishBubbleProvider");
  }
  return context;
}
