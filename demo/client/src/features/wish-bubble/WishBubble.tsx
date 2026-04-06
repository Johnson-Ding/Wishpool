import { motion, AnimatePresence } from "framer-motion";
import { useWishBubble } from "./WishBubbleContext";
import { getCharacterAvatar } from "@/features/demo-flow/shared";

export function WishBubble() {
  const { isVisible, options, murmurOptions, recommendation, hideBubble, layout } = useWishBubble();

  const handleOptionClick = (text: string, type: "wish" | "murmur" = "wish") => {
    window.dispatchEvent(new CustomEvent("wish-bubble-select", { detail: { text, type } }));
    hideBubble();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[280px]"
      >
        <div className="flex flex-col gap-2">
          {/* IP 头像 */}
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
            <img src={getCharacterAvatar("moon")} alt="眠眠月" className="w-full h-full object-cover" />
          </div>
          {/* 气泡内容 */}
          <div className="flex flex-col gap-2">
            {recommendation ? (
              <>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  刚才聊到的方向，要继续推进吗？
                </p>
                <button
                  onClick={() => handleOptionClick(recommendation.text, "wish")}
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 hover:opacity-80"
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--accent))",
                    color: "var(--primary-foreground)",
                  }}
                >
                  整理成正式愿望
                </button>
              </>
            ) : layout === "dual" ? (
              <>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  可以试试这些方向：
                </p>
                <div className="flex gap-3">
                  {/* 左列：愿望 */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                      愿望
                    </div>
                    {options.slice(0, 4).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.text, "wish")}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 hover:opacity-80 text-left"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                  {/* 右列：碎碎念 */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                      碎碎念
                    </div>
                    {murmurOptions.slice(0, 4).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.text, "murmur")}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 hover:opacity-80 text-left"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  想许愿的话，可以试试这些方向：
                </p>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.text, "wish")}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 hover:opacity-80"
                      style={{
                        background: "var(--secondary)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* 关闭按钮 */}
            <button
              onClick={hideBubble}
              className="text-xs self-start"
              style={{ color: "var(--muted-foreground)" }}
            >
              {layout === "dual" ? "先不了" : "先不发愿"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
