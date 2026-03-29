import { WishManagementPanel } from "@/features/wish-management/components/WishManagementPanel";
import { useMyWishes } from "@/features/wish-management/hooks/useMyWishes";
import { StarField } from "@/components/ui/StarField";
import { CloudField } from "@/components/ui/CloudField";
import { useContext, useEffect } from "react";
import { ThemeContext } from "@/contexts/theme/ThemeContext";
import { useLocation } from "wouter";

export function MyWishesPage() {
  const { items, loading, error, refresh, deleteItem } = useMyWishes();
  const { theme } = useContext(ThemeContext);
  const [location] = useLocation();

  // 当路由到该页面时强制刷新数据
  useEffect(() => {
    if (location === '/wishes') {
      console.log('🔄 切换到愿望管理页面，刷新数据');
      void refresh();
    }
  }, [location, refresh]);

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
          onDelete={deleteItem}
        />
      </div>
    </div>
  );
}
