import { useCallback, useEffect, useState } from "react";
import { getOrCreateDeviceId } from "@/lib/device";
import { listMyWishes, type WishTask } from "@/lib/api";

export function useMyWishes() {
  const [items, setItems] = useState<WishTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const deviceId = getOrCreateDeviceId();
      const wishes = await listMyWishes(deviceId);
      setItems(wishes);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "加载愿望失败");
    } finally {
      setLoading(false);
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
  };
}
