import { useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CharacterContext, getCharacterAvatar } from "../shared";
import { ThemeSelector } from "@/components/ThemeSelector";
import { SettingsPanel } from "@/features/settings/SettingsPanel";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

type WishStatus = "pending" | "in_progress" | "completed";

interface MockWish {
  id: string;
  scenarioId: number;
  title: string;
  icon: string;
  status: WishStatus;
  summary: string;
  date: string;
  todos: TodoItem[];
}

const INITIAL_WISHES: MockWish[] = [
  {
    id: "w1",
    scenarioId: 7,
    title: "带爸妈短途旅行",
    icon: "🏡",
    status: "pending",
    summary: "先把这次出行收成一个轻松可落地的小计划。",
    date: "4月6日",
    todos: [
      { id: "w1-1", text: "确认爸妈想去的方向", completed: false },
      { id: "w1-2", text: "定一个周末档期", completed: false },
      { id: "w1-3", text: "挑出 1 套最轻松路线", completed: false },
    ],
  },
  {
    id: "w2",
    scenarioId: 1,
    title: "开始参加城市夜跑",
    icon: "🏃",
    status: "in_progress",
    summary: "路线和首跑节奏已经差不多，正在等你最后确认。",
    date: "4月5日",
    todos: [
      { id: "w2-1", text: "确认集合时间", completed: true },
      { id: "w2-2", text: "选一条 5km 路线", completed: false },
      { id: "w2-3", text: "准备跑后补给", completed: false },
    ],
  },
  {
    id: "w3",
    scenarioId: 4,
    title: "一个人安静吃顿饭",
    icon: "🍜",
    status: "completed",
    summary: "这次已经顺利完成，也留下了属于自己的安静时刻。",
    date: "4月3日",
    todos: [
      { id: "w3-1", text: "选好一家小馆子", completed: true },
      { id: "w3-2", text: "避开高峰到店", completed: true },
      { id: "w3-3", text: "记录这次感受", completed: true },
    ],
  },
];

const STATUS_COPY: Record<WishStatus, string> = {
  pending: "待开始",
  in_progress: "进行中",
  completed: "已完成",
};

interface MyWishesTabProps {
  onResumeWish?: (scenarioId: number) => void;
}

export function MyWishesTab({ onResumeWish }: MyWishesTabProps) {
  const { character } = useContext(CharacterContext);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wishes, setWishes] = useState(INITIAL_WISHES);

  const avatar = getCharacterAvatar(character);

  const grouped = useMemo(() => ({
    pending: wishes.filter((wish) => wish.status === "pending"),
    in_progress: wishes.filter((wish) => wish.status === "in_progress"),
    completed: wishes.filter((wish) => wish.status === "completed"),
  }), [wishes]);

  const toggleTodo = (wishId: string, todoId: string) => {
    setWishes((current) => current.map((wish) => {
      if (wish.id !== wishId) return wish;
      const todos = wish.todos.map((todo) => todo.id === todoId ? { ...todo, completed: !todo.completed } : todo);
      const completedCount = todos.filter((todo) => todo.completed).length;
      const nextStatus: WishStatus = completedCount === todos.length ? "completed" : completedCount > 0 ? "in_progress" : "pending";
      return { ...wish, todos, status: nextStatus };
    }));
  };

  const renderWishCard = (wish: MockWish) => {
    const isExpanded = expandedId === wish.id;
    const completedCount = wish.todos.filter((todo) => todo.completed).length;
    const progress = `${completedCount}/${wish.todos.length}`;

    return (
      <motion.div
        key={wish.id}
        layout
        className="rounded-[24px] p-4 cursor-pointer"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={() => setExpandedId(isExpanded ? null : wish.id)}
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0" style={{ background: "var(--secondary)" }}>
            {wish.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{wish.title}</div>
              <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>{STATUS_COPY[wish.status]}</span>
            </div>
            <p className="text-xs leading-5 mb-2" style={{ color: "var(--muted-foreground)" }}>{wish.summary}</p>
            <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              <span>{wish.date}</span>
              <span>{progress} 已完成</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
              <div className="h-full rounded-full" style={{ width: `${(completedCount / wish.todos.length) * 100}%`, background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="space-y-2.5 mb-4">
                  {wish.todos.map((todo) => (
                    <button
                      key={todo.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTodo(wish.id, todo.id);
                      }}
                      className="w-full flex items-center gap-2.5 text-left"
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]" style={{ background: todo.completed ? "var(--primary)" : "var(--secondary)", color: todo.completed ? "var(--background)" : "var(--muted-foreground)" }}>
                        {todo.completed ? "✓" : ""}
                      </span>
                      <span className="text-sm" style={{ color: todo.completed ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onResumeWish?.(wish.scenarioId);
                    }}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "var(--background)" }}
                  >
                    去处理
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(null);
                    }}
                    className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
                  >
                    稍后
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: "var(--background)" }}>
      <ThemeSelector open={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden">
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>我的愿望</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowThemeSelector(true)} className="p-1.5 rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" /></svg>
          </button>
          <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="2" /><path d="M12 1v6m0 6v10M1 12h6m6 0h10" /><path d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4" style={{ scrollbarWidth: "none" }}>
        {(["pending", "in_progress", "completed"] as WishStatus[]).map((status) => {
          const data = grouped[status];
          if (!data.length) return null;
          return (
            <section key={status}>
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <span className="text-xs font-semibold" style={{ color: status === "completed" ? "var(--muted-foreground)" : "var(--foreground)" }}>{STATUS_COPY[status]}</span>
                <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: status === "completed" ? "var(--secondary)" : "var(--destructive)", color: status === "completed" ? "var(--muted-foreground)" : "var(--destructive-foreground)" }}>{data.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">{data.map(renderWishCard)}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
