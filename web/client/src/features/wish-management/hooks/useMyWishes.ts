import { useCallback, useEffect, useState } from "react";
import { listMyWishes, deleteWish, type WishTask } from "@/lib/api";

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

  return {
    items,
    loading,
    error,
    refresh,
    setItems,
    deleteItem,
  };
}
