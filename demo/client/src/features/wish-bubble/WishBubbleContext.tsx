import { createContext, useContext, useState, ReactNode } from "react";
import { WishBubbleOption, WishBubbleRecommendation } from "./wish-bubble-data";

interface WishBubbleContextValue {
  isVisible: boolean;
  options: WishBubbleOption[];
  murmurOptions: WishBubbleOption[];
  recommendation: WishBubbleRecommendation | null;
  layout: "single" | "dual";
  showBubble: (options?: WishBubbleOption[], murmurOpts?: WishBubbleOption[], layout?: "single" | "dual") => void;
  hideBubble: () => void;
  setRecommendation: (rec: WishBubbleRecommendation | null) => void;
}

const WishBubbleContext = createContext<WishBubbleContextValue | undefined>(undefined);

export function WishBubbleProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<WishBubbleOption[]>([]);
  const [murmurOptions, setMurmurOptions] = useState<WishBubbleOption[]>([]);
  const [recommendation, setRecommendation] = useState<WishBubbleRecommendation | null>(null);
  const [layout, setLayout] = useState<"single" | "dual">("single");

  const showBubble = (opts?: WishBubbleOption[], murmurOpts?: WishBubbleOption[], layoutMode?: "single" | "dual") => {
    if (opts) setOptions(opts);
    if (murmurOpts) setMurmurOptions(murmurOpts);
    if (layoutMode) setLayout(layoutMode);
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
        murmurOptions,
        recommendation,
        layout,
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
