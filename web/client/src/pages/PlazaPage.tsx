import { PlazaFeed } from "@/features/plaza/components/PlazaFeed";
import { usePlazaFeed } from "@/features/plaza/hooks/usePlazaFeed";
import { StarField } from "@/components/ui/StarField";
import { CloudField } from "@/components/ui/CloudField";
import { useContext } from "react";
import { ThemeContext } from "@/contexts/theme/ThemeContext";

export function PlazaPage() {
  const { items, commentsById, loading, isLive, like, loadComments, addComment } = usePlazaFeed();
  const { theme } = useContext(ThemeContext);

  return (
    <div className="relative">
      {/* 背景动画 */}
      {theme === "cloud" && <CloudField />}
      {theme === "moon" && <StarField />}

      <div className="relative z-10">
        <PlazaFeed
          items={items}
          commentsById={commentsById}
          loading={loading}
          isLive={isLive}
          onLike={like}
          onLoadComments={loadComments}
          onAddComment={addComment}
        />
      </div>
    </div>
  );
}
