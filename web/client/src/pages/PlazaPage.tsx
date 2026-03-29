import { PlazaFeed } from "@/features/plaza/components/PlazaFeed";
import { usePlazaFeed } from "@/features/plaza/hooks/usePlazaFeed";

export function PlazaPage() {
  const { items, commentsById, loading, isLive, like, loadComments, addComment } = usePlazaFeed();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Plaza</p>
        <h1 className="text-3xl font-semibold">广场</h1>
        <p className="max-w-2xl text-sm text-white/70">
          这里已经开始承接漂流瓶、Feed 浏览和社区回应，不再只是 demo 开场页。
        </p>
      </div>
      <PlazaFeed
        items={items}
        commentsById={commentsById}
        loading={loading}
        isLive={isLive}
        onLike={like}
        onLoadComments={loadComments}
        onAddComment={addComment}
      />
    </section>
  );
}
