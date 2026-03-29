import { WishManagementPanel } from "@/features/wish-management/components/WishManagementPanel";
import { useMyWishes } from "@/features/wish-management/hooks/useMyWishes";
import { StarField } from "@/components/ui/StarField";
import { CloudField } from "@/components/ui/CloudField";
import { useContext } from "react";
import { ThemeContext } from "@/contexts/theme/ThemeContext";

export function MyWishesPage() {
  const { items, loading, error, refresh } = useMyWishes();
  const { theme } = useContext(ThemeContext);

  return (
    <div className="relative">
      {/* 背景动画 */}
      {theme === "cloud" && <CloudField />}
      {theme === "moon" && <StarField />}

      <div className="relative z-10">
        <WishManagementPanel
          items={items}
          loading={loading}
          error={error}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
