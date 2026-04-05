import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme/ThemeContext";
import { WishBubbleProvider } from "@/features/wish-bubble/WishBubbleContext";
import { ensureAuth } from "@/lib/supabase";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    ensureAuth();
  }, []);

  return (
    <ThemeProvider>
      <WishBubbleProvider>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </WishBubbleProvider>
    </ThemeProvider>
  );
}
