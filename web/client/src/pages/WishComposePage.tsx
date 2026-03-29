import { WishComposer } from "@/features/wish-create/components/WishComposer";

export function WishComposePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Wish Flow</p>
        <h1 className="text-3xl font-semibold">发愿</h1>
        <p className="max-w-2xl text-sm text-white/70">
          这里已经接上真实的创建、澄清和确认方案状态流，后续只需要继续把体验打磨完整。
        </p>
      </div>
      <WishComposer />
    </section>
  );
}
