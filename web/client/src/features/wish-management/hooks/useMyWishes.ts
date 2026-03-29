import { useCallback, useEffect, useState } from "react";
import { listMyWishes, deleteWish, type WishTask } from "@/lib/api";
import { globalEvents, EVENTS } from "@/lib/events";

export function useMyWishes() {
  const [items, setItems] = useState<WishTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const wishes = await listMyWishes();
      setItems(wishes);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "加载愿望失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (wishId: string) => {
    try {
      const result = await deleteWish(wishId);
      if (result.success) {
        // 从本地状态中移除
        setItems(prev => prev.filter(item => item.id !== wishId));
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "删除愿望失败";
      return { success: false, message };
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // 页面聚焦时自动刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面重新可见时刷新数据
        void refresh();
      }
    };

    const handleFocus = () => {
      // 页面重新获得焦点时刷新数据
      void refresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refresh]);

  // 监听全局愿望数据变更事件
  useEffect(() => {
    const handleWishCreated = () => {
      console.log('🔄 收到愿望创建事件，刷新列表数据');
      void refresh();
    };

    const handleWishUpdated = () => {
      console.log('🔄 收到愿望更新事件，刷新列表数据');
      void refresh();
    };

    globalEvents.on(EVENTS.WISH_CREATED, handleWishCreated);
    globalEvents.on(EVENTS.WISH_UPDATED, handleWishUpdated);

    return () => {
      globalEvents.off(EVENTS.WISH_CREATED, handleWishCreated);
      globalEvents.off(EVENTS.WISH_UPDATED, handleWishUpdated);
    };
  }, [refresh]);

  return {
    items,
    loading,
    error,
    refresh,
    setItems,
    deleteItem,
  };
}
