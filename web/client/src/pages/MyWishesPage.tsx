import { WishManagementPanel } from "@/features/wish-management/components/WishManagementPanel";
import { useMyWishes } from "@/features/wish-management/hooks/useMyWishes";

export function MyWishesPage() {
  const { items, loading, error, refresh } = useMyWishes();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Wish Management</p>
        <h1 className="text-3xl font-semibold">我的愿望</h1>
        <p className="max-w-2xl text-sm text-white/70">
          这里会接住你创建并确认过的愿望，把它们从一次性交互变成可持续管理的任务单。
        </p>
      </div>
      <WishManagementPanel
        items={items}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </section>
  );
}
