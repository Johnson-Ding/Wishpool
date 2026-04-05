import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WishBubbleProvider } from "@/features/wish-bubble/WishBubbleContext";
import WishpoolDemo from "./pages/WishpoolDemo";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" switchable={true}>
      <TooltipProvider>
        <WishBubbleProvider>
          <Toaster />
          <WishpoolDemo />
        </WishBubbleProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
