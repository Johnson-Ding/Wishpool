import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import WishpoolDemo from "./pages/WishpoolDemo";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <WishpoolDemo />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
